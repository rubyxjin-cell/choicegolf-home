/* sunrise/api/c.js — 견적서 고객 발송용 짧은 링크 (2026-09-18)
   https://sunskygolf.com/q/<견적ID>  →  (vercel.json rewrite) /api/c?q=<견적ID>
   견적서 페이지(/agt/quote.html)를 그대로 내보내되 <head>의 제목·OG(카톡 미리보기)만 "OOO 고객님 투어 견적서" + 시안 이미지(/api/og)로 바꿔 줌.
   처음엔 OG만 주고 quote.html로 이동시키는 방식이었는데, 카톡 PC·스크래퍼가 이동을 따라가 quote.html의 기본 카드를 긁어 가서
   이동 없이 이 주소에서 바로 견적서를 그리도록 바꿈 (2026-09-18 오후). 견적 데이터: yg_settings key 'ssq_'+id (AGT 포털 ssq.js 와 동일) */
const SB_URL = 'https://qmzrpyyadoajwziqachm.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtenJweXlhZG9hand6aXFhY2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDI0NDcsImV4cCI6MjA4OTc3ODQ0N30.CI6ZFvNa2TRa0XqwnrXKL9x3ZHXfKg6GaNwJhqYvCmc';
const OG_V = '1';   /* 이미지 디자인 바꾸면 +1 (카톡이 같은 주소 이미지를 캐시함) */

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = (ds) => { const m = String(ds || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${Number(m[2])}월 ${Number(m[3])}일` : ''; };
const nights = (a, b) => { if (!a || !b) return 0; const n = Math.round((new Date(b) - new Date(a)) / 86400000); return n > 0 ? n : 0; };

/* 견적서 페이지 원본 — 같은 배포의 /agt/quote.html 을 받아 잠깐 캐시 (함수가 살아 있는 동안) */
let pageCache = { at: 0, html: '' };
async function quotePage(site){
  if (pageCache.html && Date.now() - pageCache.at < 5 * 60 * 1000) return pageCache.html;
  const r = await fetch(`${site}/agt/quote.html`, { headers: { 'x-ssq-internal': '1' } });
  if (!r.ok) throw new Error('quote.html ' + r.status);
  const html = await r.text();
  if (!/<head>/i.test(html) || !/id="stage"/.test(html)) throw new Error('quote.html shape');
  pageCache = { at: Date.now(), html };
  return html;
}

module.exports = async (req, res) => {
  const id = String((req.query && req.query.q) || '').trim();
  const host = (req.headers && req.headers.host) || 'sunskygolf.com';
  const SITE = 'https://' + host;
  const v = String((req.query && req.query.v) || '').trim();
  const r = String((req.query && req.query.r) || '').replace(/[^a-z0-9]/gi, '');   /* 미리보기 캐시 꼬리표 — og:url에도 같이 붙여 카톡이 옛 주소 카드로 합치지 않게 */
  const dest = `${SITE}/agt/quote.html?q=${encodeURIComponent(id)}${/^[a-z]+$/.test(v) ? '&v=' + v : ''}`;

  let title = '투어 견적서 | 썬앤스카이골프코리아';
  let desc = '썬라이즈 라군 · 스카이밸리 골프 투어 견적서를 확인해 주세요.';
  let who = '';
  if (/^[a-z0-9]{6,24}$/i.test(id)) {
    try {
      const rr = await fetch(`${SB_URL}/rest/v1/yg_settings?key=eq.ssq_${encodeURIComponent(id)}&select=value`, { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
      const rows = await rr.json();
      const q = Array.isArray(rows) && rows[0] && rows[0].value;
      if (q && !q.del) {
        who = String(q.name || '').trim().replace(/\s*(고객님|님)$/, '');
        title = (who ? `${who} 고객님 투어 견적서` : '투어 견적서') + ' | 썬앤스카이골프코리아';
        const parts = [];
        if (q.s) parts.push(`${md(q.s)} 출발`);
        /* 박수는 견적서(ssq.js hotelNights)와 같은 규칙: 밤 비행기(+1일 도착)·새벽 출발(06시 전)·항공 미포함+시각 없음이면 −1박 */
        const inb = (q.inb && typeof q.inb === 'object') ? q.inb : {};
        const dep = String(inb.dep || ''), early = /^\d{2}:\d{2}$/.test(dep) && dep < '06:00';
        const noAir = (q.airSep || !(Number(q.air) > 0)) && !inb.dep && !inb.arr;
        const raw = nights(q.s, q.e), n = raw - ((inb.p1 || early || noAir) ? 1 : 0);
        if (n > 0) parts.push(`${n}박 ${raw + 1}일`);
        if (Number(q.pax) > 0) parts.push(`${Number(q.pax)}명`);
        parts.push(q.hotel === 'skyvalley' ? '스카이밸리' : '썬라이즈 라군');
        desc = parts.join(' · ') + ' — 고객님을 위한 맞춤 골프 여행 견적입니다.';
      }
    } catch (e) { /* 조회 실패 시 기본 문구 */ }
  }
  const ogp = new URLSearchParams({ v: OG_V }); if (who) ogp.set('who', who);
  const img = `${SITE}/api/og?${ogp.toString()}`;
  const t = esc(title), d = esc(desc);
  const url = `${SITE}/q/${esc(id)}${r ? '?r=' + esc(r) : ''}`;
  const head = [
    `<title>${t}</title>`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="썬앤스카이골프코리아">',
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta property="og:image" content="${img}">`,
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:url" content="${url}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    `<meta name="twitter:image" content="${img}">`,
  ].join('\n');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');

  /* 견적서 페이지를 이 주소에서 바로 — 제목·OG만 갈아 끼우고, 상대 경로(ssq.css·ssq.js)는 /agt/ 절대 경로로, 견적 ID는 window.__SSQ_ID 로 넘김 */
  try {
    let html = await quotePage(SITE);
    html = html
      .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
      .replace(/<meta property="og:[^"]*" content="[^"]*">\s*/gi, '')
      .replace(/<head>/i, `<head>\n<script>window.__SSQ_ID=${JSON.stringify(id)};</script>`)
      .replace(/(<meta name="color-scheme"[^>]*>)/i, `$1\n${head}`)
      .replace(/href="ssq\.css/g, 'href="/agt/ssq.css')
      .replace(/src="ssq\.js/g, 'src="/agt/ssq.js');
    if (!html.includes(head)) html = html.replace(/<head>/i, `<head>\n${head}`);   /* color-scheme 줄이 없을 때 대비 */
    res.status(200).send(html);
    return;
  } catch (e) { /* 원본을 못 받으면 예전 방식: OG만 주고 견적서로 이동 */ }

  res.status(200).send(`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${head}
<script>location.replace(${JSON.stringify(dest)});</script>
</head>
<body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#1b2a41">
견적서를 여는 중입니다… <a href="${esc(dest)}">바로 열기</a>
</body>
</html>`);
};
