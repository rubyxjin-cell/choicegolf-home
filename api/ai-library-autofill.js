// /api/ai-library-autofill.js
// Vercel Serverless Function - 호텔/골프장 정보 AI 자동 작성
// 사용: admin.html → POST /api/ai-library-autofill { name, name_kr, category, country, region }

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name = '', name_kr = '', category = 'hotel', country = '', region = '' } = req.body || {};

    if (!name && !name_kr) {
      return res.status(400).json({ error: '호텔/골프장 이름을 입력하세요' });
    }

    const searchTerm = name_kr || name;
    const isHotel = category === 'hotel';
    const isGolf = category === 'golf';

    // 시스템 프롬프트
    let systemPrompt = `당신은 한국 골프 여행사 "초이스골프"의 콘텐츠 작성 도우미입니다.
주어진 호텔/골프장을 웹검색으로 확인한 후, 한국 골퍼 대상 소개글을 JSON으로 출력하세요.

응답 형식 (마크다운 코드블록 X, 순수 JSON만):
{
  "description": "한국어 소개글 약 250~350자. 친절하고 자연스러운 어투. 위치/시설/특징/매력 포함.",`;

    if (isHotel) {
      systemPrompt += `
  "stars": 호텔 등급 (3 / 4 / 5 중 하나의 숫자, 못 찾으면 null),
  "tagline": "10~20자 짧은 한 줄 강조 카피 (예: '미야코지마 5성급 럭셔리 해변 호텔')"`;
    } else if (isGolf) {
      systemPrompt += `
  "holes": 골프장 총 홀수 — 숫자만 입력 (예: 18, 27, 36). 웹검색 결과에 나오면 반드시 입력, 정말 못 찾을 때만 null,
  "par": 코스 파 — 숫자만 입력 (예: 72, 71). 웹검색 결과에 나오면 반드시 입력, 정말 못 찾을 때만 null,
  "yards": 총 야드 — 숫자만 입력 (콤마·단위 없이, 예: 6800). 웹검색 결과에 나오면 반드시 입력, 정말 못 찾을 때만 null`;
    }

    systemPrompt += `
}

★ 추측·창작 금지! 웹검색으로 확인된 정보만 입력하세요.
★ 단, 홀수·파·야드는 골프장 공식/예약 사이트에 대부분 공개되어 있으니, 웹검색으로 확인되면 반드시 숫자로 채우세요. 검색해도 정말 안 나올 때만 null.
★ 숫자 항목(holes/par/yards/stars)은 단위·콤마·한글 없이 순수 숫자만 출력하세요.
★ description은 한국어로 자연스럽게. 일본어/영어 단어 남용 금지.
★ 마크다운 코드블록 없이 순수 JSON만 출력하세요.`;

    const userMessage = `"${searchTerm}"${name && name !== searchTerm ? ` (영문: ${name})` : ''} - 카테고리: ${isHotel ? '호텔' : isGolf ? '골프장' : '시설'}, 국가: ${country || '?'}, 지역: ${region || '?'}\n\n웹검색으로 정보를 확인한 후 위 JSON 형식으로만 출력하세요.`;

    // Anthropic API 호출 (Claude + web search)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        tools: [
          { type: 'web_search_20250305', name: 'web_search' }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(500).json({ error: 'AI 호출 실패: ' + errText.substring(0, 300) });
    }

    const data = await response.json();

    // 응답에서 텍스트 블록만 추출
    const textBlocks = (data.content || [])
      .filter(item => item.type === 'text')
      .map(item => item.text);
    const fullText = textBlocks.join('\n').trim();

    // 코드블록 제거
    let cleanText = fullText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // 🆕 설명 문장이 섞여도 JSON 객체 부분만 추출 ({ ... } 첫 시작 ~ 마지막 끝)
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      cleanText = cleanText.slice(firstBrace, lastBrace + 1);
    }

    let result;
    try {
      result = JSON.parse(cleanText);
    } catch (e) {
      console.error('JSON 파싱 실패:', fullText);
      return res.status(500).json({
        error: 'AI 응답 파싱 실패',
        raw: (fullText || '').substring(0, 500)
      });
    }

    return res.status(200).json({ success: true, data: result });

  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ error: e.message || '서버 오류' });
  }
}
