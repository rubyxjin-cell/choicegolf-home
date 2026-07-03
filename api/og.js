// api/og.js
// 카톡 미리보기 이미지 실시간 생성 — 상품명이 이미지 안에 자동으로 박힘
// 사용: https://choicegolf-home.vercel.app/api/og?t=상품명
// 필요 파일: /fonts/NotoSansKR-Bold-sub.otf, /images/logo.png, package.json(@vercel/og)

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const SITE = 'https://choicegolf-home.vercel.app';

function el(type, props, ...children) {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = (searchParams.get('t') || '').trim().slice(0, 40);

    // 사이트에 올려둔 한글 폰트 불러오기
    const fontRes = await fetch(`${SITE}/fonts/NotoSansKR-Bold-sub.otf`);
    if (!fontRes.ok) throw new Error('font');
    const fontData = await fontRes.arrayBuffer();

    return new ImageResponse(
      el(
        'div',
        {
          style: {
            width: '800px',
            height: '418px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #DEECF7 0%, #FAF7F0 100%)',
            fontFamily: 'NotoKR',
          },
        },
        el('img', {
          src: `${SITE}/images/logo.png`,
          width: 250,
          height: 141,
          style: { marginBottom: '14px' },
        }),
        title
          ? el(
              'div',
              {
                style: {
                  fontSize: '34px',
                  fontWeight: 700,
                  color: '#1C3A63',
                  textAlign: 'center',
                  maxWidth: '700px',
                  marginBottom: '18px',
                },
              },
              title
            )
          : null,
        el('div', {
          style: {
            width: '140px',
            height: '2px',
            background: '#C9A961',
            marginBottom: '14px',
          },
        }),
        el(
          'div',
          { style: { fontSize: '17px', color: '#6E8296', letterSpacing: '2px' } },
          'PREMIUM GOLF JOURNEY  ·  1533-3160'
        )
      ),
      {
        width: 800,
        height: 418,
        fonts: [{ name: 'NotoKR', data: fontData, weight: 700, style: 'normal' }],
        headers: { 'Cache-Control': 'public, max-age=86400' },
      }
    );
  } catch (e) {
    // 문제 생기면 기본 이미지로 대체 (안전장치)
    return Response.redirect(`${SITE}/images/og-quote2.png`, 302);
  }
}
