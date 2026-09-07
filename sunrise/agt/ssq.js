/* ==========================================================================
   SUN & SKY GOLF KOREA · 투어 견적서 공용 모듈 (window.SSQ)
   - 저장: Supabase yg_settings 테이블, key = 'ssq_' + id, value = 견적 JSON
     (anon 키로 읽기·업서트 가능 — 별도 테이블 없이 동작)
   - 렌더: SSQ.render(q) → .qdoc HTML, SSQ.mount(el, q) → 표시 + 좁은 화면 대응
   - 공유: SSQ.link(id) 공개 링크, SSQ.toJpg(docEl, name) JPG 저장
   ========================================================================== */
(function(){
  var SB_URL = 'https://qmzrpyyadoajwziqachm.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtenJweXlhZG9hand6aXFhY2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDI0NDcsImV4cCI6MjA4OTc3ODQ0N30.CI6ZFvNa2TRa0XqwnrXKL9x3ZHXfKg6GaNwJhqYvCmc';
  var IMG = SB_URL + '/storage/v1/object/public/golf-images/';
  var LOGO = IMG + 'sunrise-logo2.png';
  var CG_LOGO = IMG + 'sunrise/choice-logo-h.png';
  var ILL = IMG + 'sunrise/passport-illust.jpg';   /* 여권 접수란 예시 그림 */   /* 담당: 초이스골프 로고 (사장님 지시 2026-09-07) */
  var HERO = {
    sunrise:   IMG + 'sunrise-main1.jpg',
    skyvalley: IMG + 'sunrise/skyvalley/hotel-main.jpg'
  };
  var HOTEL = {
    sunrise:   { kr:'썬라이즈 라군 호텔 & 골프', en:'SUNRISE LAGOON HOTEL & GOLF · THAILAND', short:'썬라이즈 라군' },
    skyvalley: { kr:'스카이밸리 골프텔', en:'SKY VALLEY GOLF & HOTEL · THAILAND', short:'스카이밸리' }
  };
  var COURSE = { sunrise:'썬라이즈 라군 C.C', skyvalley:'스카이밸리 C.C' };
  var BANK = { bank:'하나은행', no:'103-910072-08204', holder:'(주)초이스골프' };
  /* 견적서 발행·예약 관리 주체 = 초이스골프 (사장님 지시 2026-09-07: 회사명·담당·예약실 번호만) */
  var CO = { name:'주식회사 초이스골프', mgr:'담당 최진우 부장', tel:'예약실 1533-3160', role:'썬앤스카이골프코리아 회원 골프여행 예약 · 관리' };
  var DEF_INC = [
    '호텔 숙박 (2인 1실)',
    '조식 · 중식 · 석식 (한식 뷔페)',
    '무제한 그린피 (썬라이즈 라군 · 스카이밸리)'
  ].join('\n');
  var DEF_EXC = [
    '왕복 항공료',
    '카트 · 캐디피 · 팁 (현지 지불)',
    '공항 미팅 · 샌딩 (현지 지불)'
  ].join('\n');
  /* 현지 지불 요금 안내 — 견적서에 항상 표기 (sunrise/index.html 공개 요금표와 동일하게 유지) */
  var LOCAL_FEES = [
    ['카트 · 캐디피 · 팁', '18홀 $35 /인', '추가 9홀 $10 · 추가 18홀 $20 (2인 1카트)'],
    ['공항 미팅 · 샌딩', '1인 $50 ~ $80', '2인 $80 · 3인 $60 · 4인 이상 $50 (1인당)'],
    ['스카이밸리 노캐디', '성수기 18홀 $20 /인', '비수기 1일 무제한 $35 /인'],
    ['객실 싱글 차지 (선택)', '1박 25,000원', '비수기 기준 · 그 외 시즌 30,000원']
  ];

  var DOW = ['일','월','화','수','목','금','토'];
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function won(n){ return (Number(n)||0).toLocaleString(); }
  function ds2d(ds){ var p=String(ds).split('-').map(Number); return new Date(p[0],p[1]-1,p[2]); }
  function fmtYMD(ds){ if(!ds) return '-'; var d=ds2d(ds); return d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate()+'('+DOW[d.getDay()]+')'; }
  function fmtMD(ds){ if(!ds) return '-'; var d=ds2d(ds); return (d.getMonth()+1)+'.'+d.getDate()+'('+DOW[d.getDay()]+')'; }
  function fmtDot(ds){ if(!ds) return '-'; var d=ds2d(ds); return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0'); }
  function nights(a,b){ if(!a||!b) return 0; return Math.round((ds2d(b)-ds2d(a))/86400000); }
  /* 귀국편이 다음날 인천 도착(+1일)이면 마지막 밤은 기내 — 호텔 박수는 하루 적고, 일수는 그대로 */
  function isP1(q){ return !!(q && q.inb && typeof q.inb === 'object' && q.inb.p1); }
  function hotelNights(q){ var n = nights(q.s, q.e); return n > 0 ? n - (isP1(q) ? 1 : 0) : 0; }
  function tripDays(q){ var n = nights(q.s, q.e); return n > 0 ? n + 1 : 0; }
  function stayTxt(q){ var hn = hotelNights(q), d = tripDays(q); return hn > 0 ? hn + '박 ' + d + '일' : ''; }
  function addDays(ds,n){ var d=ds2d(ds); d.setDate(d.getDate()+n); return d2ds(d); }
  function d2ds(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function fltStr(f){
    if(!f) return '';
    if(typeof f === 'string') return f;
    var s = f.no || '';
    if(f.t) return s ? s + ' · ' + f.t : f.t;
    return s;
  }
  function lines(s){ return String(s||'').split(/\n+/).map(function(x){ return x.trim(); }).filter(Boolean); }
  /* 항공편 {no,t} → "19:45 인천 국제공항 출발 → 23:30 방콕 수완나품 국제공항 도착 (KE0659)"
     t 안의 시:분을 순서대로 출발·도착 시간으로 씀 (예: "19:45" / "22:50 출발 → 06:10 도착") */
  function fltParts(f){
    var no = '', t = '', dep = '', arr = '';
    if(f && typeof f === 'object'){ no = String(f.no||'').replace(/\s/g,''); t = String(f.t||''); dep = String(f.dep||''); arr = String(f.arr||''); }
    else if(typeof f === 'string'){ var m = f.match(/\b([A-Z]{2}\s?\d{2,4})\b/); no = m ? m[1].replace(/\s/g,'') : ''; t = f; }
    if(!dep && !arr){ var ts = t.match(/\d{1,2}:\d{2}/g) || []; dep = ts[0] || ''; arr = ts[1] || ''; }
    return { no:no, dep:dep, arr:arr };
  }
  function fltLine(f, from, to){
    var p = fltParts(f);
    return (p.dep ? p.dep + ' ' : '') + from + ' 출발 → ' + (p.arr ? p.arr + ' ' : '') + to + ' 도착' + (p.no ? ' (' + p.no + ')' : '');
  }
  /* 한 구간만 — which: 'dep' → "23:35 방콕 … 출발 (KE0660)", 'arr' → "06:10 인천 … 도착" */
  function fltLeg(f, which, ap){
    var p = fltParts(f);
    if(which === 'dep') return (p.dep ? p.dep + ' ' : '') + ap + ' 출발' + (p.no ? ' (' + p.no + ')' : '');
    return (p.arr ? p.arr + ' ' : '') + ap + ' 도착';
  }
  var AP_ICN = '인천 국제공항', AP_BKK = '방콕 수완나품 국제공항';

  /* ── 신규 견적 id / 번호 ── */
  function newId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function newNo(){
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
    return 'SQ-' + ymd + '-' + Math.random().toString(36).slice(2,5).toUpperCase();
  }

  /* ── 금액 계산 ── */
  function calc(q){
    var pax = Number(q.pax)||0;
    var per = Number(q.per)||0;
    var extras = (q.extras||[]).filter(function(x){ return x && x.label && Number(x.per)>0; });
    var air = Number(q.air)||0;
    var land = per * pax;
    var airAll = air * pax;
    var ext = extras.reduce(function(s,x){ return s + Number(x.per)*pax; }, 0);
    var perAll = per + air + extras.reduce(function(s,x){ return s + Number(x.per); }, 0);
    return { nights:hotelNights(q), days:tripDays(q), pax:pax, per:per, air:air, airAll:airAll, land:land, extras:extras, ext:ext, perAll:perAll, total:land+airAll+ext };
  }

  /* ── 간단 일정 자동 생성 — 도착일 / 체류 기간(매일 자유 라운딩) / 출발일 세 줄 ──
     항목: {d:날짜 표기, t:내용}. 과거 저장분(문자열 배열 = 날짜별)도 itinOf가 변환 */
  function autoItin(q){
    var n = hotelNights(q);
    if(!(n > 0)) return [];
    var it = [];
    it.push({ d: fmtMD(q.s), n: '1일차',
      t: fltLine(q.out, AP_ICN, AP_BKK) + '\n공항 미팅 · 호텔로 이동\n호텔 체크인 · 휴식' });
    for(var i = 1; i < n; i++){
      it.push({ d: fmtMD(addDays(q.s, i)), n: (i+1) + '일차',
        t: '조식 후 골프장으로 이동\n자유 라운딩 (18~36홀 무제한 그린피)\n호텔 복귀 · 석식' });
    }
    if(isP1(q)){
      it.push({ d: fmtMD(addDays(q.s, n)), n: (n+1) + '일차',
        t: '조식 후 호텔 체크아웃\n공항으로 이동\n' + fltLeg(q.inb, 'dep', AP_BKK) });
      it.push({ d: fmtMD(q.e), n: (n+2) + '일차', t: fltLeg(q.inb, 'arr', AP_ICN) });
    } else {
      it.push({ d: fmtMD(q.e), n: (n+1) + '일차',
        t: '조식 후 호텔 체크아웃\n공항으로 이동\n' + fltLine(q.inb, AP_BKK, AP_ICN) });
    }
    return it;
  }
  function normItin(q){
    var it = Array.isArray(q.itin) ? q.itin : [];
    if(it.length && typeof it[0] === 'string') it = it.map(function(t, i){ return { d: q.s ? fmtMD(addDays(q.s, i)) : '', t: t }; });
    return it.filter(function(x){ return x && (String(x.t||'').trim() || String(x.d||'').trim()); })
             .map(function(x){ return { d: String(x.d||''), n: String(x.n||''), t: String(x.t||'') }; });
  }
  function itinOf(q){
    var it = normItin(q);
    return it.length ? it : autoItin(q);
  }

  /* ── 카톡 문의 글 자동 해석 → {name, pax, phone, s, e, hotel, tt, out, inb} ── */
  function parseInquiry(text){
    var t = String(text || '').replace(/\r/g, '');
    var r = {};
    var m = t.match(/([가-힣]{2,4})\s*(?:님|씨|고객님)?\s*외\s*(\d+)\s*(?:인|명)/);
    if(m){ r.name = m[1].replace(/(님|씨)$/, ''); r.pax = Number(m[2]) + 1; }
    else {
      m = t.match(/([가-힣]{2,4})\s*(?:님|씨)(?![가-힣])/); if(m) r.name = m[1];
      m = t.match(/(?:총\s*)?(\d+)\s*(?:명|인)(?!\s*(?:실|카트|당|1\s*(?:실|카트)))/); if(m) r.pax = Number(m[1]);
    }
    if(r.name && /^(고객|회원|본인|대표|담당|일정|예약|숙박|골프|답사|문의|이사|사장)$/.test(r.name)) delete r.name;
    m = t.match(/01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/); if(m) r.phone = m[0].replace(/[.\s]/g, '-');

    /* 날짜 토큰 — 26년 12월 22일 / 10월5일 / 9/25 / "~6일"(앞 토큰의 월) */
    var today = new Date(); today.setHours(0,0,0,0);
    function mk(y, mo, d, idx){
      if(!(mo >= 1 && mo <= 12 && d >= 1 && d <= 31)) return null;
      var yy = y ? (y < 100 ? 2000 + y : y) : today.getFullYear();
      if(!y){ var c = new Date(yy, mo - 1, d); if(c < today - 60 * 86400000) yy++; }
      return { ds: yy + '-' + String(mo).padStart(2,'0') + '-' + String(d).padStart(2,'0'), idx: idx, y: yy, m: mo };
    }
    var toks = [];
    /* '윌'은 '월' 오타(카톡에서 흔함) */
    var re = /(?:(\d{2,4})\s*년\s*)?(\d{1,2})\s*[월윌]\s*(\d{1,2})\s*일?|(\d{1,2})\s*\/\s*(\d{1,2})\s*일?/g;
    var x;
    while((x = re.exec(t))){
      var tk = x[2] ? mk(Number(x[1]), Number(x[2]), Number(x[3]), x.index) : mk(0, Number(x[4]), Number(x[5]), x.index);
      if(!tk) continue;
      toks.push(tk);
      var rest = t.slice(re.lastIndex).match(/^\s*(?:\([^)]*\))?\s*[~\-–]\s*(\d{1,2})\s*일(?!\s*차)/);
      if(rest){ var t2 = mk(tk.y, tk.m, Number(rest[1]), re.lastIndex); if(t2){ t2.range = true; toks.push(t2); } }
    }
    var lineOf = function(idx){ var a = t.lastIndexOf('\n', idx) + 1, b = t.indexOf('\n', idx); return t.slice(a, b < 0 ? t.length : b); };
    var sIn = null, eOut = null;
    toks.forEach(function(tk){
      var L = lineOf(tk.idx);
      if(!sIn && /\bIN\b|도착|입국/i.test(L)) sIn = tk;
      else if(!eOut && /\bOUT\b|귀국|출국/i.test(L)) eOut = tk;
    });
    if(sIn) r.s = sIn.ds;
    if(eOut) r.e = eOut.ds;
    if(!r.s){
      var cand = toks.filter(function(tk){ return tk !== eOut; });
      if(cand.length){
        var first = cand[0]; r.s = first.ds;
        if(!r.e){ var nx = cand[1]; if(nx && (nx.range || nx.ds > first.ds)) r.e = nx.ds; }
      }
    }
    m = t.match(/(\d+)\s*박/);
    if(m && r.s && !eOut) r.e = addDays(r.s, Number(m[1]));
    if(r.s && r.e && r.e <= r.s) delete r.e;

    if(/스카이\s*밸리/.test(t) && !/썬라이즈|선라이즈|라군/.test(t)) r.hotel = 'skyvalley';
    if(/비회원/.test(t)) r.tt = 'guest';
    var fl = t.match(/\b([A-Z]{2}\s?\d{3,4})\b/g);
    if(fl){ r.out = { no: fl[0].replace(/\s/g,''), t:'' }; if(fl[1]) r.inb = { no: fl[1].replace(/\s/g,''), t:'' }; }
    return r;
  }

  /* ── 문서 HTML ── */
  function render(q){
    q = q || {};
    var h = HOTEL[q.hotel] || HOTEL.sunrise;
    var c = calc(q);
    var n = c.nights;
    var tt = q.tt === 'guest' ? '비회원' : '회원';
    var inc = lines(q.inc != null ? q.inc : DEF_INC);
    var exc = lines(q.exc != null ? q.exc : DEF_EXC);
    /* 항공료가 견적에 들어가면 불포함의 항공료 줄은 빼고 포함 맨 위에 표시 */
    if(Number(q.air) > 0){
      exc = exc.filter(function(x){ return !/항공/.test(x); });
      if(!inc.some(function(x){ return /항공/.test(x); })) inc.unshift('왕복 항공료');
    }
    var a = q.agt || {};
    var sched = (q.s && q.e)
      ? fmtYMD(q.s) + ' 출발 ~ ' + fmtYMD(q.e) + ' 귀국' + (stayTxt(q) ? ' · ' + stayTxt(q) : '')
      : '일정 미정';
    var title = '썬라이즈 &amp; 스카이밸리 골프 투어';
    var nightly = Number(q.nightly) || 0;
    var single = Number(q.single) || 0;

    /* 금액표 — 1인 기준: 항공료 / 지상비 / 1인 합계, 마지막에 인원 × = 총 견적 금액 (설명 문구 없음) */
    var priceRows = '';
    if(c.pax > 0 && (c.per > 0 || c.air > 0)){
      if(c.air > 0) priceRows += '<tr><td>항공료</td><td>' + won(c.air) + '원</td></tr>';
      if(c.per > 0) priceRows += '<tr><td>지상비 <small>(' + (q.tt === 'guest' ? '비회원가' : '회원가') + ')</small></td><td>' + won(c.per) + '원</td></tr>';
      c.extras.forEach(function(x){ priceRows += '<tr><td>' + esc(x.label) + '</td><td>' + won(x.per) + '원</td></tr>'; });
      priceRows += '<tr class="sub"><td>1인 합계</td><td>' + won(c.perAll) + '원</td></tr>';
      priceRows += '<tr class="tot"><td>총 견적 금액 <span>' + won(c.perAll) + '원 × ' + c.pax + '명</span></td><td class="amt">' + won(c.total) + '<small>원</small></td></tr>';
    }
    var priceSec = priceRows
      ? '<div class="qd-h c-red box">견적 금액 <small>1인 기준</small></div><table class="qd-price box">' + priceRows + '</table>'
      : '<div class="qd-h c-red">견적 금액</div><div class="qd-memo">요금은 담당자에게 문의해주세요.</div>';

    var itin = itinOf(q);
    var last = itin.length - 1;
    var PIN = '<svg class="pin" viewBox="0 0 24 30" width="12" height="15"><path d="M12 0C5.37 0 0 5.37 0 12c0 8.25 12 18 12 18s12-9.75 12-18C24 5.37 18.63 0 12 0z" fill="#e8392f"/><circle cx="12" cy="12" r="4.3" fill="#fff"/></svg>';
    var BED = '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"/><path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 18h18"/></svg>';
    var FORK = '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>';
    var HOT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5l8-3 8 3v16"/><path d="M2 21h20"/><path d="M9 9h1.5M13.5 9H15M9 13h1.5M13.5 13H15M10.5 21v-4h3v4"/></svg>';
    var hero = HERO[q.hotel] || HERO.sunrise;
    var dfmt = function(d){ var m = String(d||'').match(/^(\d{1,2})\.(\d{1,2})\s*\(([^)]+)\)/); return m ? (m[1].length<2?'0':'')+m[1]+'/'+(m[2].length<2?'0':'')+m[2]+' ('+m[3]+')' : esc(d); };
    var row = function(time, body, cls){ return '<div class="qe' + (cls ? ' ' + cls : '') + '"><b>' + (time ? esc(time) : '') + '</b><div>' + body + '</div></div>'; };
    var itinSec = itin.length
      ? '<div class="qd-h c-green">일정</div><div class="qd-itin">' + itin.map(function(x, i){
          var ls = lines(x.t);
          var hasOut = ls.some(function(l){ return /체크아웃|방콕[^\n]*출발/.test(l); });
          var hasArr = ls.some(function(l){ return /인천 국제공항 도착/.test(l); });
          var isFirst = (i === 0);
          var arrOnly = hasArr && !hasOut && !isFirst;
          var isLast = (i === last) || hasOut || hasArr;
          var route = arrOnly ? '인천' : (isFirst && isLast ? '인천 → 방콕 → 인천' : (isFirst ? '인천 → 방콕' : (isLast ? '방콕 → 인천' : '방콕')));
          var ev = '';
          ls.forEach(function(l){
            var txt = l.replace(/^⛳\s*/, '');
            if(/→/.test(txt) && /(출발|도착)/.test(txt)){
              var code = '', body = txt;
              var cm = body.match(/\(([^)]*[A-Z]{2}\s?\d{2,4}[^)]*)\)\s*$/);
              if(cm){ code = cm[1].trim(); body = body.slice(0, cm.index).trim(); }
              body.split('→').forEach(function(p, k){
                p = p.trim();
                var tm = p.match(/^(\d{1,2}:\d{2})\s*(.*)$/);
                var t = tm ? tm[1] : '', s = tm ? tm[2] : p;
                ev += row(t, esc(s) + (k === 0 && code ? ' <em class="code">' + esc(code) + '</em>' : ''), 'qe-fl');
              });
              return;
            }
            var tm2 = txt.match(/^(\d{1,2}:\d{2})\s+(.*)$/);
            var t2 = tm2 ? tm2[1] : '', s2 = tm2 ? tm2[2] : txt;
            var code2 = '';
            var cm2 = s2.match(/\(([^)]*[A-Z]{2}\s?\d{2,4}[^)]*)\)\s*$/);
            if(cm2){ code2 = cm2[1].trim(); s2 = s2.slice(0, cm2.index).trim(); }
            if(/라운딩/.test(s2)) ev += row(t2, '<span class="gbox">⛳ ' + esc(s2) + '</span>', 'qe-golf');
            else ev += row(t2, esc(s2) + (code2 ? ' <em class="code">' + esc(code2) + '</em>' : ''), code2 ? 'qe-fl' : '');
          });
          var meals = arrOnly ? '' : (isFirst && isLast ? '' : (isFirst ? '석식: 호텔식' : (isLast ? '조식: 호텔식' : '조식: 호텔식 · 중식: 호텔식 · 석식: 호텔식')));
          var stay = isLast ? '' : '<div class="qs"><b>' + BED + '</b><div class="stay"><div class="stay-h">' + HOT + esc(h.kr) + '</div>' + (isFirst ? '<img src="' + hero + '" alt="" crossorigin="anonymous">' : '') + '</div></div>';
          var meal = meals ? '<div class="qs"><b>' + FORK + '</b><div class="meal">' + meals + '</div></div>' : '';
          return '<div class="qd-day"><div class="qd-dh"><b>' + esc(x.n || ((i+1) + '일차')) + '</b><span class="rt">' + PIN + esc(route) + '</span><span class="dt">' + dfmt(x.d) + '</span></div>'
            + '<div class="qd-db">' + (ev || row('', '-')) + stay + meal + '</div></div>';
        }).join('') + '</div>'
      : '';

    var infoRows = ''
      + '<div class="qi"><span class="k">고객명</span><span class="v">' + (q.name ? esc(q.name) + ' 님' : '-') + (q.tt !== 'guest' && (q.mt === 'biz' || q.mt === 'prm') ? '<em class="mtb ' + q.mt + '">' + (q.mt === 'prm' ? '프리미엄 회원' : '비즈니스 회원') + '</em>' : '') + '</span></div>'
      + '<div class="qi r"><span class="k">인원</span><span class="v">' + (c.pax > 0 ? c.pax + '명' : '-') + '</span></div>'
      + '<div class="qi full"><span class="k">일정</span><span class="v nw">' + ((q.s && q.e) ? fmtYMD(q.s) + ' ~ ' + (String(q.s).slice(0,4) === String(q.e).slice(0,4) ? fmtMD(q.e) : fmtYMD(q.e)) + (stayTxt(q) ? ' · ' + stayTxt(q) : '') : '-') + '</span></div>'
      + '<div class="qi full"><span class="k">호텔</span><span class="v">' + esc(h.kr) + ' · 2인 1실' + (single > 0 ? ' · 싱글룸 ' + single + '실 (싱글 차지 별도)' : '') + '</span></div>';

    return '<div class="qdoc">'
      + '<div class="qd-top"><img class="qd-logo" src="' + LOGO + '" alt="SUN &amp; SKY GOLF KOREA" crossorigin="anonymous">'
      +   '<div class="qd-title"><b>투어 견적서</b><small>' + fmtDot(q.at || d2ds(new Date())) + (q.no ? ' · ' + esc(q.no) : '') + '</small></div>'
      + '</div>'
      + '<div class="qd-band"><h1>' + title + '</h1></div>'
      + '<div class="qd-sec">'
      +   '<div class="qd-info">' + infoRows + '</div>'
      +   priceSec
      +   '<div class="qd-h c-gold">포함 · 불포함</div>'
      +   '<div class="qd-cols">'
      +     '<div class="qd-col inc"><div class="t">포함</div><ul>' + (inc.length ? inc.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') : '<li>-</li>') + '</ul></div>'
      +     '<div class="qd-col exc"><div class="t">불포함</div><ul>' + (exc.length ? exc.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') : '<li>-</li>') + '</ul></div>'
      +   '</div>'
      +   itinSec
      +   '<div class="qd-h c-blue">현지 지불 요금 안내</div>'
      +   '<div class="qd-fees">'
      +     LOCAL_FEES.map(function(r){ return '<div class="qf"><div class="qf-k">' + esc(r[0]) + '</div><div class="qf-a">' + esc(r[1]) + '</div><div class="qf-n">' + esc(r[2]) + '</div></div>'; }).join('')
      +   '</div>'
      +   (q.memo ? '<div class="qd-h c-gray">안내</div><div class="qd-memo">' + esc(q.memo) + '</div>' : '')
      +   '<div class="qd-h c-navy">입금 계좌</div>'
      +   '<div class="qd-bank"><b>' + esc(BANK.bank + ' ' + BANK.no) + '</b><span>예금주 ' + esc(BANK.holder) + '</span></div>'
      +   '<div class="qd-pp">'
      +     '<div class="pp-h">예약 접수 · 여권 사본</div>'
      +     '<div class="pp-top"><div class="pp-txt"><b>예약 확정을 위해 여권 사진을 보내주세요</b><ul><li>여권 정보면 전체가 보이도록 촬영</li><li>글자가 선명하게 보이도록 업로드</li><li>여권 유효기간 6개월 이상 확인</li></ul></div><img src="' + ILL + '" alt="여권 예시" crossorigin="anonymous"></div>'
      +     '<div class="pp-btns"><button type="button" class="pp-cam">📷 카메라로 촬영</button><button type="button" class="pp-alb">🖼 앨범에서 선택</button></div>'
      +     '<input type="file" class="pp-cam-in" accept="image/*" capture="environment" hidden>'
      +     '<input type="file" class="pp-alb-in" accept="image/*,.jpg,.jpeg,.png,.heic,.heif,.webp,.jfif,.bmp" multiple hidden>'
      +     '<div class="pp-count"><span>제출 현황</span><span><b class="pp-num">' + ((q.pp||[]).length) + '</b>' + (c.pax > 0 ? ' / ' + c.pax + '명' : '장') + '</span></div>'
      +     '<div class="pp-status"></div>'
      +     '<div class="pp-note">개인정보는 예약 진행 목적으로만 안전하게 사용됩니다.</div>'
      +   '</div>'
      + '</div>'
      + '<div class="qd-foot">'
      +   '<div class="qd-agent"><img class="cg" src="' + CG_LOGO + '" alt="초이스골프" crossorigin="anonymous"><span class="role">' + esc(CO.role) + '</span></div>'
      +   '<div class="qd-co"><b>' + esc(CO.name) + '</b>' + esc(CO.mgr) + ' · ' + esc(CO.tel) + '</div>'
      + '</div>'
      + '</div>';
  }

  /* ── 표시 + 좁은 화면 대응 ── */
  function fit(el){
    var doc = el.querySelector('.qdoc');
    if(!doc || doc.dataset.lock) return;
    doc.classList.toggle('narrow', el.clientWidth < 620);
  }
  var RO = null;
  function mount(el, q){
    el.innerHTML = render(q);
    fit(el);
    if(!el.dataset.ssqFit){
      el.dataset.ssqFit = '1';
      if(window.ResizeObserver){
        new ResizeObserver(function(){ fit(el); }).observe(el);
      } else {
        window.addEventListener('resize', function(){ fit(el); });
      }
    }
    return el.querySelector('.qdoc');
  }

  /* ── 저장 / 조회 ── */
  function sbFetch(method, path, body, prefer){
    var h = { apikey:SB_KEY, Authorization:'Bearer '+SB_KEY, 'Content-Type':'application/json' };
    if(prefer) h.Prefer = prefer;
    return fetch(SB_URL + '/rest/v1/' + path, { method:method, headers:h, body: body ? JSON.stringify(body) : undefined })
      .then(function(res){
        if(!res.ok) return res.text().then(function(t){ var e = new Error(t || ('HTTP '+res.status)); e.status = res.status; throw e; });
        return method === 'DELETE' ? null : res.json();
      });
  }
  function save(q){
    return sbFetch('POST', 'yg_settings?on_conflict=key', [{ key:'ssq_'+q.id, value:q }], 'return=representation,resolution=merge-duplicates')
      .then(function(){ return q; });
  }
  function load(id){
    if(!/^[a-z0-9]{6,24}$/i.test(String(id||''))) return Promise.resolve(null);
    return sbFetch('GET', 'yg_settings?key=eq.ssq_' + encodeURIComponent(id) + '&select=value')
      .then(function(rows){ var q = rows && rows[0] && rows[0].value; return (q && !q.del) ? q : null; });
  }
  function list(){
    return sbFetch('GET', 'yg_settings?key=like.ssq_*&select=key,value')
      .then(function(rows){ return (rows||[]).map(function(r){ return r.value; }).filter(function(q){ return q && q.id && !q.del; }); });
  }
  function remove(q){
    var dead = Object.assign({}, q, { del:true });
    return save(dead).then(function(){ return sbFetch('DELETE', 'yg_settings?key=eq.ssq_' + encodeURIComponent(q.id)).catch(function(){}); });
  }

  /* ── 공개 링크 (현재 페이지 기준 상대 경로 → sunskygolf.com/agt/quote.html?q=ID) ── */
  function link(id){
    var p = location.pathname;
    if(!/\/$|\.html?$/i.test(p)) p += '/';          /* /agt → /agt/ */
    var base = p.replace(/[^\/]*$/, '');
    return location.origin + base + 'quote.html?q=' + encodeURIComponent(id);
  }
  function copyText(t){
    if(navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function(ok, no){
      try{
        var ta = document.createElement('textarea'); ta.value = t; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok();
      }catch(e){ no(e); }
    });
  }

  /* ── JPG 저장 (PC 레이아웃 820px로 강제 캡처) ── */
  function loadScript(src){ return new Promise(function(ok,no){ var s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=no; document.head.appendChild(s); }); }
  function waitImgs(el){
    var imgs = Array.prototype.slice.call(el.querySelectorAll('img'));
    return Promise.all(imgs.map(function(im){
      if(im.complete) return Promise.resolve();
      return new Promise(function(ok){ im.onload = im.onerror = ok; });
    }));
  }
  function toJpg(doc, fname){
    var wasNarrow = doc.classList.contains('narrow');
    var st = { w:doc.style.width, mw:doc.style.maxWidth };
    doc.dataset.lock = '1';
    doc.classList.remove('narrow');
    doc.style.width = '820px'; doc.style.maxWidth = 'none';
    var restore = function(){
      doc.style.width = st.w; doc.style.maxWidth = st.mw;
      delete doc.dataset.lock;
      if(wasNarrow) doc.classList.add('narrow');
    };
    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    return Promise.all([fontsReady, waitImgs(doc)]).then(function(){
      return new Promise(function(r){ setTimeout(r, 60); });
    }).then(function(){
      var run = function(){
        if(!window.modernScreenshot){
          return loadScript('https://cdn.jsdelivr.net/npm/modern-screenshot@4.6.5/dist/index.js')
            .then(function(){ return window.modernScreenshot.domToCanvas(doc, { scale:2, backgroundColor:'#ffffff', timeout:30000 }); });
        }
        return window.modernScreenshot.domToCanvas(doc, { scale:2, backgroundColor:'#ffffff', timeout:30000 });
      };
      return run().catch(function(){
        var p = window.html2canvas ? Promise.resolve() : loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        return p.then(function(){ return window.html2canvas(doc, { scale:2, backgroundColor:'#ffffff', useCORS:true, windowWidth:1280 }); });
      });
    }).then(function(canvas){
      restore();
      var a = document.createElement('a');
      a.download = (fname || '투어견적서') .replace(/[\\/:*?"<>|]/g,'') + '.jpg';
      a.href = canvas.toDataURL('image/jpeg', 0.93);
      document.body.appendChild(a); a.click(); a.remove();
    }, function(e){ restore(); throw e; });
  }

  /* ── 고객 여권 사본 접수 (quote.html) — ss-docs 버킷 quotes/<id>/ 에 저장, 견적 JSON q.pp 배열에 기록 ── */
  var DOCS = 'ss-docs';
  function shrink(file){
    return new Promise(function(ok){
      try{
        if(file.size < 1.5*1024*1024) return ok(file);
        var url = URL.createObjectURL(file), im = new Image();
        im.onload = function(){
          URL.revokeObjectURL(url);
          var MAX = 1800, w = im.naturalWidth, h = im.naturalHeight;
          if(Math.max(w,h) > MAX){ var k = MAX/Math.max(w,h); w = Math.round(w*k); h = Math.round(h*k); }
          var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(im, 0, 0, w, h);
          cv.toBlob(function(b){ ok((b && b.size < file.size) ? b : file); }, 'image/jpeg', 0.88);
        };
        im.onerror = function(){ ok(file); };
        im.src = url;
      }catch(e){ ok(file); }
    });
  }
  function uploadPassport(q, file){
    return shrink(file).then(function(body){
      var isJ = body !== file;
      var ext = isJ ? 'jpg' : (((file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')) || 'jpg');
      var path = 'quotes/' + String(q.id).replace(/[^a-zA-Z0-9_-]/g,'') + '/' + Date.now() + '_' + Math.random().toString(36).slice(2,8) + '.' + ext;
      return fetch(SB_URL + '/storage/v1/object/' + DOCS + '/' + path, {
        method:'POST', headers:{ apikey:SB_KEY, Authorization:'Bearer '+SB_KEY, 'Content-Type': isJ ? 'image/jpeg' : (file.type || 'image/jpeg') }, body: body
      }).then(function(r){ if(!r.ok) throw new Error('upload'); return SB_URL + '/storage/v1/object/public/' + DOCS + '/' + path; });
    }).then(function(url){
      return load(q.id).then(function(fresh){
        var cur = fresh || q;
        cur.pp = (cur.pp || []).concat([{ name:file.name, url:url, at:new Date().toISOString() }]);
        return save(cur).then(function(){ return cur; });
      });
    });
  }
  /* 여권 접수란 동작 연결 — doc(.qdoc) 안의 버튼·입력에 업로드 처리 */
  function bindPassport(doc, q){
    if(!doc) return;
    var cam = doc.querySelector('.pp-cam'), alb = doc.querySelector('.pp-alb');
    var camIn = doc.querySelector('.pp-cam-in'), albIn = doc.querySelector('.pp-alb-in');
    var st = doc.querySelector('.pp-status'), num = doc.querySelector('.pp-num');
    if(!cam || !alb || !camIn || !albIn) return;
    cam.onclick = function(){ camIn.click(); };
    alb.onclick = function(){ albIn.click(); };
    var handle = function(ev){
      var files = Array.prototype.slice.call(ev.target.files || []);
      ev.target.value = '';
      if(!files.length) return;
      cam.disabled = alb.disabled = true;
      st.className = 'pp-status';
      var ok = 0, i = 0;
      function next(){
        if(i >= files.length){
          cam.disabled = alb.disabled = false;
          if(ok > 0){ st.className = 'pp-status ok'; st.innerHTML = '✅ 여권 사진 ' + ok + '장이 안전하게 전달되었습니다.<br>담당자가 확인 후 연락드리겠습니다.'; }
          else { st.className = 'pp-status bad'; st.innerHTML = '⚠️ 업로드에 실패했습니다.<br>잠시 후 다시 시도하시거나 담당자에게 직접 보내주세요.'; }
          return;
        }
        var f = files[i++];
        var ext = (f.name.split('.').pop() || '').toLowerCase();
        var isImg = (f.type || '').indexOf('image/') === 0 || ['jpg','jpeg','png','heic','heif','webp','jfif','bmp','gif'].indexOf(ext) > -1;
        if(!isImg) return next();
        st.textContent = '업로드 중… (' + i + '/' + files.length + ')';
        uploadPassport(q, f).then(function(cur){ ok++; q.pp = cur.pp; if(num) num.textContent = (cur.pp||[]).length; }, function(){}).then(next);
      }
      next();
    };
    camIn.onchange = albIn.onchange = handle;
  }

  window.SSQ = {
    LOGO:LOGO, HERO:HERO, HOTEL:HOTEL, BANK:BANK, DEF_INC:DEF_INC, DEF_EXC:DEF_EXC, LOCAL_FEES:LOCAL_FEES,
    esc:esc, won:won, fmtYMD:fmtYMD, fmtMD:fmtMD, fmtDot:fmtDot, nights:nights, addDays:addDays, d2ds:d2ds, fltStr:fltStr,
    newId:newId, newNo:newNo, calc:calc, hotelNights:hotelNights, tripDays:tripDays, stayTxt:stayTxt, isP1:isP1, autoItin:autoItin, normItin:normItin, parseInquiry:parseInquiry, render:render, mount:mount,
    save:save, load:load, list:list, remove:remove, link:link, copyText:copyText, toJpg:toJpg, uploadPassport:uploadPassport, bindPassport:bindPassport
  };
})();
