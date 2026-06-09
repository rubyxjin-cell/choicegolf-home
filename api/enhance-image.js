// ───────────────────────────────────────────────────────────
//  Choice Golf · AI 사진 고화질 중계함수 (v2)
//  위치: 깃허브 저장소의  api/enhance-image.js  (api 폴더 안)
//  역할: admin.html에서 보낸 사진 URL을 받아 OpenAI에 보내고,
//        고화질로 새로 그려진 사진을 돌려준다.
//  ⚠️ OpenAI 키는 이 파일에 넣지 않는다. Vercel 환경변수에만 넣는다.
//  변경점: ① mini 모델(저렴) ② 자연스러운 보정 ③ 비율 자동 맞춤
// ───────────────────────────────────────────────────────────

// 사용할 모델. 더 좋은 화질 원하면 'gpt-image-1' 로 바꾸면 됨(비용 약 4배).
const MODEL = 'gpt-image-1-mini';

// 함수 최대 실행시간(초).
export const config = { maxDuration: 60 };

// 보정 지시문 (과하지 않게, 자연스럽고 진짜 사진처럼)
const PROMPT = [
  'Enhance this photograph: improve resolution and overall clarity while keeping it natural and realistic.',
  'Gently improve lighting and color so it looks like a clean, professional photo.',
  'Do NOT over-sharpen. Do NOT make edges look harsh, crispy or artificial. Keep textures soft and natural.',
  'Keep the exact same scene, composition, buildings, trees, course layout and all objects.',
  'Do NOT add, remove, or change anything. Photorealistic result.'
].join(' ');

// ── 이미지 바이트에서 가로/세로 크기 읽기 (PNG / JPEG) ──
function readImageSize(buf) {
  // PNG: 시그니처 89 50 4E 47
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    const w = ((buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19]) >>> 0;
    const h = ((buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23]) >>> 0;
    return { w, h };
  }
  // JPEG: 시그니처 FF D8
  if (buf.length > 4 && buf[0] === 0xFF && buf[1] === 0xD8) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xFF) { i++; continue; }
      const marker = buf[i + 1];
      // SOF 마커(크기 정보 들어있음): C0~CF 중 C4/C8/CC 제외
      if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
        const h = (buf[i + 5] << 8) | buf[i + 6];
        const w = (buf[i + 7] << 8) | buf[i + 8];
        return { w, h };
      }
      const len = (buf[i + 2] << 8) | buf[i + 3];
      if (len <= 0) break;
      i += 2 + len;
    }
  }
  return null;
}

// 실제 비율 → OpenAI가 지원하는 3가지 크기 중 가장 가까운 것
function pickSize(w, h) {
  if (!w || !h) return null;
  const r = w / h;
  if (r > 1.15) return '1536x1024';   // 가로
  if (r < 0.87) return '1024x1536';   // 세로
  return '1024x1024';                  // 정사각
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const KEY = process.env.OPENAI_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'OPENAI_API_KEY 미설정 (Vercel 환경변수 확인)' });

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const imageUrl = body && body.imageUrl;
    const fallbackSize = (body && body.size) || '1536x1024';
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl 없음' });

    // 1) 원본 사진 가져오기 (바이트로)
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return res.status(400).json({ error: '원본 이미지 로드 실패 (' + imgRes.status + ')' });
    const ab = await imgRes.arrayBuffer();
    const buf = new Uint8Array(ab);

    // 2) 실제 비율 읽어서 출력 크기 자동 결정 (실패하면 admin이 보낸 값)
    const dim = readImageSize(buf);
    const size = (dim && pickSize(dim.w, dim.h)) || fallbackSize;

    // 파일 형식 맞추기
    const ct = imgRes.headers.get('content-type') || 'image/png';
    const ext = (ct.includes('jpeg') || ct.includes('jpg')) ? 'jpg' : ct.includes('webp') ? 'webp' : 'png';
    const imgBlob = new Blob([ab], { type: ct });

    // 3) OpenAI 이미지 편집(고화질화) 호출
    const form = new FormData();
    form.append('model', MODEL);
    form.append('image', imgBlob, 'source.' + ext);
    form.append('prompt', PROMPT);
    form.append('size', size);
    form.append('quality', 'high');
    form.append('n', '1');

    const aiRes = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}` },
      body: form
    });

    const data = await aiRes.json();
    if (!aiRes.ok) {
      const msg = (data && data.error && data.error.message) || ('OpenAI 오류 ' + aiRes.status);
      return res.status(500).json({ error: msg });
    }

    const b64 = data && data.data && data.data[0] && data.data[0].b64_json;
    if (!b64) return res.status(500).json({ error: '결과 이미지 없음' });

    return res.status(200).json({ b64 });
  } catch (e) {
    return res.status(500).json({ error: (e && e.message) || '알 수 없는 오류' });
  }
}
