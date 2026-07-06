/* ===================================================================
 * Choice Golf Layout System
 * - 헤더 + 푸터 + 공지바 + 플로팅 버튼 + 모바일 하단바 통합 관리
 * - 모든 페이지에 <script src="layout.js"></script> 한 줄만 추가
 * - 본 파일 1개만 수정하면 모든 페이지에 자동 반영
 * =================================================================== */

(function() {
  'use strict';

  // ========== 설정 ==========
  const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_xaWiKn/chat';
  const PHONE_NUMBER = '1533-3160';
  const PHONE_TEL = 'tel:15333160';
  const BAND_URL = '#';        // TODO: 네이버 밴드 주소 입력
  const YOUTUBE_URL = '#';     // TODO: 유튜브 채널 주소 입력
  const CONFIRMED_URL = '#';   // TODO: 출발확정상품 페이지 주소 입력

  // ========== CSS ==========
  const STYLE = `
  /* 폰트 강제 로드 (페이지마다 폰트 로드 상태가 달라도 통일되도록) */
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css');
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Gaegu:wght@300;400;700&display=swap');

  /* Layout 공통 변수 (페이지 내 :root와 충돌 안 함) */
  .cg-layout-scope {
    --cg-forest: #1B4332;
    --cg-forest-dark: #0F2C20;
    --cg-forest-light: #2D6A4F;
    --cg-gold: #c9a961;
    --cg-gold-light: #e4c97e;
    --cg-gold-pale: #f4e4a8;
    --cg-beige-soft: #FAF6EE;
    --cg-gray-100: #f5f5f5;
    --cg-gray-200: #e5e5e5;
    --cg-gray-300: #d4d4d4;
    --cg-gray-400: #b4b4b4;
    --cg-gray-700: #4a4a4a;
    --cg-gray-900: #252525;
    --cg-kakao: #fee500;
  }

  /* ===== 상단 이벤트바 (쿠폰/특가 띠배너) ===== */
  .cg-promobar {
    background: linear-gradient(90deg, #f6edd6 0%, #efe0b6 50%, #f6edd6 100%);
    border-bottom: 1px solid #e7d9af;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
  }
  .cg-promobar-inner {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 40px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .cg-promo-left, .cg-promo-right {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    color: #1B4332;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cg-promo-left:hover, .cg-promo-right:hover { color: #0F2C20; }
  .cg-promo-badge {
    background: #1B4332;
    color: #f4e4a8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 3px 9px;
    border-radius: 5px;
    flex-shrink: 0;
  }
  .cg-promo-strong { color: #b8893a; font-weight: 800; }
  .cg-promo-chev { width: 15px; height: 15px; opacity: 0.55; flex-shrink: 0; }
  .cg-promo-plane { font-size: 14px; }
  @media (max-width: 900px) and (pointer: coarse) {
    .cg-promobar-inner { padding: 0 18px; height: 40px; justify-content: center; }
    .cg-promo-right { display: none; }
    .cg-promo-left { font-size: 13px; }
  }

  /* ===== 상단 유틸바 (홈|로그인|예약조회|...) ===== */
  .cg-utilbar {
    background: #fff;
    border-bottom: 1px solid #eee;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
  }
  .cg-utilbar-inner {
    max-width: 1440px;
    margin: 0 auto;
    padding: 8px 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0;
  }
  .cg-utilbar-inner a {
    color: #888;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.2px;
    padding: 0 14px;
    transition: color 0.2s;
    line-height: 1;
  }
  .cg-utilbar-inner a:hover { color: #1B4332; }
  .cg-utilbar-inner a.cg-util-on { color: #c9a961; font-weight: 700; }
  .cg-utilbar-inner .cg-util-sep {
    color: #ddd;
    font-size: 11px;
  }
  @media (max-width: 900px) and (pointer: coarse) {
    .cg-utilbar { display: none; }
  }

  /* ===== 헤더 2단 (로고 + 검색창 + 아이콘박스) ===== */
  .cg-header {
    background: #fff !important;
    border-bottom: 1px solid #f0f0f0 !important;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  }
  .cg-header * {
    box-sizing: border-box !important;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif !important;
  }
  .cg-header-inner {
    display: grid !important;
    grid-template-columns: 1fr auto 1fr !important;
    grid-template-rows: auto auto !important;
    align-items: center !important;
    column-gap: 28px !important;
    row-gap: 9px !important;
    max-width: 1440px !important;
    margin: 0 auto !important;
    padding: 18px 40px !important;
  }
  .cg-logo {
    flex-shrink: 0 !important;
    display: block !important;
    text-decoration: none !important;
    line-height: 0 !important;
    grid-column: 1 !important;
    grid-row: 1 !important;
    justify-self: end !important;
    margin-right: 48px !important;
  }
  .cg-logo-img {
    height: 40px !important;
    width: auto !important;
    display: block !important;
  }

  /* 가운데 검색창 (둥근 알약형) — 1행 가운데 칸 */
  .cg-search {
    width: 470px !important;
    max-width: 100% !important;
    display: flex !important;
    align-items: center !important;
    border: 2px solid #1B4332 !important;
    border-radius: 999px !important;
    background: #fff !important;
    padding: 5px 6px 5px 4px !important;
  }
  .cg-search input {
    flex: 1 !important;
    border: none !important;
    outline: none !important;
    padding: 9px 20px !important;
    font-size: 15px !important;
    color: #333 !important;
    background: transparent !important;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif !important;
  }
  .cg-search input::placeholder { color: #aaa !important; }
  /* 검색칸 + 카카오상담 한 줄 래퍼 */
  .cg-searchrow {
    grid-column: 2 !important;
    grid-row: 1 !important;
    justify-self: start !important;
    display: flex !important;
    align-items: center !important;
    gap: 26px !important;
  }
  /* 써니여행사 스타일 카카오톡 1:1상담 */
  .cg-kakao-consult {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    text-decoration: none !important;
    flex-shrink: 0 !important;
  }
  .cg-kc-text { text-align: right !important; line-height: 1.35 !important; }
  .cg-kc-text em { display: block !important; font-style: normal !important; font-size: 12.5px !important; color: #777 !important; font-weight: 500 !important; }
  .cg-kc-text strong { display: block !important; font-size: 16.5px !important; color: #222 !important; font-weight: 800 !important; letter-spacing: -0.3px !important; }
  .cg-kc-ico {
    width: 52px !important; height: 52px !important;
    background: #fee500 !important;
    border-radius: 50% !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    color: #3c1e1e !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
    transition: transform 0.15s ease !important;
  }
  .cg-kc-ico svg { width: 28px !important; height: 28px !important; }
  .cg-kakao-consult:hover .cg-kc-ico { transform: scale(1.08) !important; }
  .cg-search button {
    border: none !important;
    background: #1B4332 !important;
    width: 42px !important;
    height: 42px !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    color: #fff !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    transition: background 0.2s ease !important;
  }
  .cg-search button:hover { background: #0F2C20 !important; }
  .cg-search button svg { width: 20px !important; height: 20px !important; }


  /* 우측 아이콘박스 3개 — 1행 오른쪽 칸 */
  .cg-quicklinks {
    grid-column: 3 !important;
    grid-row: 1 !important;
    display: flex !important;
    align-items: center !important;
    gap: 14px !important;
    flex-shrink: 0 !important;
    justify-self: end !important;
  }
  .cg-ql {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 6px !important;
    width: 64px !important;
    text-decoration: none !important;
  }
  .cg-ql-ico {
    width: 52px !important;
    height: 52px !important;
    border-radius: 12px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #fff !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
  }
  .cg-ql:hover .cg-ql-ico {
    transform: translateY(-3px) !important;
    box-shadow: 0 6px 16px rgba(0,0,0,0.18) !important;
  }
  .cg-ql-ico svg { width: 28px !important; height: 28px !important; }
  .cg-ql-label {
    font-size: 12px !important;
    font-weight: 700 !important;
    color: #555 !important;
    letter-spacing: -0.4px !important;
    white-space: nowrap !important;
    text-align: center !important;
  }
  .cg-ql-membership .cg-ql-ico { background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%) !important; }
  .cg-ql-youtube .cg-ql-ico { background: #ff0000 !important; }
  .cg-ql-review .cg-ql-ico { background: linear-gradient(135deg, #e4c97e 0%, #c9a961 100%) !important; }
  .cg-ql-band .cg-ql-ico { background: #44c553 !important; }
  .cg-ql-kakao .cg-ql-ico { background: #fee500 !important; color: #3c1e1e !important; }
  .cg-ql-confirm .cg-ql-ico { background: linear-gradient(135deg, #e4c97e 0%, #c9a961 100%) !important; }

  /* 모바일 햄버거 */
  .cg-menu-btn {
    display: none;
    background: transparent;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 22px;
    color: #1B4332;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  /* ===== GNB 3단 (국기 메뉴) ===== */
  .cg-gnb {
    background: #ffffff !important;
    border-top: 1px solid #f0f0f0 !important;
    border-bottom: 1px solid #e8e8e8 !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif !important;
  }
  .cg-gnb-inner {
    max-width: 1440px !important;
    margin: 0 auto !important;
    padding: 0 40px !important;
    display: flex !important;
    align-items: stretch !important;
    justify-content: center !important;
    gap: 0 !important;
  }

  /* 국기 */
  .cg-flag {
    width: 24px !important;
    height: 17px !important;
    border-radius: 3px !important;
    object-fit: cover !important;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.12) !important;
    flex-shrink: 0 !important;
    display: inline-block !important;
  }
  .cg-flag-emoji {
    width: 24px !important;
    font-size: 17px !important;
    line-height: 1 !important;
    flex-shrink: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* 국가 메뉴 아이템 */
  .cg-nav-item { position: relative !important; display: flex !important; }
  .cg-nav-item > a {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    padding: 18px 22px !important;
    font-size: 16.5px !important;
    font-weight: 700 !important;
    color: #222222 !important;
    text-decoration: none !important;
    letter-spacing: -0.2px !important;
    transition: color 0.2s ease !important;
    position: relative !important;
    white-space: nowrap !important;
  }
  .cg-nav-item > a::before {
    content: '' !important;
    position: absolute !important;
    left: 0 !important; top: 50% !important;
    transform: translateY(-50%) !important;
    width: 1px !important; height: 16px !important;
    background: #ececec !important;
  }
  .cg-nav-item > a::after {
    content: '' !important;
    position: absolute !important;
    left: 50% !important;
    right: 50% !important;
    bottom: -2px !important;
    height: 3px !important;
    background: #c9a961 !important;
    transition: all 0.25s ease !important;
  }
  .cg-nav-item > a:hover { color: #1B4332 !important; }
  .cg-nav-item > a:hover::after { left: 18% !important; right: 18% !important; }
  .cg-nav-item > a.cg-active { color: #1B4332 !important; }
  .cg-nav-item > a.cg-active::after { left: 18% !important; right: 18% !important; }

  /* 골프회원권: 골드 그라데이션 프리미엄 텍스트 */
  .cg-nav-item > a.cg-nav-premium span {
    background: linear-gradient(120deg, #1a3a6b 0%, #3f6fd1 45%, #14294d 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    color: transparent !important;
    font-weight: 800 !important;
  }
  .cg-nav-item > a.cg-nav-premium:hover span,
  .cg-nav-item > a.cg-nav-premium.cg-active span {
    background: linear-gradient(120deg, #2b57a8 0%, #6b96e8 45%, #1a3a6b 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
  }

  @media (max-width: 1100px) {
    .cg-nav-item > a { padding: 18px 18px; font-size: 16px; }
    .cg-header-inner { padding: 14px 24px !important; }
    .cg-logo { margin-right: 16px !important; }
    .cg-search { width: 360px !important; }
    .cg-kc-text em { display: none !important; }
  }
  @media (max-width: 900px) and (pointer: coarse) {
    .cg-center, .cg-searchrow, .cg-search, .cg-quicklinks, .cg-gnb { display: none !important; }
    .cg-menu-btn { display: flex !important; }
    .cg-header-inner {
      display: flex !important;
      justify-content: space-between !important;
      padding: 12px 20px !important;
    }
    .cg-logo { justify-self: auto !important; margin-right: 0 !important; }
    .cg-logo-img { height: 40px !important; }
  }


  /* 모바일 풀스크린 메뉴 */
  .cg-mobile-menu {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15,44,32,0.98);
    z-index: 200;
    padding: 80px 30px 30px;
    overflow-y: auto;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
  }
  .cg-mobile-menu.open { display: block; }
  .cg-mobile-menu a {
    display: block;
    padding: 16px 0;
    color: #fff;
    font-size: 17px;
    font-weight: 500;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    text-decoration: none;
  }
  .cg-mobile-menu a.cg-active { color: #e4c97e; }
  .cg-mobile-menu a.cg-mm-sub {
    padding: 10px 0 10px 16px;
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    border: none;
  }
  .cg-mobile-menu .cg-mm-section-title {
    padding: 18px 0 6px;
    color: #e4c97e;
    font-size: 12px;
    letter-spacing: 2px;
    font-weight: 700;
    border: none;
  }
  .cg-mobile-menu-close {
    position: absolute;
    top: 20px;
    right: 24px;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 28px;
    cursor: pointer;
    font-family: inherit;
  }
  .cg-mobile-menu .cg-mm-call {
    background: #c9a961;
    color: #0F2C20;
    text-align: center;
    border-radius: 8px;
    margin-top: 20px;
    font-weight: 700;
  }
  .cg-mobile-menu .cg-mm-search { margin-bottom: 8px; }
  .cg-mobile-menu .cg-mm-search input {
    width: 100%;
    box-sizing: border-box;
    padding: 13px 16px;
    border: 2px solid #c9a961;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    background: #fff;
    color: #333;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
  }

  /* ===== 신뢰 배지 섹션 ===== */
  .cg-trust {
    background: linear-gradient(180deg, #0F2C20 0%, #1B4332 60%, #0F2C20 100%);
    padding: 44px 24px 50px;
    text-align: center;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
    position: relative;
    border-top: 1px solid rgba(201, 169, 97, 0.2);
  }
  .cg-trust-shield {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 50px;
    margin: 0 auto 14px;
    color: #c9a961;
    filter: drop-shadow(0 2px 6px rgba(201, 169, 97, 0.35));
  }
  .cg-trust-shield svg { width: 100%; height: 100%; }
  .cg-trust-title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    color: #f4e4a8;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 4px;
    margin-bottom: 26px;
  }
  .cg-trust-title .cg-laurel {
    width: 28px;
    height: 22px;
    color: #c9a961;
    opacity: 0.85;
  }
  .cg-trust-title .cg-laurel.flip { transform: scaleX(-1); }
  .cg-trust-cards {
    display: flex;
    justify-content: center;
    gap: 16px;
    max-width: 760px;
    margin: 0 auto;
  }
  .cg-trust-card {
    flex: 1;
    background: #fff;
    border-radius: 12px;
    padding: 20px 14px;
    text-align: center;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 118px;
  }
  .cg-trust-card-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    gap: 8px;
  }
  .cg-trust-card-desc {
    font-size: 12.5px;
    color: #555;
    letter-spacing: 0.5px;
    font-weight: 500;
  }
  /* 카드1: 트로피 */
  .cg-trust-trophy { display: flex; align-items: center; gap: 10px; }
  .cg-trust-trophy svg { width: 32px; height: 32px; color: #d4a017; }
  .cg-trust-trophy-text {
    text-align: left;
    line-height: 1.15;
  }
  .cg-trust-trophy-year {
    font-size: 14px;
    font-weight: 700;
    color: #1B4332;
    letter-spacing: 0.5px;
  }
  .cg-trust-trophy-name {
    font-size: 11px;
    color: #888;
    letter-spacing: 1.5px;
    font-weight: 600;
  }
  /* 카드2: DB손해보험 */
  .cg-trust-db-logo {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
  .cg-trust-db-logo .cg-db-bar {
    width: 7px;
    height: 22px;
    border-radius: 2px;
  }
  .cg-trust-db-logo .cg-db-bar:nth-child(1) { background: #FFB800; height: 18px; }
  .cg-trust-db-logo .cg-db-bar:nth-child(2) { background: #00A859; height: 26px; }
  .cg-trust-db-logo .cg-db-bar:nth-child(3) { background: #0080C8; height: 22px; }
  .cg-trust-db-name {
    font-size: 14px;
    font-weight: 700;
    color: #1B4332;
    margin-left: 6px;
    letter-spacing: -0.3px;
  }
  /* 카드3: SGI서울보증 */
  .cg-trust-sgi {
    font-size: 22px;
    font-weight: 800;
    color: #E60012;
    letter-spacing: -0.5px;
    font-family: 'Pretendard Variable', sans-serif;
  }
  .cg-trust-sgi-name {
    font-size: 13px;
    font-weight: 700;
    color: #1B4332;
    margin-top: 2px;
  }
  @media (max-width: 768px) and (pointer: coarse) {
    .cg-trust { padding: 36px 16px 40px; }
    .cg-trust-title { font-size: 14px; letter-spacing: 2.5px; gap: 12px; }
    .cg-trust-title .cg-laurel { width: 22px; height: 18px; }
    .cg-trust-cards { gap: 8px; }
    .cg-trust-card { padding: 14px 8px; min-height: 96px; border-radius: 8px; }
    .cg-trust-card-desc { font-size: 10.5px; letter-spacing: 0; }
    .cg-trust-trophy svg { width: 24px; height: 24px; }
    .cg-trust-trophy-year { font-size: 11px; }
    .cg-trust-trophy-name { font-size: 9px; letter-spacing: 1px; }
    .cg-trust-db-logo .cg-db-bar { width: 5px; }
    .cg-trust-db-logo .cg-db-bar:nth-child(1) { height: 14px; }
    .cg-trust-db-logo .cg-db-bar:nth-child(2) { height: 20px; }
    .cg-trust-db-logo .cg-db-bar:nth-child(3) { height: 17px; }
    .cg-trust-db-name { font-size: 11px; margin-left: 4px; }
    .cg-trust-sgi { font-size: 17px; }
    .cg-trust-sgi-name { font-size: 11px; }
  }

  /* ===== 푸터 ===== */
  .cg-footer {
    position: relative;
    background: #f4f7fb;
    color: #4a5568;
    padding: 32px 0 20px;
    font-size: 13px;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
    border-top: 1px solid #e3eaf5;
    overflow: hidden;
  }
  /* 하단 일자 파란 띠 */
  .cg-footer::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 8px;
    background: linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
  }
  .cg-footer-inner { max-width: 1280px; margin: 0 auto; padding: 0 40px 14px; position: relative; z-index: 1; }
  .cg-footer-top {
    display: flex;
    gap: 40px;
    align-items: center;
    padding-bottom: 18px;
  }
  .cg-footer-logo {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 170px;
  }
  .cg-footer-logo-img { height: 46px; width: auto; display: block; }
  .cg-footer-logo-kr {
    font-size: 22px;
    font-weight: 800;
    color: #2563eb;
    letter-spacing: 1px;
    line-height: 1;
  }
  .cg-footer-logo-en {
    font-family: 'Cormorant Garamond', serif;
    font-size: 12px;
    font-weight: 500;
    color: #94a3b8;
    letter-spacing: 3px;
    line-height: 1;
  }
  .cg-footer-biz {
    flex: 1;
    font-size: 13px;
    color: #334155;
    line-height: 1;
    letter-spacing: 0.2px;
  }
  .cg-footer-biz .cg-biz-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 9px 16px;
    margin-bottom: 11px;
  }
  .cg-footer-biz .cg-biz-row:last-child { margin-bottom: 0; }
  .cg-footer-biz .cg-biz-item {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  /* 항목 사이 세로 구분선 */
  .cg-footer-biz .cg-biz-item + .cg-biz-item::before {
    content: '';
    width: 1px;
    height: 14px;
    background: #cbd5e1;
    margin-right: 11px;
  }
  .cg-footer-biz .cg-biz-ico {
    width: 16px; height: 16px;
    flex-shrink: 0;
    display: inline-flex;
  }
  .cg-footer-biz .cg-biz-ico svg {
    width: 16px; height: 16px;
    stroke: #3b82f6; fill: none; stroke-width: 1.8;
  }
  .cg-footer-biz .cg-biz-label {
    color: #1e293b;
    font-weight: 700;
    margin-right: 2px;
  }
  .cg-footer-biz .cg-biz-val { color: #475569; }
  .cg-footer-bottom {
    text-align: center;
    font-size: 12px;
    color: #94a3b8;
    letter-spacing: 0.5px;
    padding-top: 16px;
    margin-top: 2px;
    border-top: 1px solid #dde7f5;
    position: relative;
  }
  /* 구분선 가운데 점 */
  .cg-footer-bottom::before {
    content: '';
    position: absolute;
    top: -4px; left: 50%;
    width: 8px; height: 8px;
    transform: translateX(-50%);
    background: #3b82f6;
    border-radius: 50%;
  }

  /* ===== 🆕 푸터 3단 (써니여행사 스타일) ===== */
  .cg-f3 { display: grid; grid-template-columns: 1.5fr 1.2fr 1.1fr; align-items: center; }
  .cg-f-col { padding: 8px 34px; }
  .cg-f-col + .cg-f-col { border-left: 1px solid #e2e8f0; }
  .cg-f-info { padding-left: 0; }
  .cg-f-info .cg-footer-logo { align-items: flex-start; min-width: 0; margin-bottom: 14px; }
  .cg-f-info .cg-footer-logo-img { height: 40px; }
  .cg-f-line { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 7px; }
  .cg-f-line b { color: #1e293b; font-weight: 700; }
  .cg-f-line i { font-style: normal; color: #cbd5e1; margin: 0 7px; }
  .cg-f-copy { font-size: 12.5px; color: #94a3b8; margin-top: 14px; }
  .cg-f-bizbtn {
    display: inline-block; margin-left: 8px;
    font-size: 11.5px; font-weight: 700; color: #475569;
    border: 1px solid #cbd5e1; border-radius: 5px;
    padding: 2px 9px; text-decoration: none; background: #fff;
  }
  .cg-f-bizbtn:hover { background: #f1f5f9; }
  .cg-f-center, .cg-f-bank { text-align: center; }
  .cg-f-telbox { display: inline-block; text-align: left; }
  .cg-f-telrow { display: flex; align-items: center; gap: 14px; padding: 13px 0; }
  .cg-f-telrow + .cg-f-telrow { border-top: 1px solid #e2e8f0; }
  .cg-f-telico {
    display: flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; flex-shrink: 0;
    border-radius: 50%;
    background: #eaf0fb;
    color: #2f5fd0;
  }
  .cg-f-telico svg { width: 23px; height: 23px; }
  .cg-f-telinfo { display: flex; flex-direction: column; }
  .cg-f-telinfo em { font-style: normal; font-size: 13px; font-weight: 600; color: #4a5fa8; margin-bottom: 2px; }
  .cg-f-telinfo strong { font-size: 25px; font-weight: 900; color: #16244d; letter-spacing: 0.5px; font-variant-numeric: tabular-nums; line-height: 1.15; white-space: nowrap; }
  .cg-f-col-title { font-size: 17px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
  .cg-f-bankico { background: #e4f4f1 !important; color: #0f766e !important; }
  .cg-f-telinfo em.cg-f-bankname { font-size: 16px; font-weight: 800; color: #0f766e; margin-bottom: 3px; }
  .cg-f-holder-row { padding-left: 62px; }
  .cg-f-holder { font-size: 14.5px; color: #16244d; font-weight: 800; white-space: nowrap; }
  @media (max-width: 900px) and (pointer: coarse) {
    .cg-f3 { grid-template-columns: 1fr; gap: 26px; }
    .cg-f-center, .cg-f-bank { display: none; }
    .cg-f-col { padding: 0 !important; }
    .cg-f-col + .cg-f-col { border-left: none; border-top: 1px solid #e2e8f0; padding-top: 24px !important; }
    .cg-f-info .cg-footer-logo { align-items: center; }
    .cg-f-info { text-align: center; }
    .cg-f-links { justify-content: center; }
    .cg-f-tel { font-size: 26px; }
  }
  @media (max-width: 900px) and (pointer: coarse) {
    .cg-footer-top { flex-direction: column; gap: 24px; align-items: center; text-align: center; }
    .cg-footer-biz { text-align: center; }
    .cg-footer-biz .cg-biz-row { justify-content: center; }
    .cg-footer-biz .cg-biz-item + .cg-biz-item::before { display: none; }
  }
  @media (max-width: 768px) and (pointer: coarse) {
    .cg-footer-inner { padding: 0 20px; }
    .cg-footer { padding: 36px 0 22px; }
    .cg-footer-biz { font-size: 11.5px; max-width: 100%; box-sizing: border-box; }
    .cg-footer-biz .cg-biz-row { width: 100%; max-width: 100%; box-sizing: border-box; }
    /* 🆕 모바일 푸터: 아이콘 제거 + 가로로 채워 컴팩트하게 */
    .cg-footer-biz .cg-biz-row {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      gap: 5px 14px;
      margin-bottom: 7px;
    }
    .cg-footer-biz .cg-biz-ico { display: none !important; }
    .cg-footer-biz .cg-biz-item {
      display: inline-flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 4px;
      width: auto;
      max-width: 100%;
      white-space: normal;
    }
    .cg-footer-biz .cg-biz-label {
      color: #1e293b;
      font-weight: 600;
      flex-shrink: 0;
    }
    .cg-footer-biz .cg-biz-val {
      white-space: normal;
      word-break: keep-all;
    }
  }

  /* ===== 플로팅 버튼 ===== */
  .cg-float-kakao {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 50;
    width: 58px;
    height: 58px;
    background: #fee500;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(254,229,0,0.4);
    color: #3c1e1e;
    font-size: 14px;
    font-weight: 900;
    animation: cgPulse 2s infinite;
    text-decoration: none;
  }
  .cg-float-call {
    position: fixed;
    bottom: 96px;
    right: 28px;
    z-index: 50;
    width: 58px;
    height: 58px;
    background: #1B4332;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(27,67,50,0.3);
    color: #fff;
    font-size: 22px;
    border: 2px solid #c9a961;
    text-decoration: none;
  }
  @keyframes cgPulse {
    0%, 100% { box-shadow: 0 8px 24px rgba(254,229,0,0.4); }
    50% { box-shadow: 0 8px 24px rgba(254,229,0,0.7), 0 0 0 8px rgba(254,229,0,0.1); }
  }

  /* 모바일 하단 액션바 */
  .cg-mobile-action-bar { display: none; }
  @media (max-width: 768px) and (pointer: coarse) {
    .cg-float-kakao, .cg-float-call { display: none; }
    .cg-mobile-action-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 100;
      background: #fff;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
      border-top: 1px solid #eee;
      height: 58px;
      font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
    }
    .cg-mab-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .cg-mab-btn .cg-mab-icon { font-size: 20px; line-height: 1; }
    .cg-mab-call { background: #1B4332; color: #fff; }
    .cg-mab-call .cg-mab-icon { color: #c9a961; }
    .cg-mab-kakao { background: #fee500; color: #3c1e1e; }
    body { padding-bottom: 58px; }
  }

  /* ===== 메가 메뉴 (해외골프 전용) ===== */
  .cg-dropdown.cg-mega {
    width: 1100px !important;
    max-width: calc(100vw - 40px) !important;
    padding: 28px !important;
    display: grid !important;
    grid-template-columns: 280px 1fr !important;
    gap: 32px !important;
    background: linear-gradient(135deg, #fdfaf1 0%, #fff 50%, #fdfaf1 100%) !important;
    border: 1px solid rgba(201,169,97,0.25) !important;
    box-shadow: 0 12px 40px rgba(15,44,32,0.18) !important;
    border-radius: 14px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }
  .cg-mega-left {
    padding: 12px 16px 12px 8px;
    border-right: 1px solid rgba(201,169,97,0.2);
    position: relative;
  }
  .cg-mega-globe {
    font-size: 28px;
    color: #c9a961;
    margin-bottom: 16px;
    line-height: 1;
    width: 48px;
    height: 48px;
    border: 1.5px solid #c9a961;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  .cg-mega-title {
    font-family: 'Cormorant Garamond', serif !important;
    font-size: 30px !important;
    font-weight: 500 !important;
    color: #1B4332 !important;
    line-height: 1.15 !important;
    letter-spacing: 0.5px !important;
    margin: 0 0 14px !important;
  }
  .cg-mega-divider {
    width: 50px;
    height: 2px;
    background: #c9a961;
    margin-bottom: 14px;
  }
  .cg-mega-sub {
    font-size: 12.5px !important;
    color: #6b6b6b !important;
    line-height: 1.6 !important;
    margin: 0 !important;
    font-weight: 400 !important;
    letter-spacing: -0.2px !important;
  }
  .cg-mega-right {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cg-mega-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .cg-mega-card {
    position: relative !important;
    display: block !important;
    height: 110px !important;
    background-color: transparent !important;
    background-size: 101% 101% !important;
    background-position: -1px -1px !important;
    background-repeat: no-repeat !important;
    border: 1px solid rgba(201,169,97,0.35) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    text-decoration: none !important;
    transition: all 0.2s ease !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 0 !important;
    color: #1B4332 !important;
    box-shadow: 0 2px 8px rgba(15,44,32,0.08) !important;
    box-sizing: border-box !important;
  }
  .cg-mega-card:hover {
    border-color: #c9a961 !important;
    box-shadow: 0 6px 18px rgba(15,44,32,0.18) !important;
    transform: translateY(-2px) !important;
  }
  /* 좌측 화이트 페이드 (국기/이름 가독성) */
  .cg-mega-card-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(252,250,243,0.85) 0%, rgba(252,250,243,0.75) 15%, rgba(252,250,243,0.5) 35%, rgba(252,250,243,0.2) 55%, rgba(252,250,243,0) 75%);
    pointer-events: none;
  }
  .cg-mega-card-text {
    position: relative;
    z-index: 2;
    display: flex !important;
    align-items: center;
    gap: 12px;
    padding: 0 18px;
    height: 100%;
  }
  .cg-mega-flag {
    width: 38px;
    height: 26px;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.18);
    object-fit: cover;
    flex-shrink: 0;
    display: block;
  }
  .cg-mega-name {
    font-size: 17px;
    font-weight: 800;
    color: #1B4332;
    letter-spacing: -0.3px;
  }
  .cg-mega-arrow {
    font-size: 18px;
    color: #c9a961;
    font-family: serif;
    line-height: 1;
    font-weight: 700;
    margin-left: 2px;
  }
  .cg-mega-etc {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    height: 56px !important;
    padding: 0 18px !important;
    background: #fff !important;
    border: 1px solid #e5e5e5 !important;
    border-radius: 10px !important;
    text-decoration: none !important;
    color: #1B4332 !important;
    transition: all 0.2s ease !important;
  }
  .cg-mega-etc:hover {
    border-color: #c9a961 !important;
    background: #fdfaf1 !important;
  }
  .cg-mega-etc-icon {
    font-size: 18px;
  }
  .cg-mega-etc-name {
    flex: 1;
    font-size: 15px;
    font-weight: 700;
    color: #1B4332;
    letter-spacing: -0.2px;
  }

  /* 메가 메뉴는 모바일에서는 숨김 */
  @media (max-width: 1024px) {
    .cg-dropdown.cg-mega { display: none !important; }
  }
  `;

  // ========== 메뉴 데이터 ==========
  // 메뉴 아이콘 (key별 SVG) — 커뮤니티만 사용
  const MENU_ICONS = {
    community: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 01-11.5 7.2L3 21l1.8-6.5A8 8 0 1121 12z"/></svg>'
  };

  const MENU = [
    { key: 'korea',      label: '국내골프', href: 'country.html?c=korea' },
    { key: 'japan',      label: '일본',     href: 'country.html?c=japan' },
    { key: 'taiwan',     label: '대만',     href: 'country.html?c=taiwan' },
    { key: 'thailand',   label: '태국',     href: 'country.html?c=thailand' },
    { key: 'vietnam',    label: '베트남',   href: 'country.html?c=vietnam' },
    { key: 'philippines',label: '필리핀',   href: 'country.html?c=philippines' },
    { key: 'china',      label: '중국',     href: 'country.html?c=china' },
    { key: 'others',     label: '기타 · 프리미엄', href: 'country.html?c=others' },
    { key: 'membership', label: '골프회원권', href: 'membership.html', cls: 'cg-nav-premium' },
    { key: 'community',  label: '커뮤니티',   href: 'support.html' }
  ];

  // ========== 현재 페이지 메뉴 active 자동 감지 ==========
  function getActiveKey() {
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path === 'membership.html' || path === 'tcm-detail.html' ||
        path === 'sienna-detail.html' || path === 'membership-detail.html') return 'membership';
    if (path === 'country.html') {
      const m = search.match(/[?&]c=([a-z]+)/);
      if (m) return m[1];   // japan, taiwan, thailand, vietnam, philippines, china, korea
    }
    return '';
  }

  // ========== 검색 (전역 함수) — 지역명 매칭 → 해당 country 페이지 이동 ==========
  // index.html 히어로 검색과 동일한 지역 데이터
  const CG_KW_REGIONS = [
    { name:'국내', country:'korea', code:'', aliases:['한국','국내골프'] },
    { name:'강원', country:'korea', code:'gangwon', aliases:['강원도','평창','정선'] },
    { name:'수도권', country:'korea', code:'metro', aliases:['경기','서울'] },
    { name:'충청', country:'korea', code:'chungcheong', aliases:['충북','충남','대전'] },
    { name:'경상', country:'korea', code:'gyeongsang', aliases:['경북','경남','부산','대구'] },
    { name:'전라', country:'korea', code:'jeolla', aliases:['전북','전남','광주'] },
    { name:'제주', country:'korea', code:'jeju', aliases:['제주도'] },
    { name:'후쿠오카', country:'japan', code:'fukuoka', aliases:[] },
    { name:'히로시마', country:'japan', code:'hiroshima', aliases:[] },
    { name:'홋카이도', country:'japan', code:'hokkaido', aliases:['삿포로','하코다테'] },
    { name:'가고시마', country:'japan', code:'kagoshima', aliases:[] },
    { name:'구마모토', country:'japan', code:'kumamoto', aliases:[] },
    { name:'미야코지마', country:'japan', code:'miyakojima', aliases:[] },
    { name:'미야자키', country:'japan', code:'miyazaki', aliases:[] },
    { name:'오이타', country:'japan', code:'oita', aliases:['벳푸'] },
    { name:'오키나와', country:'japan', code:'okinawa', aliases:[] },
    { name:'오사카', country:'japan', code:'osaka', aliases:[] },
    { name:'시즈오카', country:'japan', code:'shizuoka', aliases:[] },
    { name:'다카마쓰', country:'japan', code:'takamatsu', aliases:[] },
    { name:'도쿄', country:'japan', code:'tokyo', aliases:[] },
    { name:'아오모리', country:'japan', code:'aomori', aliases:[] },
    { name:'장가계', country:'china', code:'zhangjiajie', aliases:['장자제'] },
    { name:'연태', country:'china', code:'yantai', aliases:['옌타이'] },
    { name:'청도', country:'china', code:'qingdao', aliases:['칭다오'] },
    { name:'위해', country:'china', code:'weihai', aliases:['웨이하이'] },
    { name:'하이난', country:'china', code:'hainan', aliases:['싼야'] },
    { name:'가오슝', country:'taiwan', code:'kaohsiung', aliases:[] },
    { name:'타이중', country:'taiwan', code:'taicung', aliases:[] },
    { name:'타이페이', country:'taiwan', code:'taipei', aliases:['타이베이'] },
    { name:'방콕', country:'thailand', code:'bangkok', aliases:[] },
    { name:'치앙마이', country:'thailand', code:'chiangmai', aliases:[] },
    { name:'파타야', country:'thailand', code:'pattaya', aliases:[] },
    { name:'클락', country:'philippines', code:'clark', aliases:['클락필드'] },
    { name:'마닐라', country:'philippines', code:'manila', aliases:[] },
    { name:'세부', country:'philippines', code:'cebu', aliases:[] },
    { name:'나트랑', country:'vietnam', code:'nhatrang', aliases:['냐짱'] }
  ];
  const CG_KW_LABEL = { korea:'국내', japan:'일본', china:'중국', taiwan:'대만', thailand:'태국', philippines:'필리핀', vietnam:'베트남' };

  function cgFindRegion(q) {
    const lq = q.toLowerCase();
    return CG_KW_REGIONS.find(r =>
      r.name.toLowerCase().includes(lq) ||
      (CG_KW_LABEL[r.country] || '').toLowerCase().includes(lq) ||
      r.aliases.some(a => a.toLowerCase().includes(lq))
    );
  }

  window.cgSearch = function(id) {
    const input = document.getElementById(id || 'cgSearchInput');
    if (!input) return;
    const q = input.value.trim();
    if (!q) { input.focus(); return; }
    const hit = cgFindRegion(q);
    let url;
    if (hit) {
      url = 'country.html?c=' + encodeURIComponent(hit.country);
      if (hit.code) url += '&r=' + encodeURIComponent(hit.code);
    } else {
      // 매칭되는 지역이 없으면 일본 페이지에서 키워드 검색
      url = 'country.html?c=japan&q=' + encodeURIComponent(q);
    }
    window.location.href = url;
  };
  window.cgSearchKey = function(e, id) {
    if (e.key === 'Enter') { e.preventDefault(); window.cgSearch(id); }
  };
  // 국기 HTML (윈도우 이모지 깨짐 방지 → 이미지 사용, 회원권은 ⛳)
  function flagHtml(m) {
    return ''; // 국기·이모지 미사용 (텍스트만)
  }

  // ========== 상단 이벤트바 (쿠폰/특가) ==========
  // ▼ 문구만 바꾸면 됨 (href는 연결할 페이지 주소)
  const PROMO_CHEV = '<svg class="cg-promo-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
  function buildPromobar() {
    return `
      <div class="cg-promobar cg-layout-scope">
        <div class="cg-promobar-inner">
          <a href="membership.html" class="cg-promo-left">
            <span class="cg-promo-badge">EVENT</span>
            <span>신규 가입 시 골프투어 <span class="cg-promo-strong">최대 5만원</span> 할인 혜택!</span>
            ${PROMO_CHEV}
          </a>
          <a href="country.html?c=japan" class="cg-promo-right">
            <span class="cg-promo-plane">✈️</span>
            <span>일본 삿포로 골프 특가 오픈</span>
            ${PROMO_CHEV}
          </a>
        </div>
      </div>`;
  }

  // ========== 헤더 2단 (로고 + 검색창 + 아이콘박스) ==========
  const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

  function buildHeader() {
    return `
      <header class="cg-header cg-layout-scope">
        <div class="cg-header-inner">
          <a href="index.html" class="cg-logo">
            <img src="images/choicelogo.png" alt="초이스골프" class="cg-logo-img">
          </a>
          <div class="cg-searchrow">
            <div class="cg-search">
              <input id="cgSearchInput" type="text" placeholder="골프장·지역·상품명을 검색하세요" onkeydown="window.cgSearchKey(event)">
              <button onclick="window.cgSearch()" aria-label="검색">${SEARCH_ICON}</button>
            </div>
            <a href="${KAKAO_CHANNEL_URL}" target="_blank" rel="noopener" class="cg-kakao-consult">
              <span class="cg-kc-text"><em>여행이 궁금하시다면?</em><strong>카카오톡 1:1상담</strong></span>
              <span class="cg-kc-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.52 2 10.86c0 2.8 1.86 5.26 4.65 6.66-.2.72-.74 2.66-.85 3.07-.13.51.19.5.39.37.16-.1 2.5-1.7 3.51-2.39.59.08 1.19.13 1.8.13 5.52 0 10-3.52 10-7.91S17.52 3 12 3z"/></svg></span>
            </a>
          </div>
          <div class="cg-quicklinks">
            <a href="${BAND_URL}" target="_blank" rel="noopener" class="cg-ql cg-ql-band">
              <span class="cg-ql-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.74 2 10.36c0 2.68 1.52 5.06 3.86 6.6-.17.62-.62 2.27-.71 2.62-.11.43.16.42.34.31.14-.09 2.24-1.52 3.15-2.14.74.13 1.51.21 2.36.21 5.52 0 10-3.74 10-8.36S17.52 2 12 2z"/></svg></span>
              <span class="cg-ql-label">네이버밴드</span>
            </a>
            <a href="${YOUTUBE_URL}" target="_blank" rel="noopener" class="cg-ql cg-ql-youtube">
              <span class="cg-ql-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.85-.49-5.7a3.02 3.02 0 0 0-2.12-2.13C18.53 3.68 12 3.68 12 3.68s-6.53 0-8.39.49A3.02 3.02 0 0 0 1.49 6.3C1 8.15 1 12 1 12s0 3.85.49 5.7a3.02 3.02 0 0 0 2.12 2.13c1.86.49 8.39.49 8.39.49s6.53 0 8.39-.49a3.02 3.02 0 0 0 2.12-2.13C23 15.85 23 12 23 12zM9.75 15.57V8.43L15.82 12l-6.07 3.57z"/></svg></span>
              <span class="cg-ql-label">유튜브</span>
            </a>
            <a href="support.html#review" class="cg-ql cg-ql-review">
              <span class="cg-ql-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
              <span class="cg-ql-label">여행후기</span>
            </a>
          </div>
          <button class="cg-menu-btn" onclick="window.cgOpenMenu()" aria-label="메뉴">☰</button>
        </div>
      </header>`;
  }

  // ========== GNB 3단 (국기 메뉴) ==========
  function buildGnb(activeKey) {
    const navItems = MENU.map(m => {
      const aCls = [m.cls || '', m.key === activeKey ? 'cg-active' : ''].filter(Boolean).join(' ');
      return `<div class="cg-nav-item"><a${aCls ? ` class="${aCls}"` : ''} href="${m.href}">${flagHtml(m)}<span>${m.label}</span></a></div>`;
    }).join('');

    return `
      <nav class="cg-gnb cg-layout-scope">
        <div class="cg-gnb-inner">
          ${navItems}
        </div>
      </nav>`;
  }

  // ========== 모바일 메뉴 ==========
  function buildMobileMenu(activeKey) {
    const items = MENU.map(m => {
      const isActive = m.key === activeKey ? ' class="cg-active"' : '';
      return `<a href="${m.href}" onclick="window.cgCloseMenu()"${isActive}>${m.label}</a>`;
    }).join('');

    return `
      <div class="cg-mobile-menu cg-layout-scope" id="cgMobileMenu">
        <button class="cg-mobile-menu-close" onclick="window.cgCloseMenu()" aria-label="닫기">×</button>
        <div class="cg-mm-search">
          <input id="cgSearchInputM" type="text" placeholder="골프장·지역·상품명 검색" onkeydown="window.cgSearchKey(event,'cgSearchInputM')">
        </div>
        <div class="cg-mm-section-title">상품 메뉴</div>
        ${items}
        <div class="cg-mm-section-title">바로가기</div>
        <a href="index.html" onclick="window.cgCloseMenu()">홈</a>
        <a href="#" onclick="window.cgCloseMenu()">로그인</a>
        <a href="#" onclick="window.cgCloseMenu()">예약조회</a>
        <a href="#" onclick="window.cgCloseMenu()">마이페이지</a>
        <a href="#" onclick="window.cgCloseMenu()">회원가입</a>
        <a href="support.html" onclick="window.cgCloseMenu()">고객센터</a>
        <a href="${PHONE_TEL}" class="cg-mm-call" onclick="window.cgCloseMenu()">☎ ${PHONE_NUMBER}</a>
      </div>`;
  }

  // ========== 상단 유틸바 (홈|로그인|예약조회|마이페이지|회원가입|고객센터) ==========
  function buildUtilbar() {
    return ''; /* 🆕 상단 유틸바(홈/로그인/예약조회/마이페이지/회원가입/고객센터) 제거 (요청) */
  }

  // ========== 푸터 ==========
  function buildFooter() {
    const icoBank = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';

    return `
      <footer class="cg-footer cg-layout-scope">
        <div class="cg-footer-inner">
          <div class="cg-f3">

            <!-- ① 회사 정보 -->
            <div class="cg-f-col cg-f-info">
              <div class="cg-footer-logo">
                <img src="images/choicelogo.png" alt="초이스골프" class="cg-footer-logo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
                <div class="cg-footer-logo-kr" style="display:none">초이스골프</div>
              </div>
              <div class="cg-f-line"><span id="cgFooterCompany">주식회사 초이스골프</span> <i>|</i> 대표 : <span id="cgFooterCeo">최진우</span> <a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=5948803010" onclick="window.open(this.href,'bizinfo','width=750,height=700');return false;" class="cg-f-bizbtn">사업자정보확인</a></div>
              <div class="cg-f-line">주소 : <span id="cgFooterAddress">서울특별시 서초구 강남대로101안길 18-1(잠원빌딩) 2층</span></div>
              <div class="cg-f-line">TEL : 1533-3160 <i>|</i> E-mail : <span id="cgFooterEmail">travelchoice@naver.com</span></div>
              <div class="cg-f-line">사업자등록번호 : <span id="cgFooterBizNum">594-88-03010</span> <i>|</i> 통신판매번호 : <span id="cgFooterEcommerce">제2025-000011호</span></div>
              <div class="cg-f-line">관광사업등록번호 : <span id="cgFooterTourism">제0000호</span></div>
              <div class="cg-f-line" id="cgFooterDescRow" style="display:none"><span id="cgFooterDesc"></span></div>
              <div class="cg-f-copy" id="cgFooterCopyright">Copyright ⓒ 초이스골프. All Right Reserved.</div>
            </div>

            <!-- ② 여행상담센터 -->
            <div class="cg-f-col cg-f-center">
              <div class="cg-f-telbox">
                <div class="cg-f-telrow">
                  <span class="cg-f-telico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg></span>
                  <span class="cg-f-telinfo"><em>국내·해외골프투어 문의</em><strong id="cgFooterPhone">1533-3160</strong></span>
                </div>
                <div class="cg-f-telrow">
                  <span class="cg-f-telico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg></span>
                  <span class="cg-f-telinfo"><em>골프 회원권 문의</em><strong>02-545-5055</strong></span>
                </div>
              </div>
            </div>

            <!-- ③ 입금계좌안내 -->
            <div class="cg-f-col cg-f-bank">
              <div class="cg-f-col-title">입금계좌안내</div>
              <div class="cg-f-telbox">
                <div class="cg-f-telrow">
                  <span class="cg-f-telico cg-f-bankico">${icoBank}</span>
                  <span class="cg-f-telinfo"><em class="cg-f-bankname">하나은행</em><strong>103-910072-08204</strong></span>
                </div>
                <div class="cg-f-telrow cg-f-holder-row">
                  <span class="cg-f-holder">예금주 : 주식회사 초이스골프</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </footer>`;
  }

  // ========== 플로팅 + 모바일 액션바 ==========
  function buildFloating() {
    return `
      <div class="cg-mobile-action-bar cg-layout-scope">
        <a href="${PHONE_TEL}" class="cg-mab-btn cg-mab-call"><span class="cg-mab-icon">📞</span>전화상담</a>
        <a href="${KAKAO_CHANNEL_URL}" target="_blank" rel="noopener" class="cg-mab-btn cg-mab-kakao"><span class="cg-mab-icon">💬</span>채팅상담</a>
      </div>`;
  }

  // ========== 풋터 동적 정보 (Supabase site_settings) ==========
  async function loadFooterFromSupabase() {
    try {
      // 페이지에서 이미 정의된 SUPABASE 정보 활용
      const url = window.SUPABASE_URL || 'https://qmzrpyyadoajwziqachm.supabase.co';
      const key = window.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtenJweXlhZG9hand6aXFhY2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDI0NDcsImV4cCI6MjA4OTc3ODQ0N30.CI6ZFvNa2TRa0XqwnrXKL9x3ZHXfKg6GaNwJhqYvCmc';
      const res = await fetch(`${url}/rest/v1/site_settings?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      if (!res.ok) return;
      const rows = await res.json();
      const S = {};
      rows.forEach(r => { S[r.key] = r.value || ''; });

      // 🆕 응답에 key가 존재하면 무조건 그 값을 반영 (빈 문자열이면 비우기)
      function applyText(id, key) {
        if (!(key in S)) return;             // DB에 키 자체가 없으면 기본값 유지
        const el = document.getElementById(id);
        if (el) el.textContent = S[key];     // 빈 문자열이어도 그대로 반영
      }

      applyText('cgFooterCompany',   'company_name');
      applyText('cgFooterCeo',       'ceo_name');
      applyText('cgFooterEmail',     'email');
      applyText('cgFooterPhone',     'phone');
      applyText('cgFooterAddress',   'address');
      applyText('cgFooterBizNum',    'business_number');
      applyText('cgFooterTourism',   'tourism_number');
      applyText('cgFooterEcommerce', 'ecommerce_number');
      applyText('cgFooterCopyright', 'copyright_text');

      // 🆕 푸터 소개 문구: DB에 키가 있으면 그 값(빈값 포함) 그대로, 빈 값이면 줄 자체를 숨김
      if ('footer_description' in S) {
        const descRow = document.getElementById('cgFooterDescRow');
        const descEl  = document.getElementById('cgFooterDesc');
        if (descRow && descEl) {
          const v = (S.footer_description || '').trim();
          descEl.textContent = v;
          descRow.style.display = v ? '' : 'none';   // 비어있으면 줄 자체 숨김
        }
      }
    } catch(e) {
      console.warn('[layout] 푸터 정보 로드 실패:', e);
    }
  }

  // ========== 모바일 메뉴 열기/닫기 (전역 함수) ==========
  window.cgOpenMenu = function() {
    const m = document.getElementById('cgMobileMenu');
    if (m) m.classList.add('open');
  };
  window.cgCloseMenu = function() {
    const m = document.getElementById('cgMobileMenu');
    if (m) m.classList.remove('open');
  };

  // ========== 초기화 ==========
  function init() {
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isHome = (path === '' || path === 'index.html');
    const activeKey = getActiveKey();

    // 1. style 주입
    const styleEl = document.createElement('style');
    styleEl.id = 'cg-layout-style';
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);

    // 2. 헤더 자리 처리 (유틸바 + 헤더 + GNB + 모바일메뉴)
    // <div id="cg-header"></div> 가 있으면 거기에, 없으면 body 맨 위에 삽입
    const headerSlot = document.getElementById('cg-header');
    const headerHtml = buildPromobar() + buildUtilbar() + buildHeader() + buildGnb(activeKey) + buildMobileMenu(activeKey);
    
    if (headerSlot) {
      headerSlot.outerHTML = headerHtml;
    } else {
      document.body.insertAdjacentHTML('afterbegin', headerHtml);
    }

    // 3. 푸터 자리 처리
    const footerSlot = document.getElementById('cg-footer');
    const footerHtml = buildFooter() + buildFloating();
    
    if (footerSlot) {
      footerSlot.outerHTML = footerHtml;
    } else {
      document.body.insertAdjacentHTML('beforeend', footerHtml);
    }

    // 4. 동적 풋터 정보 로드
    loadFooterFromSupabase();
  }

  // DOM 준비되면 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
