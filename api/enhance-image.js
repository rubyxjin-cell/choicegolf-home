// ───────────────────────────────────────────────────────────
//  Choice Golf · AI 사진 고화질 중계함수
//  위치: 깃허브 저장소의  api/enhance-image.js  (api 폴더 안)
//  역할: admin.html에서 보낸 사진 URL을 받아 OpenAI에 보내고,
//        고화질로 새로 그려진 사진을 돌려준다.
//  ⚠️ OpenAI 키는 이 파일에 넣지 않는다. Vercel 환경변수에만 넣는다.
// ───────────────────────────────────────────────────────────

// 사용할 모델. 나중에 더 좋은 모델로 바꾸려면 이 한 줄만 수정.
const MODEL = 'gpt-image-1';

// 함수 최대 실행시간(초). 고화질 생성이 오래 걸려서 넉넉히 둠.
export const config = { maxDuration: 60 };

// 보정 지시문 (장면은 그대로, 화질만 끌어올리도록)
const PROMPT = [
  'Upscale and enhance this photograph to high resolution.',
  'Greatly improve sharpness, clarity, lighting and color vibrancy so it looks like a professional high-quality photo.',
  'Keep the exact same scene, composition, buildings, trees, course layout and all objects.',
  'Do NOT add, remove, or change any object. Photorealistic result.'
].join(' ');

export default async function handler(req, res) {
  // 브라우저에서 호출 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const KEY = process.env.OPENAI_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'OPENAI_API_KEY 미설정 (Vercel 환경변수 확인)' });

  try {
    // 본문 파싱 (Vercel이 객체로 줄 때도, 문자열로 줄 때도 대비)
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const imageUrl = body && body.imageUrl;
    const size = (body && body.size) || '1536x1024';
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl 없음' });

    // 1) 원본 사진 가져오기
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return res.status(400).json({ error: '원본 이미지 로드 실패 (' + imgRes.status + ')' });
    const imgBlob = await imgRes.blob();

    // 2) OpenAI 이미지 편집(고화질화) 호출
    const form = new FormData();
    form.append('model', MODEL);
    form.append('image', imgBlob, 'source.png');
    form.append('prompt', PROMPT);
    form.append('size', size);     // 1536x1024(가로) / 1024x1536(세로) / 1024x1024(정사각)
    form.append('quality', 'high'); // 고화질
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

    // 3) 고화질 PNG(base64) 그대로 admin에 반환
    return res.status(200).json({ b64 });
  } catch (e) {
    return res.status(500).json({ error: (e && e.message) || '알 수 없는 오류' });
  }
}
