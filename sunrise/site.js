/* ==========================================================================
 * SUNRISE LAGOON & SKY VALLEY · 회원권 분양 사이트 공통 스크립트
 * - 헤더 / 모바일 드로어 / 푸터 / 플로팅 버튼을 4개 페이지에 공통 주입
 * - 각 페이지 <body data-page="home|golf|hotel|membership"> 로 현재 메뉴 표시
 * - 이 파일 하나만 고치면 전 페이지에 반영됨
 * ========================================================================== */
(function () {
  'use strict';

  // ※ 이 사이트는 (주)썬앤스카이골프코리아 단독 브랜드 — 초이스골프와 무관 (링크·표기 금지)
  var TEL = '1533-3160';
  var TEL_HREF = 'tel:15333160';
  var KAKAO = 'https://pf.kakao.com/_xaWiKn/chat';

  var BIZ = {
    name: '주식회사 썬앤스카이골프코리아',
    ceo: '김강성',
    no: '666-87-04092',
    corpNo: '110111-0967494',
    addr: '서울특별시 서초구 강남대로101안길 18-1, 201호 (잠원동, 잠원빌딩)',
    biz: '여행알선업 · 여행보조및예약서비스업 · 무형재산권중개업(골프회원권 매매 및 중개)',
    copy: 'SUN &amp; SKY GOLF KOREA CO., LTD.'
  };

  var MENU = [
    // 메인(index.html)이 곧 회원권 안내 페이지 — "분양 안내" 항목은 두지 않음
    { key: 'home',  href: 'index.html', kr: '회원권 안내', en: 'Membership' },
    { key: 'golf',  href: 'golf.html',  kr: '골프장 소개', en: 'Golf Course' },
    { key: 'hotel', href: 'hotel.html', kr: '호텔 소개', en: 'Stay' }
  ];

  var page = (document.body.getAttribute('data-page') || '').trim();

  /* ---------- 폰 가로 회전 시 PC 모드로 넘어가지 않게 (layout.js와 동일 규칙) ---------- */
  (function () {
    try {
      var mv = document.querySelector('meta[name="viewport"]');
      if (!mv || !window.matchMedia) return;
      if (!window.matchMedia('(pointer: coarse)').matches) return;
      if (Math.min(screen.width, screen.height) > 500) return;
      var DEF = 'width=device-width, initial-scale=1.0';
      var apply = function () {
        var landscape = window.matchMedia('(orientation: landscape)').matches;
        var wide = Math.max(screen.width, screen.height) > 900;
        var want = (landscape && wide) ? 'width=900' : DEF;
        if (mv.getAttribute('content') !== want) mv.setAttribute('content', want);
      };
      apply();
      window.addEventListener('orientationchange', function () { setTimeout(apply, 60); });
      window.addEventListener('resize', apply);
    } catch (e) {}
  })();

  /* ---------- 헤더 ---------- */
  function gnbHtml(cls, withEn) {
    return MENU.map(function (m) {
      var on = (m.key === page) ? ' on' : '';
      var en = withEn ? '<small>' + m.en + '</small>' : '';
      return '<a class="' + cls + on + '" href="' + m.href + '">' + en + m.kr + '</a>';
    }).join('');
  }

  var headerHtml =
    '<header class="hd" id="sHd">' +
      '<div class="hd-in">' +
        '<a class="hd-logo" href="index.html">' +
          '<b>SUNRISE LAGOON<i>&amp;</i>SKY VALLEY</b>' +
          '<small>BANGKOK · THAILAND</small>' +
        '</a>' +
        '<nav class="gnb">' + gnbHtml('', false) + '</nav>' +
        '<div class="hd-right">' +
          '<a class="hd-tel" href="' + TEL_HREF + '"><span>CALL</span>' + TEL + '</a>' +
          '<button class="burger" id="sBurger" type="button" aria-label="메뉴 열기" aria-expanded="false">' +
            '<i></i><i></i><i></i>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<nav class="drawer" id="sDrawer" aria-hidden="true">' +
      gnbHtml('dv', true) +
      '<div class="drawer-foot">' +
        '<a class="d-tel" href="' + TEL_HREF + '">전화 상담 ' + TEL + '</a>' +
        '<a class="d-kko" href="' + KAKAO + '" target="_blank" rel="noopener">카카오톡 1:1 상담</a>' +
      '</div>' +
    '</nav>';

  /* ---------- 푸터 ---------- */
  var footerHtml =
    '<footer class="ft">' +
      '<div class="ft-in">' +
        '<div class="ft-top">' +
          '<div class="ft-logo">' +
            '<b>SUNRISE LAGOON<i>&amp;</i>SKY VALLEY</b>' +
            '<small>GOLF MEMBERSHIP · CHACHOENGSAO, THAILAND</small>' +
          '</div>' +
          '<div class="ft-nav">' +
            MENU.map(function (m) { return '<a href="' + m.href + '">' + m.kr + '</a>'; }).join('') +
          '</div>' +
        '</div>' +
        '<div class="ft-body">' +
          '<div class="ft-biz">' +
            '<span><b>' + BIZ.name + '</b></span>' +
            '<span>대표자 ' + BIZ.ceo + '</span>' +
            '<span>사업자등록번호 ' + BIZ.no + '</span>' +
            '<span>법인등록번호 ' + BIZ.corpNo + '</span>' +
          '</div>' +
          '<div class="ft-biz">' +
            '<span>' + BIZ.addr + '</span>' +
            '<span>분양 · 예약 상담 <b>' + TEL + '</b></span>' +
          '</div>' +
          '<div class="ft-biz sm">' +
            '<span>업태 서비스</span>' +
            '<span>종목 ' + BIZ.biz + '</span>' +
          '</div>' +
          '<div class="ft-copy">COPYRIGHT © ' + BIZ.copy + ' ALL RIGHTS RESERVED.</div>' +
        '</div>' +
      '</div>' +
    '</footer>';

  /* ---------- 플로팅 버튼 ---------- */
  var floatHtml =
    '<div class="float">' +
      '<a class="f-tel" href="' + TEL_HREF + '" aria-label="전화 상담">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>' +
        '전화' +
      '</a>' +
      '<a class="f-kko" href="' + KAKAO + '" target="_blank" rel="noopener" aria-label="카카오톡 상담">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.9 3 2.8 6.3 2.8 10.3c0 2.6 1.7 4.8 4.3 6.1l-1.1 4 4.3-2.4c.5.1 1.1.1 1.7.1 5.1 0 9.2-3.3 9.2-7.8S17.1 3 12 3z"/></svg>' +
        '카톡' +
      '</a>' +
    '</div>';

  /* ---------- 주입 ---------- */
  document.body.insertAdjacentHTML('afterbegin', headerHtml);
  document.body.insertAdjacentHTML('beforeend', footerHtml + floatHtml);

  /* ---------- 모바일 드로어 ---------- */
  var hd = document.getElementById('sHd');
  var burger = document.getElementById('sBurger');
  var drawer = document.getElementById('sDrawer');
  var toggle = function (open) {
    hd.classList.toggle('open', open);
    drawer.classList.toggle('on', open);
    document.body.classList.toggle('locked', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  };
  burger.addEventListener('click', function () { toggle(!drawer.classList.contains('on')); });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) toggle(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && drawer.classList.contains('on')) toggle(false);
  });

  /* ---------- 스크롤 등장 ---------- */
  var targets = document.querySelectorAll('[data-rv]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 사진 자동 슬라이드 ---------- */
  document.querySelectorAll('.slider').forEach(function (slider, idx) {
    var imgs = slider.querySelectorAll('img');
    var dots = slider.querySelectorAll('.dots span');
    if (imgs.length < 2) return;
    var cur = 0;
    setTimeout(function () {
      setInterval(function () {
        imgs[cur].classList.remove('on');
        if (dots[cur]) dots[cur].classList.remove('on');
        cur = (cur + 1) % imgs.length;
        imgs[cur].classList.add('on');
        if (dots[cur]) dots[cur].classList.add('on');
      }, 3800);
    }, idx * 650);
  });
})();
