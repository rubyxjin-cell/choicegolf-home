// api/parse-confirm.js
// 현지(랜드사) 확정서·일정표 텍스트 → 확정서 폼 JSON 자동 변환 (Anthropic API)
// 위치: choicegolf-home 저장소의 api/parse-confirm.js
// 필요: Vercel 환경변수 ANTHROPIC_API_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 가능합니다' });

  const { text, quote } = req.body || {};
  if (!text || !String(text).trim()) return res.status(400).json({ error: '분석할 텍스트가 없습니다' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다 (Vercel 환경변수 확인)' });

  const today = new Date().toISOString().slice(0, 10);

  const system = `당신은 한국 골프여행사가 현지(랜드사)에서 받은 확정서/일정표 텍스트를 분석해 JSON으로 변환하는 도구입니다.
반드시 JSON 객체만 출력하세요. 마크다운 코드블록(\`\`\`), 설명문, 인사말 절대 금지.

오늘 날짜: ${today}

출력 형식:
{
  "customer_name": "고객명 (예: 강승현님 외 1인 / 없으면 빈문자열)",
  "pax": 인원수 (숫자, 모르면 null),
  "departure_date": "YYYY-MM-DD (출발일. 연도가 없으면 오늘 기준 가장 가까운 미래 날짜로)",
  "nights": 박수 (숫자),
  "hotel": "호텔명 + 객실타입 + 예약번호 + 조식시간 등을 한 줄로 (예: 브리즈베이마리나 본관 1트윈룸 · 예약번호 101198668 · 조식 06:30~)",
  "picket": "피켓/미팅보드 문구 (예: 초이스골프 강승현님)",
  "dep_flight": "출발편 (예: LJ357 / 06.22 10:50 시모지공항 도착)",
  "ret_flight": "귀국편 (예: LJ358 / 06.25 12:00 시모지공항 출발)",
  "baggage": "수하물 정보 (있으면, 없으면 빈문자열)",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "",
      "events": [
        { "time": "HH:MM (없으면 빈문자열)", "text": "내용", "is_golf": false }
      ]
    }
  ],
  "notices": ["유의사항 한 항목씩 (원문의 * 표시 안내문 등)"],
  "warnings": ["사람이 꼭 확인해야 할 사항 (없으면 빈 배열)"],
  "diffs": ["기존 견적서와 달라진 점 (견적서가 제공되지 않았거나 차이가 없으면 빈 배열)"]
}

규칙:
1. is_golf는 티오프/라운드 행만 true. 그 행의 text는 "골프장명 T-OFF · 조 구성 · 플레이 방식" 형태로 정리 (예: "오션링크스 T-OFF · 2B×1조 · 셀프+카트 스루플레이").
2. 차량/기사 미팅, 공항·호텔 이동은 각각 별도의 event로 분리.
3. days 배열의 길이는 (박수+1)일과 일치해야 함. 일정 정보가 없는 날도 빈 events로 포함.
4. title은 항상 빈문자열 "".
5. 원문 내용을 누락하거나 창작하지 말 것. 원문에 없는 정보는 빈문자열 또는 null.
6. 어색한 표기는 자연스러운 한국어로 다듬되 사실(시간·이름·숫자)은 절대 바꾸지 말 것.
7. 시간이 "10:50" 형태가 아니면 HH:MM으로 변환 (예: 오전 9시 → 09:00).
8. 현지 문서는 오타·띄어쓰기 오류·잘못된 내용이 섞여 있을 수 있습니다. 의미를 추론해 정리하되, 단순 띄어쓰기 교정을 제외한 모든 추론·교정·이상 징후는 warnings에 기록하세요.
9. warnings에 반드시 점검해 기록할 항목:
   - 연도가 없어 추정한 경우 (예: "연도 미표기 → 2026년으로 추정")
   - 날짜와 요일이 안 맞는 경우 (예: "6월23일을 '수'로 표기했으나 실제는 화요일")
   - 시간 순서가 이상한 경우 (예: 공항 도착보다 티오프가 빠름, 귀국편보다 늦은 일정)
   - 박수와 일정 일수가 안 맞는 경우 (예: "3박인데 일정이 5일치")
   - 인원수와 조 구성이 안 맞는 경우 (예: "2인인데 4B*1조로 표기됨")
   - 원문에 없어 비워둔 항목 (예: "수하물 정보 없음 → 비워둠")
   - 시간이 명시되지 않아 빈칸 처리한 일정 (예: "6/23 차량 시간 미지정 → 시간 빈칸")
   - 의미가 바뀔 수 있는 오타를 교정한 경우 (원문 표기 → 교정 표기 형태로)
   - 호텔명·골프장명이 불분명하거나 비표준 표기인 경우
   문제가 전혀 없으면 빈 배열 [].
10. warnings는 사장님이 바로 이해하도록 짧고 구체적인 한국어 문장으로.
11. [기존 견적서 내용]이 함께 제공된 경우, 현지 확정서와 꼼꼼히 비교해 실질적인 차이를 diffs에 기록하세요:
    - 날짜·박수·일수 차이 (예: "견적은 3박4일 → 현지 확정은 2박3일")
    - 골프장 구성·라운드 수 차이 (예: "견적의 시기라베이가 현지 확정에는 없음 / 라운드 3회 → 2회")
    - 호텔·객실 타입 차이
    - 항공편·시간 차이
    - 인원수 차이
    - 견적에 명시됐던 티오프 시간과 현지 확정 시간이 크게 다른 경우
    - 일정 순서가 바뀐 경우
    단순 표현·띄어쓰기 차이, 견적엔 없던 정보가 새로 추가된 것(피켓명·예약번호 등)은 diffs에 넣지 마세요. 고객에게 안내한 내용과 실제 확정이 달라진 것만 기록합니다.
    diffs도 짧고 구체적인 한국어 문장으로, "견적 → 현지" 형태로 작성하세요.
12. 견적서가 제공되지 않았으면 diffs는 빈 배열 [].`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system,
        messages: [{
          role: 'user',
          content: quote
            ? `[기존 견적서 내용 — 고객에게 이미 안내한 내용 (JSON)]\n${JSON.stringify(quote, null, 1)}\n\n[현지에서 받은 확정서 원문]\n${String(text)}`
            : String(text)
        }]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: (data.error && data.error.message) || 'Anthropic API 오류' });
    }

    let out = (data.content || []).map(c => c.text || '').join('');
    out = out.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(out);
    } catch (e) {
      return res.status(500).json({ error: '분석 결과 해석 실패 — 다시 시도해주세요' });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || '서버 오류' });
  }
}
