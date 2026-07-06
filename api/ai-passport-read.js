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
    // 1) 이미지 다운로드 → base64 (🆕 큰 파일은 Supabase 축소본으로 자동 대체)
    const MAX_BYTES = 3.5 * 1024 * 1024; // AI 전송 한계 (base64 부풀림 감안)
    const grab = async (u) => {
      try {
        const r = await fetch(u);
        if (!r.ok) return null;
        const ct = (r.headers.get('content-type') || '').split(';')[0].trim();
        const mediaType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(ct)
          ? ct
          : (u.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg');
        const buf = Buffer.from(await r.arrayBuffer());
        return { mediaType, buf };
      } catch (e) { return null; }
    };
    const images = [];
    for (const url of urls) {
      let got = await grab(url);
      // 너무 크면: Supabase 이미지 변환(축소본)으로 다시 시도
      if ((!got || got.buf.length > MAX_BYTES) && url.includes('/storage/v1/object/public/')) {
        const small = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
          + (url.includes('?') ? '&' : '?') + 'width=2000&quality=88';
        const got2 = await grab(small);
        if (got2 && got2.buf.length <= MAX_BYTES) got = got2;
      }
      if (!got || got.buf.length > MAX_BYTES) { images.push(null); continue; }
      images.push({ mediaType: got.mediaType, data: got.buf.toString('base64') });
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
- 반드시 이미지 개수와 똑같은 ${images.filter(Boolean).length}개의 객체를 만드세요. 하나라도 빠뜨리면 안 됩니다.
- 같은 사람이거나 비슷해 보이는 여권이라도 절대 합치지 말고 이미지마다 별도 객체로 만드세요.
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
        max_tokens: 4000,
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

    // 4) 🆕 AI가 빠뜨린 장이 있으면 그 장만 1장씩 다시 읽기 (최대 3장)
    let retried = 0;
    for (let i = 0; i < results.length; i++) {
      if (retried >= 5) break;
      const r0 = results[i];
      if (!images[i]) continue; // 이미지 자체가 실패한 건 재시도 불가
      // 정상 판정: 영문명 있음 + 여권번호 8자 이상 + 생년월일·만료일 있음
      const okRow = r0.eng_name && r0.passport_no && r0.passport_no.length >= 8 && r0.birth_date && r0.expiry_date;
      if (okRow) continue;
      retried++;
      try {
        const singleContent = [
          { type: 'image', source: { type: 'base64', media_type: images[i].mediaType, data: images[i].data } },
          { type: 'text', text: `이 여권 사진 1장의 정보를 JSON 객체 하나로만 답하세요. 다른 텍스트, 마크다운 백틱 금지.
{"eng_name": "성 이름 (대문자)", "passport_no": "여권번호", "birth_date": "YYYY-MM-DD", "expiry_date": "YYYY-MM-DD", "nationality": "KOR", "sex": "M 또는 F", "uncertain": ["확신 없는 필드명"]}
- 하단 MRZ 두 줄을 글자 단위로 정확히 판독하세요. 한국 여권번호는 영문자 1개 + 숫자/영문 8자리로 총 9자입니다. 절대 중간에 자르지 마세요.
- 읽을 수 없는 항목은 "". 여권이 아니면 모든 값 "".` }
        ];
        const rRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 800, messages: [{ role: 'user', content: singleContent }] })
        });
        const rJson = await rRes.json();
        if (!rRes.ok) continue;
        let rText = (rJson.content || []).map(x => x.text || '').join('').trim().replace(/```json|```/g, '').trim();
        const hit = JSON.parse(rText);
        results[i] = {
          url: r0.url,
          eng_name: String(hit.eng_name || '').toUpperCase().trim(),
          passport_no: String(hit.passport_no || '').toUpperCase().replace(/\s/g, ''),
          birth_date: String(hit.birth_date || '').trim(),
          expiry_date: String(hit.expiry_date || '').trim(),
          nationality: String(hit.nationality || '').trim(),
          sex: String(hit.sex || '').trim(),
          uncertain: Array.isArray(hit.uncertain) ? hit.uncertain : []
        };
      } catch (e) { /* 재시도 실패 시 빈 줄 유지 */ }
    }

    return res.status(200).json({ success: true, results });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || '서버 오류' });
  }
}
