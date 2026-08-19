/* ==========================================================================
 * SUNRISE LAGOON & SKY VALLEY · 회원권 분양 사이트 공통 스크립트
 * - 헤더 / 모바일 드로어 / 푸터 / 플로팅 버튼을 4개 페이지에 공통 주입
 * - 각 페이지 <body data-page="home|golf|hotel|membership"> 로 현재 메뉴 표시
 * - 이 파일 하나만 고치면 전 페이지에 반영됨
 * ========================================================================== */
(function () {
  'use strict';

  var TEL = '1533-3160';
  var TEL_HREF = 'tel:15333160';
  var KAKAO = 'https://pf.kakao.com/_xaWiKn/chat';
  var TOUR = '../product.html?id=th-sunrise-skyvalley-2color';

  var MENU = [
    { key: 'home',       href: 'index.html',      kr: '분양 안내', en: 'Prologue' },
    { key: 'golf',       href: 'golf.html',       kr: '골프장 소개', en: 'Golf Course' },
    { key: 'hotel',      href: 'hotel.html',      kr: '호텔 소개', en: 'Stay' },
    { key: 'membership', href: 'membership.html', kr: '회원권 안내', en: 'Membership' }
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
            '<a href="' + TOUR + '">골프 투어 상품</a>' +
            '<a href="../index.html">초이스골프</a>' +
          '</div>' +
        '</div>' +
        '<div class="ft-body">' +
          '분양 · 예약 상담 <b>' + TEL + '</b> &nbsp;|&nbsp; 초이스골프 02-545-5005<br>' +
          '서울특별시 서초구 강남대로101안길 18-1 잠원빌딩 2층<br>' +
          '썬라이즈 라군 C.C &amp; 스카이밸리 C.C · 태국 차층사오 (수완나품 공항 약 50분)' +
          '<div class="ft-copy">COPYRIGHT © CHOICE GOLF. ALL RIGHTS RESERVED.</div>' +
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

  /* ---------- 스크롤 시 헤더 배경 ---------- */
  var hd = document.getElementById('sHd');
  var hasHero = !!document.querySelector('.hero, .shero');
  if (!hasHero) document.body.classList.add('no-hero');
  var onScroll = function () {
    if (window.scrollY > 40) hd.classList.add('solid');
    else hd.classList.remove('solid');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 모바일 드로어 ---------- */
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
