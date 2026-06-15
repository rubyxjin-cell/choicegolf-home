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
  @media (max-width: 900px) {
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
    align-items: center !important;
    gap: 0 !important;
    max-width: 1440px !important;
    margin: 0 auto !important;
    padding: 11px 40px !important;
  }
  .cg-logo {
    flex-shrink: 0 !important;
    display: block !important;
    text-decoration: none !important;
    line-height: 0 !important;
    justify-self: end !important;
    margin-right: 78px !important;
  }
  .cg-logo-img {
    height: 40px !important;
    width: auto !important;
    display: block !important;
  }

  /* 가운데 검색창 (정중앙) */
  .cg-search {
    width: 620px !important;
    max-width: 100% !important;
    display: flex !important;
    align-items: center !important;
    border: 2px solid #1B4332 !important;
    border-radius: 8px !important;
    overflow: hidden !important;
    background: #fff !important;
  }
  .cg-search input {
    flex: 1 !important;
    border: none !important;
    outline: none !important;
    padding: 11px 18px !important;
    font-size: 15px !important;
    color: #333 !important;
    background: transparent !important;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif !important;
  }
  .cg-search input::placeholder { color: #aaa !important; }
  .cg-search button {
    border: none !important;
    background: transparent !important;
    padding: 0 18px !important;
    cursor: pointer !important;
    color: #1B4332 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .cg-search button svg { width: 22px !important; height: 22px !important; }

  /* 우측 아이콘박스 4개 */
  .cg-quicklinks {
    display: flex !important;
    align-items: flex-start !important;
    gap: 12px !important;
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

  /* ===== GNB 3단 (가로 텍스트 메뉴) ===== */
  .cg-gnb {
    background: #fff !important;
    border-top: 1px solid #f0f0f0 !important;
    border-bottom: 2px solid #1B4332 !important;
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
    flex-wrap: wrap !important;
  }
  .cg-nav-item { position: relative !important; }
  .cg-nav-item > a {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 20px 36px !important;
    font-size: 18.5px !important;
    font-weight: 700 !important;
    color: #333 !important;
    text-decoration: none !important;
    letter-spacing: -0.2px !important;
    transition: color 0.2s ease !important;
    position: relative !important;
    white-space: nowrap !important;
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

  @media (max-width: 1100px) {
    .cg-nav-item > a { padding: 18px 24px; font-size: 16.5px; }
    .cg-header-inner { padding: 14px 24px !important; }
    .cg-logo { margin-right: 16px !important; }
    .cg-search { width: 420px !important; }
  }
  @media (max-width: 900px) {
    .cg-search, .cg-quicklinks, .cg-gnb { display: none !important; }
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
  @media (max-width: 768px) {
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
    background: linear-gradient(180deg, #ffffff 0%, #eef3fb 100%);
    color: #4a5568;
    padding: 32px 0 20px;
    font-size: 13px;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
    border-top: 1px solid #e3eaf5;
    overflow: hidden;
  }
  /* 하단 연한 물결 */
  .cg-footer::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 90px;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1440' height='130' viewBox='0 0 1440 130' preserveAspectRatio='none'%3E%3Cpath d='M0 70 C 280 30, 520 110, 760 70 S 1200 30, 1440 70 L1440 130 L0 130 Z' fill='%232563eb' fill-opacity='0.05'/%3E%3Cpath d='M0 90 C 320 55, 560 120, 800 90 S 1220 55, 1440 90 L1440 130 L0 130 Z' fill='%2360a5fa' fill-opacity='0.06'/%3E%3C/svg%3E") bottom center / 100% 90px no-repeat;
    pointer-events: none;
    z-index: 0;
  }
  .cg-footer-inner { max-width: 1280px; margin: 0 auto; padding: 0 40px; position: relative; z-index: 1; }
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
  @media (max-width: 900px) {
    .cg-footer-top { flex-direction: column; gap: 24px; align-items: center; text-align: center; }
    .cg-footer-biz { text-align: center; }
    .cg-footer-biz .cg-biz-row { justify-content: center; }
    .cg-footer-biz .cg-biz-item + .cg-biz-item::before { display: none; }
  }
  @media (max-width: 768px) {
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
  @media (max-width: 768px) {
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
    { key: 'japan',      label: '일본',     href: 'country.html?c=japan' },
    { key: 'taiwan',     label: '대만',     href: 'country.html?c=taiwan' },
    { key: 'thailand',   label: '태국',     href: 'country.html?c=thailand' },
    { key: 'vietnam',    label: '베트남',   href: 'country.html?c=vietnam' },
    { key: 'philippines',label: '필리핀',   href: 'country.html?c=philippines' },
    { key: 'china',      label: '중국',     href: 'country.html?c=china' },
    { key: 'korea',      label: '국내골프', href: 'country.html?c=korea' },
    { key: 'membership', label: '회원권',   href: 'membership.html' }
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

  // ========== 헤더 2단 (로고 + 검색창 + 아이콘박스) ==========
  const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

  function buildHeader() {
    return `
      <header class="cg-header cg-layout-scope">
        <div class="cg-header-inner">
          <a href="index.html" class="cg-logo">
            <img src="images/choicelogo.png" alt="초이스골프" class="cg-logo-img">
          </a>
          <div class="cg-search">
            <input id="cgSearchInput" type="text" placeholder="골프장·지역·상품명을 검색하세요" onkeydown="window.cgSearchKey(event)">
            <button onclick="window.cgSearch()" aria-label="검색">${SEARCH_ICON}</button>
          </div>
          <div class="cg-quicklinks">
            <a href="membership.html" class="cg-ql cg-ql-membership">
              <span class="cg-ql-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg></span>
              <span class="cg-ql-label">골프회원권</span>
            </a>
            <a href="${BAND_URL}" target="_blank" rel="noopener" class="cg-ql cg-ql-band">
              <span class="cg-ql-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.74 2 10.36c0 2.68 1.52 5.06 3.86 6.6-.17.62-.62 2.27-.71 2.62-.11.43.16.42.34.31.14-.09 2.24-1.52 3.15-2.14.74.13 1.51.21 2.36.21 5.52 0 10-3.74 10-8.36S17.52 2 12 2z"/></svg></span>
              <span class="cg-ql-label">네이버밴드</span>
            </a>
            <a href="${KAKAO_CHANNEL_URL}" target="_blank" rel="noopener" class="cg-ql cg-ql-kakao">
              <span class="cg-ql-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.48 3 2 6.52 2 10.86c0 2.8 1.86 5.26 4.65 6.66-.2.72-.74 2.66-.85 3.07-.13.51.19.5.39.37.16-.1 2.5-1.7 3.51-2.39.59.08 1.19.13 1.8.13 5.52 0 10-3.52 10-7.91S17.52 3 12 3z"/></svg></span>
              <span class="cg-ql-label">카카오톡</span>
            </a>
            <a href="${CONFIRMED_URL}" class="cg-ql cg-ql-confirm">
              <span class="cg-ql-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></span>
              <span class="cg-ql-label">출발확정상품</span>
            </a>
          </div>
          <button class="cg-menu-btn" onclick="window.cgOpenMenu()" aria-label="메뉴">☰</button>
        </div>
      </header>`;
  }

  // ========== GNB 3단 (가로 텍스트 메뉴) ==========
  function buildGnb(activeKey) {
    const navItems = MENU.map(m => {
      const isActive = m.key === activeKey ? ' class="cg-active"' : '';
      return `<div class="cg-nav-item"><a href="${m.href}"${isActive}>${m.label}</a></div>`;
    }).join('');
    return `
      <nav class="cg-gnb cg-layout-scope">
        <div class="cg-gnb-inner">${navItems}</div>
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
    return `
      <div class="cg-utilbar cg-layout-scope">
        <div class="cg-utilbar-inner">
          <a href="index.html">홈</a>
          <span class="cg-util-sep">|</span>
          <a href="#">로그인</a>
          <span class="cg-util-sep">|</span>
          <a href="#">예약조회</a>
          <span class="cg-util-sep">|</span>
          <a href="#">마이페이지</a>
          <span class="cg-util-sep">|</span>
          <a href="#">회원가입</a>
          <span class="cg-util-sep">|</span>
          <a href="support.html">고객센터</a>
        </div>
      </div>`;
  }

  // ========== 푸터 ==========
  function buildFooter() {
    const icoBuilding = '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="11" height="18" rx="1"/><path d="M15 8h5v13H4"/><path d="M8 7h3M8 11h3M8 15h3"/></svg>';
    const icoUser = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"/></svg>';
    const icoMail = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
    const icoPhone = '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>';
    const icoPin = '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    const icoDoc = '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>';
    const icoBadge = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M9 13l-2 8 5-3 5 3-2-8"/></svg>';
    const icoCart = '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/><path d="M2 3h3l2.4 12.4a2 2 0 002 1.6h9.2a2 2 0 002-1.6L23 6H6"/></svg>';

    return `
      <footer class="cg-footer cg-layout-scope">
        <div class="cg-footer-inner">
          <div class="cg-footer-top">
            <div class="cg-footer-logo">
              <img src="images/choicelogo.png" alt="초이스골프" class="cg-footer-logo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block';this.nextElementSibling.nextElementSibling.style.display='block';">
              <div class="cg-footer-logo-kr" id="cgFooterLogoKr" style="display:none">초이스골프</div>
              <div class="cg-footer-logo-en" style="display:none">CHOICE GOLF</div>
            </div>
            <div class="cg-footer-biz">
              <div class="cg-biz-row">
                <span class="cg-biz-item"><span class="cg-biz-ico">${icoBuilding}</span><span class="cg-biz-label">상호 :</span><span class="cg-biz-val" id="cgFooterCompany">㈜초이스골프</span></span>
                <span class="cg-biz-item"><span class="cg-biz-ico">${icoUser}</span><span class="cg-biz-label">대표 :</span><span class="cg-biz-val" id="cgFooterCeo">최진우</span></span>
                <span class="cg-biz-item"><span class="cg-biz-ico">${icoMail}</span><span class="cg-biz-label">이메일 :</span><span class="cg-biz-val" id="cgFooterEmail">travelchoice@naver.com</span></span>
                <span class="cg-biz-item"><span class="cg-biz-ico">${icoPhone}</span><span class="cg-biz-label">전화 :</span><span class="cg-biz-val" id="cgFooterPhone">1533-3160</span></span>
                <span class="cg-biz-item"><span class="cg-biz-ico">${icoDoc}</span><span class="cg-biz-label">사업자등록 :</span><span class="cg-biz-val" id="cgFooterBizNum">594-88-03010</span></span>
              </div>
              <div class="cg-biz-row">
                <span class="cg-biz-item"><span class="cg-biz-ico">${icoPin}</span><span class="cg-biz-label">주소 :</span><span class="cg-biz-val" id="cgFooterAddress">서울특별시 서초구 강남대로101안길 18-1(잠원빌딩) 2층</span></span>
                <span class="cg-biz-item"><span class="cg-biz-ico">${icoBadge}</span><span class="cg-biz-label">관광사업 :</span><span class="cg-biz-val" id="cgFooterTourism">제0000호</span></span>
                <span class="cg-biz-item"><span class="cg-biz-ico">${icoCart}</span><span class="cg-biz-label">통신판매 :</span><span class="cg-biz-val" id="cgFooterEcommerce">제2025-000011호</span></span>
              </div>
              <div class="cg-biz-row" id="cgFooterDescRow" style="display:none">
                <span id="cgFooterDesc"></span>
              </div>
            </div>
          </div>
          <div class="cg-footer-bottom" id="cgFooterCopyright">
            © 2024 CHOICE GOLF · 초이스골프. All Rights Reserved
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
    const headerHtml = buildUtilbar() + buildHeader() + buildGnb(activeKey) + buildMobileMenu(activeKey);
    
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
