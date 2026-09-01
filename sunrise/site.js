/* ==========================================================================
 * SUNRISE LAGOON & SKY VALLEY · 회원권 분양 사이트 공통 스크립트
 * - 헤더 / 모바일 드로어 / 푸터 / 플로팅 버튼을 4개 페이지에 공통 주입
 * - 각 페이지 <body data-page="home|golf|hotel|membership"> 로 현재 메뉴 표시
 * - 이 파일 하나만 고치면 전 페이지에 반영됨
 * ========================================================================== */
(function () {
  'use strict';

  // ※ 이 사이트는 (주)썬앤스카이골프코리아 단독 브랜드 — 초이스골프와 무관 (링크·표기 금지)
  // 연락처 — 입회안내서(최종안) 기준
  var TEL  = '02-540-6114';  var TEL_HREF  = 'tel:0225406114';   // 회원사업부
  var TEL2 = '1533-3160';    var TEL2_HREF = 'tel:15333160';     // 예약실

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
    { key: 'membership', href: 'index.html',   kr: '회원권 안내', en: 'Membership' },
    { key: 'resort',     href: 'resort.html',  kr: '리조트 소개', en: 'The Resort' },
    { key: 'tour',       href: 'tour.html',    kr: '투어 프로그램', en: 'Tour Program' },
    { key: 'contact',    href: 'contact.html', kr: '회원권 문의', en: 'Contact' }
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
          '<img class="hd-full" src="https://qmzrpyyadoajwziqachm.supabase.co/storage/v1/object/public/golf-images/sunrise-logo2.png" alt="SUN &amp; SKY GOLF KOREA">' +
        '</a>' +
        '<nav class="gnb">' + gnbHtml('', false) + '</nav>' +
        '<div class="hd-right">' +
          '<div class="hd-tels">' +
            '<a href="' + TEL_HREF + '"><i>회원사업부</i><b>' + TEL + '</b></a>' +
            '<a href="' + TEL2_HREF + '"><i>예약실</i><b>' + TEL2 + '</b></a>' +
          '</div>' +
          '<button class="burger" id="sBurger" type="button" aria-label="메뉴 열기" aria-expanded="false">' +
            '<i></i><i></i><i></i>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<nav class="drawer" id="sDrawer" aria-hidden="true">' +
      gnbHtml('dv', true) +
      '<div class="drawer-foot">' +
        '<a class="d-tel" href="' + TEL_HREF + '">회원사업부 ' + TEL + '</a>' +
        '<a class="d-tel2" href="' + TEL2_HREF + '">예약실 ' + TEL2 + '</a>' +
      '</div>' +
    '</nav>';

  /* ---------- 푸터 ---------- */
  var footerHtml =
    '<footer class="ft">' +
      '<div class="ft-in">' +
        '<div class="ft-flex">' +
        '<div class="ft-logo">' +
          '<img src="https://qmzrpyyadoajwziqachm.supabase.co/storage/v1/object/public/golf-images/sunrise-logo2.png" alt="SUN &amp; SKY GOLF KOREA">' +
        '</div>' +
        '<div class="ft-body">' +
          '<div class="ft-biz">' +
            '<span>대표자 ' + BIZ.ceo + '</span>' +
            '<span>사업자등록번호 ' + BIZ.no + '</span>' +
            '<span>법인등록번호 ' + BIZ.corpNo + '</span>' +
          '</div>' +
          '<div class="ft-biz">' +
            '<span>' + BIZ.addr + '</span>' +
            '<span>회원사업부 <b>' + TEL + '</b></span>' +
            '<span>예약실 <b>' + TEL2 + '</b></span>' +
          '</div>' +
          '<div class="ft-biz sm">' +
            '<span>Sunrise Lagoon Hotel &amp; Golf, Tha Thonglang, Bang Khla District, Chachoengsao 24110, Thailand · +66 95-287-6900</span>' +
          '</div>' +
          '<div class="ft-copy">COPYRIGHT © ' + BIZ.copy + ' ALL RIGHTS RESERVED.</div>' +
        '</div>' +
        '</div>' +
      '</div>' +
    '</footer>';

  /* ---------- 플로팅 입회 문의 카드 (닫으면 미니 버튼으로 접힘) ---------- */
  var LOGO = 'https://qmzrpyyadoajwziqachm.supabase.co/storage/v1/object/public/golf-images/sunrise-logo2.png';
  var TEL_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';
  var floatHtml =
    '<aside class="fcard" id="sFcard" aria-label="회원 입회 문의">' +
      '<button class="fcard-x" id="sFcardX" type="button" aria-label="입회 문의 카드 접기">&times;</button>' +
      '<img class="fcard-logo" src="' + LOGO + '" alt="SUN &amp; SKY GOLF KOREA">' +
      '<p class="fcard-ttl">회원 입회 문의</p>' +
      '<i class="fcard-line"></i>' +
      '<a class="fcard-tel" href="' + TEL_HREF + '"><i>회원사업부</i><b>' + TEL + '</b></a>' +
      '<a class="fcard-tel sm" href="' + TEL2_HREF + '"><i>예약실</i><b>' + TEL2 + '</b></a>' +
      '<a class="fcard-cta" href="contact.html">입회 상담 안내</a>' +
    '</aside>' +
    '<button class="fmini" id="sFmini" type="button" aria-label="입회 문의 카드 열기">' +
      TEL_SVG + '<span>입회문의</span>' +
    '</button>';

  /* ---------- 모바일 하단 퀵바 ---------- */
  var ICON = {
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4M6 4l10 3-10 3"/><circle cx="6" cy="21" r="1"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-7h18v7M3 11V7M21 11V9a2 2 0 0 0-2-2h-6v4"/><circle cx="7" cy="10" r="1.6"/></svg>'
  };
  var qbarHtml =
    '<nav class="qbar">' +
      '<a class="hi" href="' + TEL_HREF + '">' + ICON.tel + '입회 상담</a>' +
      '<a href="' + TEL2_HREF + '">' + ICON.cal + '예약실</a>' +
      '<a href="resort.html">' + ICON.flag + '리조트</a>' +
      '<a href="tour.html">' + ICON.bed + '투어</a>' +
    '</nav>';

  /* ---------- 주입 ---------- */
  document.body.insertAdjacentHTML('afterbegin', headerHtml);
  document.body.insertAdjacentHTML('beforeend', footerHtml + floatHtml + qbarHtml);

  /* ---------- 플로팅 카드 접기 · 펼치기 ---------- */
  (function () {
    var card = document.getElementById('sFcard');
    var mini = document.getElementById('sFmini');
    var x = document.getElementById('sFcardX');
    if (!card || !mini || !x) return;
    var KEY = 'fcardClosed';
    function set(closed) {
      card.classList.toggle('off', closed);
      mini.classList.toggle('on', closed);
      try { sessionStorage.setItem(KEY, closed ? '1' : '0'); } catch (e) {}
    }
    var initClosed = false;
    try { initClosed = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
    set(initClosed);
    x.addEventListener('click', function () { set(true); });
    mini.addEventListener('click', function () { set(false); });
  })();

  /* ---------- 히어로 페이드 슬라이드 ---------- */
  (function () {
    var box = document.getElementById('heroSlides');
    if (!box) return;
    var imgs = box.querySelectorAll('img');
    if (imgs.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cur = 0;
    setInterval(function () {
      imgs[cur].classList.remove('on');
      cur = (cur + 1) % imgs.length;
      imgs[cur].classList.add('on');
    }, 5500);
  })();

  /* ---------- 시네마틱 표지 (켄번즈 크로스페이드) ---------- */
  document.querySelectorAll('.cine').forEach(function (box) {
    var imgs = box.querySelectorAll('.cine-slides img');
    var dots = box.querySelectorAll('.cine-dots span');
    if (imgs.length < 2) return;
    var cur = 0;
    setInterval(function () {
      imgs[cur].classList.remove('on');
      if (dots[cur]) dots[cur].classList.remove('on');
      cur = (cur + 1) % imgs.length;
      imgs[cur].classList.add('on');
      if (dots[cur]) dots[cur].classList.add('on');
    }, 7000);
  });

  /* ---------- 홈 풀스크린 히어로 (진행바 · 카운터 · 이전/정지/다음) ---------- */
  (function () {
    var lux = document.getElementById('luxHero');
    if (!lux) return;
    var slides = lux.querySelectorAll('.lux-slide');
    if (slides.length < 2) return;
    var bar = document.getElementById('luxBar');
    var num = document.getElementById('luxCur');
    var btnPrev = document.getElementById('luxPrev');
    var btnNext = document.getElementById('luxNext');
    var btnPause = document.getElementById('luxPause');
    var DUR = 3000;   // 슬라이드 대기 시간 3초
    var WIPE = 4500;  // 전환 시간 4.5초 — 책장 넘기듯 아주 천천히 (CSS clip-path transition과 동일)
    var cur = 0, timer = null, swapT = null, playing = true;

    function barReset() {
      if (!bar) return;
      bar.style.transition = 'none';
      bar.style.width = '0';
      void bar.offsetWidth;
    }
    function barRun() {
      if (!bar || !playing) return;
      bar.style.transition = 'width ' + (DUR + WIPE) + 'ms linear';
      bar.style.width = '100%';
    }
    /* 진행 중이던 전환을 정리하고 현재 슬라이드만 남긴다 */
    function finalize() {
      if (swapT) { clearTimeout(swapT); swapT = null; }
      slides.forEach(function (s, idx) {
        s.classList.remove('in', 'go', 'out');
        s.classList.toggle('on', idx === cur);
      });
    }
    function show(i) {
      var nxt = (i + slides.length) % slides.length;
      if (nxt === cur) return;
      finalize();
      cur = nxt;
      var nu = slides[cur];
      nu.classList.add('in');       // 새 장을 오른쪽 끝에 숨겨두고
      void nu.offsetWidth;
      nu.classList.add('go');       // 경계선이 오른쪽→왼쪽으로 쓸리며 드러남
      swapT = setTimeout(finalize, WIPE + 80);
      if (num) num.textContent = cur + 1;
      barReset();
      barRun();
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function schedule() {
      stop();
      if (playing) timer = setInterval(function () { show(cur + 1); }, DUR + WIPE);
    }
    btnPrev.addEventListener('click', function () { show(cur - 1); schedule(); });
    btnNext.addEventListener('click', function () { show(cur + 1); schedule(); });
    btnPause.addEventListener('click', function () {
      playing = !playing;
      btnPause.textContent = playing ? '❚❚' : '▶';
      btnPause.setAttribute('aria-label', playing ? '슬라이드 일시정지' : '슬라이드 재생');
      if (playing) { barReset(); barRun(); schedule(); }
      else {
        stop();
        if (bar) {
          var w = getComputedStyle(bar).width;
          bar.style.transition = 'none';
          bar.style.width = w;
        }
      }
    });
    barRun();
    schedule();
  })();

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
