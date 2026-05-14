/* ===================================================================
 * Choice Golf Layout System
 * - 헤더 + 푸터 + 공지바 + 플로팅 버튼 + 모바일 하단바 통합 관리
 * - 모든 페이지에 <script src="layout.js"></script> 한 줄만 추가
 * - 본 파일 1개만 수정하면 모든 페이지에 자동 반영
 * =================================================================== */

(function() {
  'use strict';

  // ========== 설정 ==========
  const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_xjxjxj';
  const PHONE_NUMBER = '1533-3160';
  const PHONE_TEL = 'tel:15333160';

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

  /* ===== 공지바 ===== */
  .cg-announce {
    background: linear-gradient(90deg, #0F2C20 0%, #1B4332 50%, #0F2C20 100%);
    color: #f4e4a8;
    text-align: center;
    padding: 11px 20px;
    font-size: 13px;
    letter-spacing: 3px;
    font-weight: 500;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
    border-top: 1px solid rgba(201, 169, 97, 0.25);
    border-bottom: 1px solid rgba(201, 169, 97, 0.25);
    position: relative;
  }
  .cg-announce b {
    color: #e4c97e;
    font-weight: 600;
    letter-spacing: 3.5px;
    background: linear-gradient(90deg, #e4c97e, #f4e4a8, #c9a961);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .cg-announce .cg-announce-dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #c9a961;
    border-radius: 50%;
    margin: 0 14px;
    vertical-align: middle;
    opacity: 0.7;
  }
  .cg-announce.hidden-on-home { display: none; }
  @media (max-width: 768px) {
    .cg-announce { font-size: 11.5px; letter-spacing: 2px; padding: 9px 16px; }
    .cg-announce b { letter-spacing: 2.5px; }
    .cg-announce .cg-announce-dot { margin: 0 9px; }
  }

  /* ===== 헤더 ===== */
  .cg-header {
    background: linear-gradient(180deg, #0F2C20 0%, #1B4332 100%) !important;
    border-bottom: none !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: 0 4px 20px rgba(15, 44, 32, 0.15) !important;
  }
  .cg-header::after {
    content: '' !important;
    position: absolute !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    height: 2px !important;
    background: linear-gradient(90deg, transparent 0%, rgba(201, 169, 97, 0.5) 25%, #c9a961 50%, rgba(201, 169, 97, 0.5) 75%, transparent 100%) !important;
    pointer-events: none !important;
  }
  .cg-header * { 
    box-sizing: border-box !important;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif !important;
  }
  .cg-header-inner {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 14px 40px !important;
    max-width: 1440px !important;
    margin: 0 auto !important;
    gap: 32px !important;
    height: auto !important;
  }
  .cg-logo {
    display: flex !important;
    flex-direction: column !important;
    line-height: 1 !important;
    flex-shrink: 0 !important;
    text-decoration: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .cg-logo-main {
    font-family: 'Cormorant Garamond', serif !important;
    font-size: 24px !important;
    font-weight: 500 !important;
    color: #e4c97e !important;
    letter-spacing: 3px !important;
    line-height: 1 !important;
    text-transform: none !important;
    font-style: normal !important;
  }
  .cg-logo-sub {
    font-family: 'Gaegu', cursive !important;
    font-size: 11px !important;
    color: rgba(244, 228, 168, 0.7) !important;
    letter-spacing: 1.5px !important;
    margin-top: 3px !important;
    line-height: 1 !important;
    font-weight: 400 !important;
    font-style: normal !important;
  }

  /* GNB */
  .cg-nav {
    display: flex !important;
    align-items: center !important;
    gap: 44px !important;
    font-size: 15.5px !important;
    font-weight: 500 !important;
    flex: 1 !important;
    justify-content: center !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .cg-nav-item { position: relative !important; margin: 0 !important; padding: 0 !important; }
  .cg-nav-item > a {
    display: block !important;
    padding: 20px 4px !important;
    color: #FAF6EE !important;
    letter-spacing: 1px !important;
    transition: color 0.25s ease !important;
    position: relative !important;
    text-decoration: none !important;
    font-size: 15.5px !important;
    font-weight: 500 !important;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif !important;
    line-height: 1 !important;
    text-transform: none !important;
  }
  .cg-nav-item > a:hover { color: #e4c97e !important; }
  .cg-nav-item > a.cg-active { color: #e4c97e !important; }
  .cg-nav-item > a.cg-active::before {
    content: '' !important;
    position: absolute !important;
    left: 0 !important; right: 0 !important; bottom: 0 !important;
    height: 2.5px !important;
    background: linear-gradient(90deg, #c9a961, #f4e4a8, #c9a961) !important;
    border-radius: 2px !important;
  }
  .cg-nav-item.has-dropdown > a::after {
    content: '▾' !important;
    font-size: 10px !important;
    margin-left: 6px !important;
    display: inline-block !important;
    transition: transform 0.25s !important;
    vertical-align: 2px !important;
    opacity: 0.6 !important;
    color: #c9a961 !important;
  }
  .cg-nav-item.has-dropdown:hover > a::after { transform: rotate(180deg); opacity: 1 !important; }

  /* 드롭다운 */
  .cg-dropdown {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    padding: 18px 8px;
    min-width: 240px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.22s ease;
    box-shadow: 0 18px 44px rgba(15,44,32,0.13);
    z-index: 200;
  }
  .cg-dropdown::before {
    content: '';
    position: absolute;
    top: -8px; left: 0; right: 0; height: 8px;
  }
  .cg-nav-item:hover .cg-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
  .cg-dropdown a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    font-size: 13.5px;
    font-weight: 500;
    color: #252525;
    border-radius: 6px;
    transition: all 0.15s;
    white-space: nowrap;
    text-decoration: none;
  }
  .cg-dropdown a:hover {
    background: #FAF6EE;
    color: #1B4332;
    padding-left: 22px;
  }
  .cg-dropdown a .cg-flag { font-size: 16px; line-height: 1; }
  .cg-dropdown a .cg-arrow {
    margin-left: auto;
    color: #d4d4d4;
    font-size: 12px;
    opacity: 0;
    transition: all 0.2s;
  }
  .cg-dropdown a:hover .cg-arrow { opacity: 1; color: #c9a961; }
  .cg-dropdown .cg-dd-header {
    padding: 4px 18px 12px;
    font-size: 11px;
    letter-spacing: 2px;
    color: #c9a961;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 1px solid #e5e5e5;
    margin-bottom: 8px;
  }
  .cg-dropdown.wide {
    min-width: 580px;
    padding: 22px 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 18px;
  }
  .cg-dropdown.wide .cg-dd-header { grid-column: 1/-1; }

  /* 헤더 우측 */
  .cg-header-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .cg-btn-call {
    background: #1B4332;
    color: #fff;
    padding: 10px 20px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.5px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .cg-btn-call:hover { background: #0F2C20; }
  .cg-menu-btn {
    display: none;
    background: transparent;
    border: 1px solid rgba(201, 169, 97, 0.4);
    border-radius: 8px;
    font-size: 22px;
    color: #e4c97e;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .cg-menu-btn:hover { background: rgba(201, 169, 97, 0.1); border-color: #c9a961; }

  @media (max-width: 1100px) {
    .cg-nav { gap: 24px; font-size: 14px; }
    .cg-nav-item > a { font-size: 14px; letter-spacing: 0.5px; }
    .cg-header-inner { gap: 20px; padding: 12px 24px; }
  }
  @media (max-width: 900px) {
    .cg-nav, .cg-btn-call { display: none; }
    .cg-menu-btn { display: flex; }
    .cg-header-inner { padding: 12px 20px; }
    .cg-logo-main { font-size: 20px; letter-spacing: 2.5px; }
    .cg-logo-sub { font-size: 10px; }
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

  /* ===== 푸터 ===== */
  .cg-footer {
    background: #0F2C20;
    color: rgba(255,255,255,0.7);
    padding: 40px 0 24px;
    font-size: 13px;
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
  }
  .cg-footer-inner { max-width: 1280px; margin: 0 auto; padding: 0 40px; }
  .cg-footer-biz {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    line-height: 1.9;
    margin-bottom: 20px;
  }
  .cg-footer-biz strong { color: rgba(255,255,255,0.6); font-weight: 500; }
  .cg-footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    letter-spacing: 1px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .cg-footer-links { display: flex; gap: 20px; }
  .cg-footer-links a { color: inherit; text-decoration: none; }
  .cg-footer-links a:hover { color: #e4c97e; }
  @media (max-width: 768px) {
    .cg-footer-inner { padding: 0 20px; }
    .cg-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
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
  `;

  // ========== 메뉴 데이터 ==========
  const MENU = [
    { key: 'home', label: '홈', href: 'index.html' },
    {
      key: 'overseas',
      label: '해외골프',
      href: 'overseas.html',
      dropdown: {
        wide: true,
        header: 'Overseas Golf',
        items: [
          { label: '🌏 해외골프 전체', href: 'overseas.html' },
          { flag: '🇯🇵', label: '일본', href: 'country.html?c=japan' },
          { flag: '🇹🇼', label: '대만', href: 'country.html?c=taiwan' },
          { flag: '🇹🇭', label: '태국', href: 'country.html?c=thailand' },
          { flag: '🇻🇳', label: '베트남', href: 'country.html?c=vietnam' },
          { flag: '🇵🇭', label: '필리핀', href: 'country.html?c=philippines' },
          { flag: '🇨🇳', label: '중국', href: 'country.html?c=china' },
          { flag: '🌏', label: '기타 아시아', href: 'country.html?c=etc' }
        ]
      }
    },
    {
      key: 'domestic',
      label: '국내골프',
      href: 'country.html?c=korea',
      dropdown: {
        header: 'Domestic Golf',
        items: [
          { label: '전체 국내골프', href: 'country.html?c=korea' },
          { label: '강원', href: 'country.html?c=korea&region=강원' },
          { label: '경기·인천', href: 'country.html?c=korea&region=경기' },
          { label: '충청', href: 'country.html?c=korea&region=충청' },
          { label: '경상', href: 'country.html?c=korea&region=경상' },
          { label: '전라', href: 'country.html?c=korea&region=전라' },
          { label: '제주', href: 'country.html?c=korea&region=제주' }
        ]
      }
    },
    {
      key: 'membership',
      label: '회원권',
      href: 'membership.html',
      dropdown: {
        header: 'VIP Membership',
        items: [
          { label: '전체 회원권', href: 'membership.html' },
          { label: 'TCM 평생 멤버쉽', href: 'tcm-detail.html' },
          { label: '시에나 리조트', href: 'sienna-detail.html' },
          { label: '크루지아나 골프리조트', href: 'membership-detail.html' }
        ]
      }
    },
    { key: 'community', label: '커뮤니티', href: 'support.html' }
  ];

  // ========== 현재 페이지 메뉴 active 자동 감지 ==========
  function getActiveKey() {
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const search = window.location.search.toLowerCase();

    if (path === '' || path === 'index.html') return 'home';
    if (path === 'membership.html' || path === 'tcm-detail.html' || 
        path === 'sienna-detail.html' || path === 'membership-detail.html') return 'membership';
    if (path === 'support.html' || path === 'community.html') return 'community';
    if (path === 'overseas.html') return 'overseas';
    if (path === 'list.html') {
      return '';
    }
    if (path === 'country.html') {
      if (search.includes('c=korea')) return 'domestic';
      return 'overseas';
    }
    if (path === 'product.html') return ''; // 상품 상세는 url로 판단 어려움
    return '';
  }

  // ========== 헤더 HTML 생성 ==========
  function buildHeader(activeKey) {
    const navItems = MENU.map(m => {
      const isActive = m.key === activeKey;
      const hasDropdown = !!m.dropdown;
      
      let dropdownHtml = '';
      if (hasDropdown) {
        const wide = m.dropdown.wide ? ' wide' : '';
        const ddItems = m.dropdown.items.map(item => {
          const flag = item.flag ? `<span class="cg-flag">${item.flag}</span>` : '';
          return `<a href="${item.href}">${flag}${item.label}<span class="cg-arrow">→</span></a>`;
        }).join('');
        dropdownHtml = `
          <div class="cg-dropdown${wide}">
            <div class="cg-dd-header">${m.dropdown.header}</div>
            ${ddItems}
          </div>`;
      }
      
      return `
        <div class="cg-nav-item${hasDropdown ? ' has-dropdown' : ''}">
          <a href="${m.href}"${isActive ? ' class="cg-active"' : ''}>${m.label}</a>
          ${dropdownHtml}
        </div>`;
    }).join('');

    return `
      <header class="cg-header cg-layout-scope">
        <div class="cg-header-inner">
          <a href="index.html" class="cg-logo">
            <span class="cg-logo-main">CHOICE GOLF</span>
            <span class="cg-logo-sub">초이스골프</span>
          </a>
          <nav class="cg-nav">${navItems}</nav>
          <div class="cg-header-actions">
            <button class="cg-menu-btn" onclick="window.cgOpenMenu()" aria-label="메뉴">☰</button>
          </div>
        </div>
      </header>`;
  }

  // ========== 모바일 메뉴 ==========
  function buildMobileMenu(activeKey) {
    const sections = [];
    MENU.forEach(m => {
      if (m.dropdown) {
        sections.push(`<div class="cg-mm-section-title">${m.label}</div>`);
        m.dropdown.items.forEach(item => {
          const flag = item.flag ? item.flag + ' ' : '';
          const isActive = m.key === activeKey ? ' cg-active' : '';
          sections.push(`<a href="${item.href}" onclick="window.cgCloseMenu()" class="cg-mm-sub${isActive}">${flag}${item.label}</a>`);
        });
      } else {
        const isActive = m.key === activeKey ? ' cg-active' : '';
        sections.push(`<a href="${m.href}" onclick="window.cgCloseMenu()"${isActive ? ' class="' + isActive.trim() + '"' : ''}>${m.label}</a>`);
      }
    });

    return `
      <div class="cg-mobile-menu cg-layout-scope" id="cgMobileMenu">
        <button class="cg-mobile-menu-close" onclick="window.cgCloseMenu()" aria-label="닫기">×</button>
        ${sections.join('')}
        <a href="${PHONE_TEL}" class="cg-mm-call" onclick="window.cgCloseMenu()">☎ ${PHONE_NUMBER}</a>
      </div>`;
  }

  // ========== 공지바 (삭제됨) ==========
  function buildAnnounce(isHome) {
    return ''; // 공지바 완전 제거
  }

  // ========== 푸터 ==========
  function buildFooter() {
    return `
      <footer class="cg-footer cg-layout-scope">
        <div class="cg-footer-inner">
          <div class="cg-footer-biz" id="cgFooterBiz">
            <strong>㈜초이스골프</strong> · 대표 · 사업자등록번호 · 통신판매업신고<br>
            주소 · 전화 ${PHONE_NUMBER}
          </div>
          <div class="cg-footer-bottom">
            <div>© 2026 CHOICE GOLF. All rights reserved.</div>
            <div class="cg-footer-links">
              <a href="index.html">홈</a>
              <a href="membership.html">회원권</a>
              <a href="support.html">커뮤니티</a>
            </div>
          </div>
        </div>
      </footer>`;
  }

  // ========== 플로팅 + 모바일 액션바 ==========
  function buildFloating() {
    return `
      <a href="${KAKAO_CHANNEL_URL}" target="_blank" rel="noopener" class="cg-float-kakao cg-layout-scope">K</a>
      <a href="${PHONE_TEL}" class="cg-float-call cg-layout-scope">☎</a>
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
      const bizEl = document.getElementById('cgFooterBiz');
      if (bizEl && S.footer_biz) bizEl.innerHTML = S.footer_biz;
    } catch(e) { /* 무시 */ }
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

    // 2. 헤더 자리 처리
    // <div id="cg-header"></div> 가 있으면 거기에, 없으면 body 맨 위에 삽입
    const headerSlot = document.getElementById('cg-header');
    const headerHtml = buildAnnounce(isHome) + buildHeader(activeKey) + buildMobileMenu(activeKey);
    
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
