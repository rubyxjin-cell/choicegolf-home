// api/c.js
// 고객 발송용 공유 링크 — 카톡 미리보기에 "OO님 예약 확정서" 표시 후 문서로 즉시 이동
// 사용: https://choicegolf-home.vercel.app/api/c?id=confirm-japan-xxxx
// 위치: choicegolf-home 저장소의 api/c.js

const SUPABASE_URL = 'https://qmzrpyyadoajwziqachm.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtenJweXlhZG9hand6aXFhY2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDI0NDcsImV4cCI6MjA4OTc3ODQ0N30.CI6ZFvNa2TRa0XqwnrXKL9x3ZHXfKg6GaNwJhqYvCmc';
const SITE = 'https://choicegolf-home.vercel.app';

function escHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  const q = req.query || {};
  const id = String(q.id || '').trim();

  // 🆕 시뮬레이터 옵션 파라미터를 목적지 링크에 그대로 전달 (맞춤 견적서 링크)
  const params = new URLSearchParams();
  params.set('id', id);
  ['date', 'nights', 'hotel', 'course'].forEach(k => {
    if (q[k]) params.set(k, String(q[k]));
  });
  const isCustomQuote = /^\d{4}-\d{2}-\d{2}$/.test(String(q.date || ''));
  const dest = `${SITE}/product.html?${params.toString()}`;

  // 기본값 (조회 실패 시)
  let title = '초이스골프 | 프리미엄 골프여행';
  let desc = '여행 일정과 안내 사항을 확인해 주세요.';
  let img = `${SITE}/images/og-confirm.png`;

  if (isCustomQuote) {
    title = '견적서 | 초이스골프';
    desc = '고객님을 위해 준비한 견적입니다. 일정과 요금을 확인해 주세요.';
    img = `${SITE}/images/og-quote2.png`;
  }

  if (id && !isCustomQuote) {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/home_products?id=eq.${encodeURIComponent(id)}&select=customer_name,title,is_customer_quote`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
      );
      const rows = await r.json();
      const p = Array.isArray(rows) ? rows[0] : null;
      if (p) {
        const who = (p.customer_name || '').trim();
        const isConfirm = id.startsWith('confirm-');
        if (isConfirm) {
          title = who ? `${who} 예약 확정서 | 초이스골프` : '예약 확정서 | 초이스골프';
          desc = p.title
            ? `${p.title} — 여행 일정과 첨부 서류를 확인해 주세요.`
            : '여행 일정과 첨부 서류를 확인해 주세요.';
          img = `${SITE}/images/og-confirm.png`;
        } else if (p.is_customer_quote) {
          title = who ? `${who} 견적서 | 초이스골프` : '견적서 | 초이스골프';
          desc = p.title
            ? `${p.title} — 초이스골프에서 준비한 견적을 확인해 주세요.`
            : '초이스골프에서 준비한 견적을 확인해 주세요.';
          // 🆕 상품명이 이미지 안에 실시간으로 박힘
          img = p.title
            ? `${SITE}/api/og?t=${encodeURIComponent(p.title)}`
            : `${SITE}/images/og-quote2.png`;
        } else if (p.title) {
          title = `${p.title} | 초이스골프`;
        }
      }
    } catch (e) { /* 조회 실패 시 기본값 사용 */ }
  }

  const t = escHtml(title), d = escHtml(desc);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(200).send(`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${t}</title>
<meta property="og:type" content="website">
<meta property="og:site_name" content="초이스골프">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="418">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${img}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0;url=${dest}">
<script>location.replace(${JSON.stringify(dest)});</script>
</head>
<body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#1c3a63">
이동 중입니다... <a href="${dest}">바로 열기</a>
</body>
</html>`);
}
