// api/ai-passport-read.js
// 여권 사진 → Anthropic API로 영문명·여권번호·생년월일·만료일 자동 추출
// POST { urls: ["https://...jpg", ...] }  (최대 10장)
// 응답 { success: true, results: [{ eng_name, passport_no, birth_date, expiry_date, nationality, sex }, ...] }

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'POST only' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ success: false, error: 'ANTHROPIC_API_KEY 미설정' });

  let urls = [];
  try {
    urls = (req.body && req.body.urls) || [];
    if (typeof urls === 'string') urls = [urls];
  } catch (e) {
    return res.status(400).json({ success: false, error: '잘못된 요청' });
  }
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ success: false, error: '이미지 주소(urls)가 없습니다' });
  }
  urls = urls.slice(0, 10); // 최대 10장

  try {
    // 1) 이미지 다운로드 → base64
    const images = [];
    for (const url of urls) {
      const r = await fetch(url);
      if (!r.ok) { images.push(null); continue; }
      const ct = (r.headers.get('content-type') || '').split(';')[0].trim();
      const mediaType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(ct)
        ? ct
        : (url.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg');
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 4.5 * 1024 * 1024) { images.push(null); continue; } // 너무 큰 파일 스킵
      images.push({ mediaType, data: buf.toString('base64') });
    }

    if (!images.some(Boolean)) {
      return res.status(400).json({ success: false, error: '이미지를 불러올 수 없습니다' });
    }

    // 2) Anthropic API 호출 (모든 이미지 한 번에)
    const content = [];
    images.forEach((img, i) => {
      if (!img) return;
      content.push({ type: 'text', text: `[이미지 ${i + 1}]` });
      content.push({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } });
    });
    content.push({
      type: 'text',
      text: `위 여권 사진들에서 정보를 읽어 JSON 배열로만 답하세요. 다른 텍스트, 마크다운 백틱 절대 금지.
각 이미지마다 하나의 객체 (이미지 순서대로, 총 ${images.filter(Boolean).length}개):
[{"image_index": 1, "eng_name": "성/이름 (예: HONG GILDONG)", "passport_no": "여권번호", "birth_date": "YYYY-MM-DD", "expiry_date": "YYYY-MM-DD", "nationality": "국적코드 (예: KOR)", "sex": "M 또는 F", "uncertain": ["흐릿하거나 확신이 없는 필드명 목록 (eng_name/passport_no/birth_date/expiry_date 중)"]}]
- MRZ(하단 기계판독영역)를 우선 참고하되 상단 인쇄 정보와 대조하세요.
- eng_name은 "성 이름" 순서, 공백 구분, 전부 대문자.
- 사진이 흐리거나 글자가 애매해서 100% 확신할 수 없는 필드는 반드시 uncertain 배열에 넣으세요. 전부 선명하면 빈 배열 [].
- 읽을 수 없는 항목은 빈 문자열 "".
- 여권이 아닌 사진이면 모든 값을 "" 로.`
    });

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content }]
      })
    });

    const aiJson = await aiRes.json();
    if (!aiRes.ok) {
      return res.status(500).json({ success: false, error: (aiJson.error && aiJson.error.message) || 'AI 응답 오류' });
    }

    let text = (aiJson.content || []).map(c => c.text || '').join('').trim();
    text = text.replace(/```json|```/g, '').trim();

    let parsed = [];
    try { parsed = JSON.parse(text); } catch (e) {
      return res.status(500).json({ success: false, error: 'AI 응답 해석 실패', raw: text.slice(0, 500) });
    }
    if (!Array.isArray(parsed)) parsed = [parsed];

    // 3) 원래 이미지 순서에 맞게 정렬 (스킵된 이미지는 빈 결과)
    const results = urls.map((url, i) => {
      if (!images[i]) return { url, eng_name: '', passport_no: '', birth_date: '', expiry_date: '', nationality: '', sex: '', uncertain: [], error: '이미지 로드 실패' };
      // 유효 이미지 중 몇 번째인지 계산
      const validIdx = images.slice(0, i + 1).filter(Boolean).length; // 1-based
      const hit = parsed.find(p => Number(p.image_index) === validIdx) || parsed[validIdx - 1] || {};
      return {
        url,
        eng_name: String(hit.eng_name || '').toUpperCase().trim(),
        passport_no: String(hit.passport_no || '').toUpperCase().replace(/\s/g, ''),
        birth_date: String(hit.birth_date || '').trim(),
        expiry_date: String(hit.expiry_date || '').trim(),
        nationality: String(hit.nationality || '').trim(),
        sex: String(hit.sex || '').trim(),
        uncertain: Array.isArray(hit.uncertain) ? hit.uncertain : []
      };
    });

    return res.status(200).json({ success: true, results });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || '서버 오류' });
  }
}
