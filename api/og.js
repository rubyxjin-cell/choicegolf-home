// api/og.js
// 카톡 미리보기 이미지 실시간 생성 — 상품명이 이미지 안에 자동으로 박힘
// 사용: https://choicegolf-home.vercel.app/api/og?t=상품명
// 위치: choicegolf-home 저장소의 api/og.js  (package.json 필요)

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const SITE = 'https://choicegolf-home.vercel.app';

// 한글 폰트 로드 (구글폰트에서 필요한 글자만 작게 받아옴)
async function loadFont(text) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@800&text=${encodeURIComponent(text)}`;
    const css = await (
      await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
        },
      })
    ).text();
    const m = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype|woff)'\)/);
    if (!m) return null;
    const r = await fetch(m[1]);
    if (!r.ok) return null;
    return await r.arrayBuffer();
  } catch (e) {
    return null;
  }
}

function el(type, props, ...children) {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  let title = (searchParams.get('t') || '').trim().slice(0, 40);

  const tagline = 'PREMIUM GOLF JOURNEY  ·  1533-3160';
  const fontData = await loadFont(title + tagline);

  // 폰트를 못 받아오면 → 기본 이미지로 대체 (안전장치)
  if (!fontData) {
    return Response.redirect(`${SITE}/images/og-quote2.png`, 302);
  }

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
        style: { marginBottom: '18px' },
      }),
      title
        ? el(
            'div',
            {
              style: {
                fontSize: '34px',
                fontWeight: 800,
                color: '#1C3A63',
                textAlign: 'center',
                maxWidth: '700px',
                marginBottom: '20px',
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
          marginBottom: '16px',
        },
      }),
      el(
        'div',
        { style: { fontSize: '17px', color: '#6E8296', letterSpacing: '2px' } },
        tagline
      )
    ),
    {
      width: 800,
      height: 418,
      fonts: [{ name: 'NotoKR', data: fontData, weight: 800, style: 'normal' }],
      headers: { 'Cache-Control': 'public, max-age=86400' },
    }
  );
}
