// api/og.js
// 카톡 미리보기 이미지 실시간 생성 — 시안 1: 골프장 사진 배경 + 흰 테두리 프레임 (프리미엄 다크)
// 사용: https://choicegolf-home.vercel.app/api/og?t=상품명&who=고객명&sub=3박4일 | 4인&d=confirm
// 필요 파일: /fonts/NotoSansKR-Bold-sub.otf, /images/logo.png, /images/hero-bg.jpg, package.json(@vercel/og)

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const SITE = 'https://choicegolf-home.vercel.app';

function el(type, props, ...children) {
  const kids = children.filter((c) => c !== null && c !== undefined);
  return { type, props: { ...props, children: kids.length === 1 ? kids[0] : kids } };
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    let title = (searchParams.get('t') || '').replace(/\.png$/i, '').trim().slice(0, 40);
    if (title === '-') title = ''; // 제목 없는 이미지용 자리표시자
    const whoRaw = (searchParams.get('who') || '').trim().slice(0, 20);
    const who = whoRaw ? whoRaw.replace(/님$/, '') + ' 고객님' : '';
    const sub = (searchParams.get('sub') || '').trim().slice(0, 40);
    const isConfirm = searchParams.get('d') === 'confirm';

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
            position: 'relative',
            backgroundColor: '#122A1C',
            fontFamily: 'NotoKR',
          },
        },
        // 배경 사진 (짙은 그린 오버레이로 어둡게)
        el('img', {
          src: `${SITE}/images/hero-bg.jpg`,
          width: 800,
          height: 418,
          style: { position: 'absolute', top: '0px', left: '0px', width: '800px', height: '418px', objectFit: 'cover' },
        }),
        el('div', {
          style: {
            position: 'absolute', top: '0px', left: '0px', width: '800px', height: '418px',
            display: 'flex',
            background: 'linear-gradient(180deg, rgba(10,35,22,0.60) 0%, rgba(7,26,16,0.82) 100%)',
          },
        }),
        // 얇은 흰색 프레임
        el('div', {
          style: {
            position: 'absolute', top: '16px', left: '16px', width: '768px', height: '386px',
            display: 'flex',
            border: '1px solid rgba(255,255,255,0.55)',
            borderRadius: '4px',
          },
        }),
        // 본문
        el(
          'div',
          {
            style: {
              position: 'absolute', top: '0px', left: '0px', width: '800px', height: '418px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
          // 로고 (흰 라운드 박스)
          el(
            'div',
            {
              style: {
                display: 'flex',
                background: '#FFFFFF',
                borderRadius: '10px',
                padding: '7px 16px',
                marginBottom: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              },
            },
            el('img', { src: `${SITE}/images/logo.png`, width: 112, height: 63 })
          ),
          who
            ? el(
                'div',
                { style: { display: 'flex', fontSize: '21px', color: '#DCE8DF', marginBottom: '6px', letterSpacing: '1px' } },
                who
              )
            : null,
          el(
            'div',
            { style: { display: 'flex', fontSize: '46px', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px', letterSpacing: '2px' } },
            isConfirm ? '예약 확정서' : '골프여행 견적서'
          ),
          title
            ? el(
                'div',
                {
                  style: {
                    display: 'flex', justifyContent: 'center', textAlign: 'center',
                    fontSize: '22px', color: 'rgba(255,255,255,0.92)',
                    maxWidth: '680px', marginBottom: sub ? '8px' : '16px',
                  },
                },
                title
              )
            : null,
          sub
            ? el(
                'div',
                { style: { display: 'flex', fontSize: '18px', color: 'rgba(255,255,255,0.78)', marginBottom: '16px', letterSpacing: '1px' } },
                sub
              )
            : null,
          el('div', { style: { display: 'flex', width: '170px', height: '1px', background: 'rgba(201,169,97,0.9)', marginBottom: '12px' } }),
          el(
            'div',
            { style: { display: 'flex', fontSize: '14px', color: '#C9A961', letterSpacing: '6px' } },
            'PREMIUM GOLF JOURNEY'
          )
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
    const fb = new URL(req.url).searchParams.get('d') === 'confirm' ? 'og-confirm.png' : 'og-quote2.png';
    return Response.redirect(`${SITE}/images/${fb}`, 302);
  }
}
