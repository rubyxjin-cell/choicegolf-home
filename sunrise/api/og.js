// sunrise/api/og.js — 썬앤스카이 견적서 카톡 미리보기 이미지 (1200×630, 사장님 시안 2026-09-18)
// 사용: https://sunskygolf.com/api/og?who=김민수&v=1   (who 없으면 "투어 견적서"만)
// 구성: 초록 테두리 → 아이보리 바탕 + 골드 얇은 프레임(모서리 ㄱ자) → 로고 → PERSONAL GOLF JOURNEY → "OOO 고객님" → "투어 견적서" → 짧은 골드 선 → 부제
// 필요: sunrise/package.json(@vercel/og), sunrise/fonts/NotoSansKR-Bold-sub.otf, 로고는 스토리지 sunrise-logo2.png

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const LOGO = 'https://qmzrpyyadoajwziqachm.supabase.co/storage/v1/object/public/golf-images/sunrise-logo2.png';
const FALLBACK = 'https://qmzrpyyadoajwziqachm.supabase.co/storage/v1/object/public/golf-images/sunrise-main2.jpg';
const GREEN = '#1e6b45', IVORY = '#f8f6f1', GOLD = '#a8853f', GOLD_LT = '#c9a961', INK = '#1a1a1a', GRAY = '#4d4a44';

function el(type, props, ...children) {
  const kids = children.filter((c) => c !== null && c !== undefined && c !== false);
  return { type, props: { ...props, children: kids.length === 1 ? kids[0] : kids } };
}
/* 모서리 ㄱ자 장식 */
function corner(pos) {
  const s = { position: 'absolute', width: '26px', height: '26px', display: 'flex' };
  const b = '2px solid ' + GOLD_LT;
  if (pos === 'tl') Object.assign(s, { top: '0px', left: '0px', borderTop: b, borderLeft: b });
  if (pos === 'tr') Object.assign(s, { top: '0px', right: '0px', borderTop: b, borderRight: b });
  if (pos === 'bl') Object.assign(s, { bottom: '0px', left: '0px', borderBottom: b, borderLeft: b });
  if (pos === 'br') Object.assign(s, { bottom: '0px', right: '0px', borderBottom: b, borderRight: b });
  return el('div', { style: s });
}

export default async function handler(req) {
  try {
    const u = new URL(req.url);
    const whoRaw = (u.searchParams.get('who') || '').trim().slice(0, 16).replace(/\s*(고객님|님)$/, '');
    const who = whoRaw ? whoRaw + ' 고객님' : '';
    const fontRes = await fetch(`${u.origin}/fonts/NotoSansKR-Bold-sub.otf`);
    if (!fontRes.ok) throw new Error('font');
    const fontData = await fontRes.arrayBuffer();

    return new ImageResponse(
      el('div', { style: { width: '1200px', height: '630px', display: 'flex', backgroundColor: GREEN, padding: '26px', fontFamily: 'NotoKR' } },
        el('div', { style: { flex: 1, display: 'flex', backgroundColor: IVORY, position: 'relative', padding: '22px' } },
          /* 골드 프레임 */
          el('div', { style: { position: 'absolute', top: '22px', left: '22px', right: '22px', bottom: '22px', border: '1px solid ' + GOLD_LT, display: 'flex' } }),
          el('div', { style: { position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', display: 'flex' } }, corner('tl'), corner('tr'), corner('bl'), corner('br')),
          /* 본문 */
          el('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
            el('img', { src: LOGO, width: 221, height: 160, style: { width: '221px', height: '160px', marginBottom: '14px' } }),
            el('div', { style: { display: 'flex', fontSize: '22px', color: GOLD, letterSpacing: '9px', marginBottom: '14px' } }, 'PERSONAL GOLF JOURNEY'),
            who
              ? el('div', { style: { display: 'flex', fontSize: '92px', color: INK, lineHeight: 1.05, letterSpacing: '-1px', marginBottom: '8px' } }, who)
              : null,
            el('div', { style: { display: 'flex', fontSize: who ? '60px' : '92px', color: GOLD, lineHeight: 1.1, letterSpacing: '2px' } }, '투어 견적서'),
            el('div', { style: { display: 'flex', width: '140px', height: '2px', backgroundColor: GOLD_LT, marginTop: '22px', marginBottom: '18px' } }),
            el('div', { style: { display: 'flex', fontSize: '28px', color: GRAY, letterSpacing: '3px' } }, '고객님을 위한 맞춤 골프 여행')
          )
        )
      ),
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'NotoKR', data: fontData, weight: 700, style: 'normal' }],
        headers: { 'Cache-Control': 'public, max-age=86400' },
      }
    );
  } catch (e) {
    return Response.redirect(FALLBACK, 302);
  }
}
