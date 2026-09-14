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
  var CG_STAMP = IMG + 'sunrise/choice-stamp.jpg';   /* (주)초이스골프 인감 — 고객 인보이스 푸터 (원본 chctour/images/INGAM.jpg, 2026-09-10) */
  var ILL = IMG + 'sunrise/passport-illust.jpg';   /* 여권 접수란 예시 그림 */   /* 담당: 초이스골프 로고 (사장님 지시 2026-09-07) */
  var HERO = {
    sunrise:   IMG + 'sunrise-main1.jpg',
    skyvalley: IMG + 'sunrise/skyvalley/hotel-main.jpg'
  };
  var HOTEL = {
    sunrise:   { kr:'썬라이즈 라군 호텔 & 골프', hotel:'썬라이즈 라군 호텔', en:'SUNRISE LAGOON HOTEL & GOLF · THAILAND', short:'썬라이즈 라군' },
    skyvalley: { kr:'스카이밸리 골프텔', hotel:'스카이밸리 골프텔', en:'SKY VALLEY GOLF & HOTEL · THAILAND', short:'스카이밸리' }   /* hotel: 고객 문서용 짧은 이름 (2026-09-11) */
  };
  var COURSE = { sunrise:'썬라이즈 라군 C.C', skyvalley:'스카이밸리 C.C' };
  var BANK = { bank:'하나은행', no:'103-910072-08204', holder:'(주)초이스골프' };
  /* 견적서 하단 = 썬앤스카이 명함 느낌 (사장님 지시 2026-09-09: 초이스골프 푸터 폐기 → SUN & SKY 로고 + 최진우 회원 예약실 부장 + 회사 정보) */
  var CO = { name:'㈜썬앤스카이골프코리아', mgr:'최진우', dept:'회원 예약실', pos:'부장', mobile:'010-5897-1053', tel:'1533-3160',
             addr:'서울 서초구 강남대로101안길 18-1 잠원빌딩 2층', tel2:'02-540-6114', fax:'02-545-9981' };
  /* 포함·불포함 기본 문구 — 한 줄 표기용으로 간결하게 (2026-09-11): 객실은 호텔 줄에, 골프장은 제목에, 현지 지불은 아래 안내 칸에 있음 */
  var DEF_INC = [
    '숙박',
    '식사 (조·중·석)',
    '그린피',
    '여행자보험'
  ].join('\n');   /* 여행자보험은 항상 맨 마지막 (2026-09-11) */
  var DEF_EXC = [
    '왕복 항공료',
    '카트 · 캐디피 · 팁',
    '공항 미팅 · 샌딩'
  ].join('\n');
  /* 현지 지불 요금 안내 — 견적서에 항상 표기 (sunrise/index.html 공개 요금표와 동일하게 유지) */
  var LOCAL_FEES = [
    ['카트 · 캐디피 · 팁', '18홀 $35 /인', '추가 9홀 $10 · 추가 18홀 $20 (2인 1카트)'],
    ['공항 미팅 · 샌딩', '1인 $50 ~ $80', '2인 $80 · 3인 $60 · 4인 이상 $50 (1인당)'],
    ['스카이밸리 노캐디 (선택)', '성수기 18홀 $20 /인', '비수기 1일 무제한 $35 /인']
  ];   /* 객실 싱글 차지는 2026-09-09부터 견적 금액에 포함(singleCalc) — 현지 지불 안내에서 뺌 */

  var DOW = ['일','월','화','수','목','금','토'];
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function won(n){ return (Number(n)||0).toLocaleString(); }
  function ds2d(ds){ var p=String(ds).split('-').map(Number); return new Date(p[0],p[1]-1,p[2]); }
  function fmtYMD(ds){ if(!ds) return '-'; var d=ds2d(ds); return d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate()+'('+DOW[d.getDay()]+')'; }
  function fmtMD(ds){ if(!ds) return '-'; var d=ds2d(ds); return (d.getMonth()+1)+'.'+d.getDate()+'('+DOW[d.getDay()]+')'; }
  function fmtDot(ds){ if(!ds) return '-'; var d=ds2d(ds); return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0'); }
  function nights(a,b){ if(!a||!b) return 0; return Math.round((ds2d(b)-ds2d(a))/86400000); }
  /* 귀국편이 다음날 인천 도착(+1일)이면 마지막 밤은 기내 — 호텔 박수는 하루 적고, 일수는 그대로 */
  function toMin(t){ var p = String(t||'').split(':'); return p.length === 2 ? Number(p[0])*60 + Number(p[1]) : -1; }
  /* +1일 = 체크했거나, 귀국편 도착 시각이 출발 시각보다 이르면(23:30 출발 → 06:55 도착) 자동 */
  function isP1(q){
    if(!(q && q.inb && typeof q.inb === 'object')) return false;
    if(q.inb.p1) return true;
    var p = fltParts(q.inb);
    return !!(p.dep && p.arr && toMin(p.arr) >= 0 && toMin(p.arr) < toMin(p.dep));
  }
  /* 귀국편이 새벽(06시 이전) 출발이면 전날 밤에 호텔을 나오므로 호텔 박수가 하루 적음 (도착일은 출발일과 같음) */
  function isEarlyDep(q){
    if(!(q && q.inb && typeof q.inb === 'object') || isP1(q)) return false;
    var p = fltParts(q.inb);
    return !!(p.dep && toMin(p.dep) >= 0 && toMin(p.dep) < 6*60);
  }
  function nq(q){
    if(!q || !isP1(q) || (q.inb && q.inb.p1) || !q.e) return q || {};
    return Object.assign({}, q, { e: addDays(q.e, 1), inb: Object.assign({}, q.inb, { p1: true }) });
  }
  function hotelNights(q){ q = nq(q); var n = nights(q.s, q.e); return n > 0 ? n - ((isP1(q) || isEarlyDep(q)) ? 1 : 0) : 0; }
  function tripDays(q){ q = nq(q); var n = nights(q.s, q.e); return n > 0 ? n + 1 : 0; }
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
  var AP_BKK = '방콕 수완나품 국제공항';
  /* 출발 공항 (q.ap) — 기본 인천 */
  var AIRPORTS = { ICN:{ city:'인천', name:'인천 국제공항' }, PUS:{ city:'부산', name:'김해 국제공항' }, TAE:{ city:'대구', name:'대구 국제공항' } };
  function apOf(q){ return AIRPORTS[q && q.ap] || AIRPORTS.ICN; }
  /* 편명 앞 2자리 → 항공사명 (항공료 옆 표기) */
  var AIRLINES = { KE:'대한항공', OZ:'아시아나항공', LJ:'진에어', TW:'티웨이항공', '7C':'제주항공', BX:'에어부산', RS:'에어서울', ZE:'이스타항공', YP:'에어프레미아', RF:'에어로케이', TG:'타이항공', VZ:'타이 비엣젯', XJ:'타이 에어아시아 X', FD:'타이 에어아시아', SL:'타이 라이언에어', MU:'중국동방항공' };
  function airlineOf(f){ var no = fltParts(f).no.toUpperCase(); var m = no.match(/^([A-Z0-9]{2})[0-9]/); return m && AIRLINES[m[1]] ? AIRLINES[m[1]] : ''; }
  /* 항공사 로고 — 편명 앞 두 글자 코드로 스토리지 이미지 (2026-09-13: KE OZ LJ TW 7C BX TG YP ZE RS 준비, 없으면 자동 숨김) */
  var AIRLINE_LOGO = { KE:'KE2', OZ:1, LJ:1, TW:1, '7C':1, BX:1, TG:1, YP:1, ZE:1, RS:1 };   /* 값이 문자열이면 파일명 (KE2 = 2025 새 로고, 스토리지는 덮어쓰기 불가라 새 파일) */
  function airlineLogo(f){ var no = fltParts(f).no.toUpperCase(); var m = no.match(/^([A-Z0-9]{2})[0-9]/); return m && AIRLINE_LOGO[m[1]] ? IMG + 'sunrise/airlines/' + (typeof AIRLINE_LOGO[m[1]] === 'string' ? AIRLINE_LOGO[m[1]] : m[1]) + '.png' : ''; }

  /* ── 신규 견적 id / 번호 ── */
  function newId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function newNo(){
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
    return 'SQ-' + ymd + '-' + Math.random().toString(36).slice(2,5).toUpperCase();
  }

  /* ── 싱글룸 추가요금 — 1실·1박: 비수기(4~10월) 25,000원 / 준성수기·성수기·극성수기 30,000원 (사장님 지시 2026-09-09, 견적에 포함) ── */
  var SINGLE_LOW = 25000, SINGLE_HIGH = 30000;
  function singleRate(ds){ var m = parseInt(String(ds).slice(5,7), 10); return (m >= 4 && m <= 10) ? SINGLE_LOW : SINGLE_HIGH; }
  function singleRooms(q){ var pax = Number(q.pax) || 0, s = Math.max(0, Number(q.single) || 0); return pax > 0 ? Math.min(s, pax) : s; }
  /* 객실 타입 (2026-09-14): 호텔별 선택지, q.rtype 에 이름 그대로 저장 */
  var ROOM_TYPES = { sunrise:['슈페리어','디럭스','스위트'], skyvalley:['골프텔','빌라','VIP룸'] };
  function roomTxt(q){
    var pax = Number(q.pax) || 0, single = singleRooms(q);
    var twins = pax > 0 ? Math.ceil((pax - single) / 2) : 0;
    var p = [];
    if(q.rtype) p.push(String(q.rtype));
    if(twins > 0) p.push('트윈 ' + twins + '객실');
    if(single > 0) p.push('싱글 ' + single + '객실');
    return p.length ? p.join(' · ') : '2인 1실';
  }
  function singleCalc(q){
    q = nq(q);
    var rooms = singleRooms(q), hn = hotelNights(q);
    if(!(rooms > 0) || !(hn > 0) || !q.s) return { rooms:rooms, nights:hn, perRoom:0, total:0, rates:[] };
    var perRoom = 0, rates = [];
    for(var i = 0; i < hn; i++){ var r = singleRate(addDays(q.s, i + 1)); perRoom += r; if(rates.indexOf(r) < 0) rates.push(r); }   /* 라운딩 날짜 시즌 기준 */
    rates.sort(function(a,b){ return a - b; });
    return { rooms:rooms, nights:hn, perRoom:perRoom, total:perRoom * rooms, rates:rates };
  }
  /* 지상비 시즌 구간 (index.html 폼이 월별 요금표로 자동 산정한 [{season,from,to,n,rate}]) — 2구간 이상일 때만 줄을 나눔 */
  /* 시즌 구분 (index.html seasonOf와 동일: 4~10월 비수기 · 12월 성수기 · 1~2월 극성수기 · 그 외 준성수기) */
  function seasonOf(ds){ var m = parseInt(String(ds).slice(5,7), 10); return (m >= 4 && m <= 10) ? '비수기' : (m === 12 ? '성수기' : ((m === 1 || m === 2) ? '극성수기' : '준성수기')); }
  function landSegs(q){ var s = Array.isArray(q.segs) ? q.segs.filter(function(g){ return g && Number(g.n) > 0 && Number(g.rate) > 0; }) : []; return s.length > 1 ? s : null; }
  function md(ds){ if(!ds) return ''; var p = String(ds).split('-'); return Number(p[1]) + '/' + Number(p[2]); }
  function md2(ds){ if(!ds) return ''; var p = String(ds).split('-'); return p[1] + '/' + p[2]; }   /* 01/02 식 두 자리 — 표에서 위아래 정렬용 (2026-09-13) */
  function landLabel(q, g){
    var tt = q.tt === 'guest' ? '일반 요금' : '회원 요금';
    return tt + ' <em>(' + esc(g.season) + ')</em><small class="sub"><span class="nw">라운딩 ' + md(g.from) + '~' + md(g.to) + '</span> · <span class="nw">' + g.n + '일 × ' + won(g.rate) + '원</span></small>';
  }
  function landLabel1(q, c){
    var tt = q.tt === 'guest' ? '일반 요금' : '회원 요금';
    var s1 = q.s ? addDays(q.s, 1) : '';
    return tt + (s1 ? ' <em>(' + seasonOf(s1) + ')</em>' : '') + (c.nights > 0 ? '<small class="sub">' + c.nights + '일 × ' + won(c.per / c.nights) + '원</small>' : '');
  }
  /* ── 금액 계산 ── */
  function calc(q){
    q = nq(q);
    var sg = singleCalc(q);
    var pax = Number(q.pax)||0;
    var per = Number(q.per)||0;
    var extras = (q.extras||[]).filter(function(x){ return x && x.label && Number(x.per)>0; });
    var air = q.airSep ? 0 : (Number(q.air)||0);   /* 항공 별도면 항공료 0 (2026-09-14) */
    var airPax = (q.airPax === '' || q.airPax == null) ? pax : Math.max(0, Math.min(pax, Number(q.airPax) || 0));   /* 항공 포함 인원 (2026-09-13: 일부만 항공 포함 가능) */
    var land = per * pax;
    var airAll = air * airPax;
    var ext = extras.reduce(function(s,x){ return s + Number(x.per)*pax; }, 0);
    var perAll = per + air + extras.reduce(function(s,x){ return s + Number(x.per); }, 0);
    return { nights:hotelNights(q), days:tripDays(q), pax:pax, per:per, air:air, airPax:airPax, airAll:airAll, land:land, extras:extras, ext:ext, perAll:perAll, single:sg, total:land+airAll+ext+sg.total };
  }

  /* ── 요금 명세 블록 — 견적서·인보이스 공용 (2026-09-13)
       제목 줄(견적 금액 / 청구 내역 · 오른쪽 "회원 요금 · 이용일 기준")
       시즌 줄(색 점 + 기간 | 1일 요금 × N일 | 1인 금액) → 왕복 항공료 → 추가 항목 → 싱글룸 추가(1실 기준)
       인원 구성이 단순하면 "1인 합계" 한 줄, 섞여 있으면(싱글룸 / 항공 일부만 포함 / 추가 항목) 항목별 "단가 × 수량" 줄
       → 총액 패널 ── */
  function priceBlock(q, c, o){
    o = o || {};
    if(!(c.pax > 0 && (c.per > 0 || c.air > 0))) return '';
    var G = !!o.grid;   /* 인보이스: 세로선 격자 5칸 (구분 | 요금 | 일수 | 인원 | 금액, 줄 금액 = 요금 × 일수 × 인원), 견적서: 틀 없는 3칸 1인 기준 */
    var al = airlineOf(q.out) || airlineOf(q.inb);
    var tt = q.tt === 'guest' ? '일반 요금' : '회원 요금';
    var ssn = function(name){ var k = /극성수기/.test(name) ? 's3' : /준성수기/.test(name) ? 's1' : /성수기/.test(name) ? 's2' : 's0'; return '<b class="ssn ' + k + '">' + esc(name) + '</b>'; };   /* 시즌 배지: 폭 고정, 연한 시즌색 바탕 (2026-09-13) */
    var dts = function(a, b){ return md2(a) + ' ~ ' + md2(b); };   /* 두 자리 날짜로 정렬 (배지 폭 고정과 함께) */   /* 인보이스는 1/1 식 (자리 맞춤 불필요, 2026-09-13) */
    var sg = c.single, hasSg = sg && sg.total > 0;
    var partAir = c.air > 0 && c.airPax < c.pax;
    var bd = '', landRows = '';
    var lsg = landSegs(q);
    /* 1인 금액 종류 [{label, amt, n}] — 인원 구성이 섞이면 여러 줄 (kw: 납부 / 견적) */
    var kw = o.kw || '납부';
    var extPer = c.extras.reduce(function(s, x){ return s + Number(x.per); }, 0);
    var base = c.per + extPer, baseAir = base + c.air;
    var twinN = hasSg ? Math.max(0, c.pax - sg.rooms) : c.pax, sgN = hasSg ? Math.min(sg.rooms, c.pax) : 0;
    var uniform = !partAir && !hasSg;
    var kinds = [];
    if(uniform) kinds.push({ label:'1인 ' + kw + ' 금액', amt:baseAir, n:c.pax, one:true });
    else if(!partAir && hasSg){ if(twinN > 0) kinds.push({ label:'트윈 1인 ' + kw, amt:baseAir, n:twinN }); kinds.push({ label:'싱글룸 1인 ' + kw, amt:baseAir + sg.perRoom, n:sgN }); }
    else if(partAir && !hasSg){ kinds.push({ label:'항공 포함 1인 ' + kw, amt:baseAir, n:c.airPax }); kinds.push({ label:'항공 불포함 1인 ' + kw, amt:base, n:c.pax - c.airPax }); }
    else { kinds.push({ label:'항공 포함 1인 ' + kw, amt:baseAir, n:c.airPax }); kinds.push({ label:'항공 불포함 1인 ' + kw, amt:base, n:c.pax - c.airPax }); kinds.push({ label:'싱글룸 이용 시 1실 추가', amt:sg.perRoom, n:sg.rooms, unit:'실' }); }

    if(G){
      var g4 = function(cls, l, u, d, r){ return '<tr class="' + cls + '"><td class="l">' + l + '</td><td class="u">' + (u || '') + '</td><td class="d">' + (d || '') + '</td><td class="r">' + r + '</td></tr>'; };
      bd = '<tr class="hd"><th class="l">구분</th><th class="u">요금</th><th class="d">일수</th><th class="r">금액(1인)</th></tr>';
      if(lsg) lsg.forEach(function(g){ landRows += g4('i', ssn(g.season) + '<span class="dt">' + dts(g.from, g.to) + '</span>', won(g.rate), g.n + '일', won(g.n * g.rate)); });
      else if(c.per > 0 && c.nights > 0){ var s1 = addDays(q.s, 1); landRows += g4('i', ssn(seasonOf(s1)) + '<span class="dt">' + dts(s1, addDays(q.s, c.nights)) + '</span>', won(c.per / c.nights), c.nights + '일', won(c.per)); }
      else if(c.per > 0) landRows += g4('i', tt, '', '', won(c.per));
      bd += landRows;
      if(c.air > 0) bd += g4('h', '<mark class="hl">왕복 항공료' + (al ? ' (' + esc(al) + ')' : '') + '</mark>' + (partAir ? '<span class="dt">' + c.airPax + '명 포함</span>' : ''), won(c.air), '', won(c.air));
      c.extras.forEach(function(x){ bd += g4('h', '<mark class="hl">' + esc(x.label) + '</mark>', won(x.per), '', won(x.per)); });
      if(hasSg){
        var rtg = sg.rates.length === 1 ? won(sg.rates[0]) : won(sg.rates[0]) + '~' + won(sg.rates[sg.rates.length-1]);
        bd += g4('h', '<mark class="hl">싱글룸 추가</mark><span class="dt">1실 기준</span>', rtg, sg.nights + '박', won(sg.perRoom));
      }
      if(uniform) bd += '<tr class="sum"><td class="l" colspan="3">1인 합계</td><td class="r">' + won(baseAir) + '</td></tr>';
    } else {
      var row = function(cls, l, m, r){ return '<tr class="' + cls + '"><td class="l">' + l + '</td><td class="m">' + m + '</td><td class="r">' + r + '</td></tr>'; };
      if(lsg) lsg.forEach(function(g){ landRows += row('i', ssn(g.season) + '<span class="dt">' + dts(g.from, g.to) + '</span>', won(g.rate) + ' × ' + g.n + '일', won(g.n * g.rate)); });
      else if(c.per > 0 && c.nights > 0){ var s2 = addDays(q.s, 1); landRows += row('i', ssn(seasonOf(s2)) + '<span class="dt">' + dts(s2, addDays(q.s, c.nights)) + '</span>', won(c.per / c.nights) + ' × ' + c.nights + '일', won(c.per)); }
      else if(c.per > 0) landRows += row('i', tt, '', won(c.per));
      bd += landRows;
      if(c.air > 0) bd += row('h', '왕복 항공료' + (al ? ' (' + esc(al) + ')' : '') + (partAir ? '<span class="dt">' + c.airPax + '명 포함</span>' : ''), '', won(c.air));
      c.extras.forEach(function(x){ bd += row('h', esc(x.label), '', won(x.per)); });
      if(hasSg){
        var rt = sg.rates.length === 1 ? won(sg.rates[0]) : won(sg.rates[0]) + '~' + won(sg.rates[sg.rates.length-1]);
        bd += row('h', '싱글룸 추가<span class="dt">1실 기준</span>', rt + ' × ' + sg.nights + '박', won(sg.perRoom));
      }
      if(uniform) bd += row('sum', '1인 합계', '', won(c.perAll));
      else {
        if(c.per > 0) bd += row('mul first', tt + ' ' + won(c.per) + ' × ' + c.pax + '명', '', won(c.land));
        if(c.air > 0) bd += row('mul', '왕복 항공료 ' + won(c.air) + ' × ' + c.airPax + '명', '', won(c.airAll));
        c.extras.forEach(function(x){ bd += row('mul', esc(x.label) + ' ' + won(x.per) + ' × ' + c.pax + '명', '', won(Number(x.per) * c.pax)); });
        if(hasSg) bd += row('mul', '싱글룸 추가 ' + won(sg.perRoom) + ' × ' + sg.rooms + '실', '', won(sg.total));
      }
    }
    var totLabel = esc(o.total || '총 견적 금액');
    var totLine = '<div class="tx tt"><span>' + totLabel + '<small class="tp">' + c.pax + '명</small></span><b>' + won(c.total) + '<small>원</small></b></div>';
    var panel;
    if(G && uniform){
      /* 인보이스(격자): 1인 합계는 표 안에 있으니 패널은 총액 + 계좌 */
      panel = '<div class="qbd-tot has-x pp"><span>' + totLabel + '<small class="tp">' + c.pax + '명</small></span><b>' + won(c.total) + '<small>원</small></b>' + (o.extra || '') + '</div>';
    } else {
      var k0 = kinds[0], rest = kinds.slice(1);
      panel = '<div class="qbd-tot has-x pp' + (kinds.length > 1 ? ' multi' : '') + '"><span>' + esc(k0.label) + (k0.one ? '' : '<small class="tp">' + k0.n + (k0.unit || '명') + '</small>') + '</span><b>' + won(k0.amt) + '<small>원</small></b>'
        + rest.map(function(k){ return '<div class="tx kx"><span>' + esc(k.label) + '<small class="tp">' + k.n + (k.unit || '명') + '</small></span><b>' + won(k.amt) + '<small>원</small></b></div>'; }).join('')
        + totLine + (o.extra || '') + '</div>';
    }
    var head = '<div class="qd-sech"><span>' + esc(o.title || '견적 금액') + '</span>' + (landRows && !o.lean ? '<small>' + tt + ' · 이용일 기준</small>' : '') + '</div>';
    var table = '<table class="qbd' + (G ? ' grid' : '') + '">' + bd + '</table>';
    if(o.collapse){
      /* 견적서: 금액 먼저, 상세는 펼쳐서 (사장님 2026-09-13) */
      return head + '<div class="qd-bd">' + panel
        + '<button type="button" class="qbd-more" aria-expanded="false">요금 상세 보기 <i>▾</i></button>'
        + '<div class="qbd-detail" hidden>' + table + '</div></div>';
    }
    return head + '<div class="qd-bd">' + table + panel + '</div>';
  }

  /* ── 간단 일정 자동 생성 — 도착일 / 체류 기간(매일 자유 라운딩) / 출발일 세 줄 ──
     항목: {d:날짜 표기, t:내용}. 과거 저장분(문자열 배열 = 날짜별)도 itinOf가 변환 */
  function autoItin(q){
    q = nq(q);
    var n = hotelNights(q);
    if(!(n > 0)) return [];
    var it = [];
    var noAir = !!q.airSep;   /* 항공 별도: 항공편 줄 없이 기본 패턴 */
    it.push({ d: fmtMD(q.s), n: '1일차',
      t: (noAir ? '' : fltLine(q.out, apOf(q).name, AP_BKK) + '\n') + '공항 미팅 · 호텔로 이동\n호텔 체크인 · 휴식' });
    for(var i = 1; i < n; i++){
      it.push({ d: fmtMD(addDays(q.s, i)), n: (i+1) + '일차',
        t: '조식 후 골프장으로 이동\n썬라이즈&스카이밸리 무제한 라운딩\n라운딩 후 석식 및 자유시간' });
    }
    var dh = (function(){ var t = fltParts(q.inb).dep; return t ? parseInt(t.split(':')[0], 10) : (noAir ? 21 : -1); })();   /* 항공 별도 + 시각 없음 → 저녁 출발로 간주(라운딩 후 18:00 체크아웃) */
    var early = isEarlyDep(q);
    var lastPre = (dh >= 19 || early)
      ? '조식 후 골프장으로 이동\n썬라이즈&스카이밸리 무제한 라운딩\n호텔 체크아웃 (18:00) · 짐은 프론트 보관\n석식 후 공항으로 이동\n'
      : (dh >= 13
        ? '조식 후 골프장으로 이동\n썬라이즈&스카이밸리 무제한 라운딩\n호텔 체크아웃 · 짐은 프론트 보관\n중식 후 공항으로 이동\n'
        : (dh >= 9 ? '조식 후 호텔 체크아웃\n공항으로 이동\n' : '호텔 체크아웃\n공항으로 이동\n'));
    /* 항공 별도: 항공편 줄 대신 짧은 문구 (개인 항공편) */
    var legDep = noAir ? '' : fltLeg(q.inb, 'dep', AP_BKK);
    var legArr = noAir ? '한국 도착 (개인 항공편)' : fltLeg(q.inb, 'arr', apOf(q).name);
    var lineIn = noAir ? '귀국 (개인 항공편)' : fltLine(q.inb, AP_BKK, apOf(q).name);
    if(isP1(q)){
      it.push({ d: fmtMD(addDays(q.s, n)), n: (n+1) + '일차',
        t: (lastPre + legDep).replace(/\n$/, '') });
      it.push({ d: fmtMD(q.e), n: (n+2) + '일차', t: legArr });
    } else if(early){
      it.push({ d: fmtMD(addDays(q.s, n)), n: (n+1) + '일차', t: lastPre.replace(/\n$/, '') });
      it.push({ d: fmtMD(q.e), n: (n+2) + '일차', t: lineIn });
    } else {
      it.push({ d: fmtMD(q.e), n: (n+1) + '일차',
        t: (lastPre + lineIn).replace(/\n$/, '') });
    }
    return it;
  }
  function normItin(q){
    var it = Array.isArray(q.itin) ? q.itin : [];
    if(it.length && typeof it[0] === 'string') it = it.map(function(t, i){ return { d: q.s ? fmtMD(addDays(q.s, i)) : '', t: t }; });
    return it.filter(function(x){ return x && (String(x.t||'').trim() || String(x.d||'').trim()); })
             .map(function(x){ return { d: String(x.d||''), n: String(x.n||''), t: String(x.t||'') }; });
  }
  /* 자동 일정 상태(itinAuto !== false)면 저장된 줄 대신 항상 최신 규칙으로 다시 생성 — 직접 고친 견적서만 저장된 줄 사용 */
  function itinOf(q){
    if(q.itinAuto !== false){ var auto = autoItin(q); if(auto.length) return auto; }
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
  /* mode 'invoice' → 고객용 인보이스(청구서): 견적서에서 고객 정보 + 금액표 + 입금 계좌 + 명함만 (2026-09-10) */
  function render(q, mode){
    q = nq(q || {});
    var isInv = mode === 'invoice';
    var h = HOTEL[q.hotel] || HOTEL.sunrise;
    var c = calc(q);
    var n = c.nights;
    var tt = q.tt === 'guest' ? '비회원' : '회원';
    /* 옛 견적에 저장된 긴 문구도 표시할 때 같은 형식으로 정리 */
    var tidy = function(x){
      return String(x).replace(/\s*\(현지 지불\)/g, '')
        .replace(/^호텔 숙박(\s*\(.*\))?$/, '숙박')
        .replace(/^조식\s*·\s*중식\s*·\s*석식(\s*\(한식 뷔페\))?$/, '식사 (조·중·석)')
        .replace(/^매일 3식(\s*\(한식 뷔페\))?$/, '식사 (조·중·석)')
        .replace(/^무제한 그린피(\s*\(.*\))?$/, '그린피')
        .replace(/^왕복 항공료$/, '항공료');
    };
    var inc = lines(q.inc != null ? q.inc : DEF_INC).map(tidy);
    if(!inc.some(function(x){ return /보험/.test(x); })) inc.push('여행자보험');   /* 옛 견적에도 여행자보험 표시 */
    var exc = lines(q.exc != null ? q.exc : DEF_EXC).map(tidy);
    /* 항공료가 견적에 들어가면 불포함의 항공료 줄은 빼고 포함 맨 위에 표시 */
    if(c.air > 0){
      exc = exc.filter(function(x){ return !/항공/.test(x); });
      if(!inc.some(function(x){ return /항공/.test(x); })) inc.unshift('항공료');
    } else {
      /* 항공 별도·항공료 없음: 포함에서 빼고 불포함 맨 앞에 (2026-09-14) */
      inc = inc.filter(function(x){ return !/항공/.test(x); });
      if(!exc.some(function(x){ return /항공/.test(x); })) exc.unshift('항공료');
    }
    var a = q.agt || {};
    var sched = (q.s && q.e)
      ? fmtYMD(q.s) + ' 출발 ~ ' + fmtYMD(q.e) + ' 귀국' + (stayTxt(q) ? ' · ' + stayTxt(q) : '')
      : '일정 미정';
    var title = '썬라이즈 &amp; 스카이밸리 골프 투어';
    var nightly = Number(q.nightly) || 0;
    var single = singleRooms(q);
    var rooms = roomTxt(q);

    /* 금액표 — 공식 문서 형식 (2026-09-10): 구분 | 1인 금액 | 인원 | 합계 금액, 마지막 줄 총 견적 금액 (인보이스와 같은 구조) */
    /* ── 견적 금액 — 계산 명세 형식 (사장님 2026-09-13): 인보이스 청구 내역과 같은 구조
         회원 요금(라운딩 일자 기준) → 시즌 배지 + 기간 | N일 × 1일 요금 | 1인 금액
         왕복 항공료 / 추가 항목 / 싱글룸(1실 기준) → 1인 합계 → 총 견적 금액 (1인 × 인원) ── */
    var priceSec = priceBlock(q, c, isInv ? { title:'청구 금액', total:'총 청구 금액', kw:'청구' } : { title:'견적 금액', total:'총 견적 금액', kw:'견적', collapse:true })
      || '<div class="qd-h c-red">견적 금액</div><div class="qd-memo">요금은 담당자에게 문의해주세요.</div>';

    var itin = itinOf(q);
    var last = itin.length - 1;
    var PIN = '<svg class="pin" viewBox="0 0 24 30" width="12" height="15"><path d="M12 0C5.37 0 0 5.37 0 12c0 8.25 12 18 12 18s12-9.75 12-18C24 5.37 18.63 0 12 0z" fill="#e8392f"/><circle cx="12" cy="12" r="4.3" fill="#fff"/></svg>';
    var BED = '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"/><path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 18h18"/></svg>';
    var FORK = '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>';
    var HOT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5l8-3 8 3v16"/><path d="M2 21h20"/><path d="M9 9h1.5M13.5 9H15M9 13h1.5M13.5 13H15M10.5 21v-4h3v4"/></svg>';
    var hero = HERO[q.hotel] || HERO.sunrise;
    var arrT = fltParts(q.out).arr, lateArr = !!(arrT && parseInt(arrT.split(':')[0], 10) >= 20);
    /* 마지막 날 식사 — 귀국편 방콕 출발 19시 이후면 조·중·석식, 13시 이후면 조·중식, 그 전이면 조식만 */
    var depT = fltParts(q.inb).dep, depH = depT ? parseInt(depT.split(':')[0], 10) : -1;
    var lastMeals = (depH >= 19 || (depH >= 0 && depH < 6)) ? '조식: 뷔페식 · 중식: 뷔페식 · 석식: 뷔페식' : (depH >= 13 ? '조식: 뷔페식 · 중식: 뷔페식' : '조식: 뷔페식');
    var dfmt = function(d){ var m = String(d||'').match(/^(\d{1,2})\.(\d{1,2})\s*\(([^)]+)\)/); return m ? (m[1].length<2?'0':'')+m[1]+'/'+(m[2].length<2?'0':'')+m[2]+' ('+m[3]+')' : esc(d); };
    var row = function(time, body, cls){ return '<div class="qe' + (cls ? ' ' + cls : '') + '"><b>' + (time ? esc(time) : '') + '</b><div>' + body + '</div></div>'; };
    /* 똑같은 일정(항공·체크인/아웃 없는 날)이 3일 이상 이어지면 카드 한 장으로 묶음 — 첫날·마지막 날은 항상 별도 */
    var plain = function(ls){ return !ls.some(function(l){ return /→|출발|도착|체크아웃|체크인/.test(l); }); };
    var groups = [];
    for(var gi = 0; gi < itin.length; gi++){
      var gj = gi;
      if(gi !== 0 && plain(lines(itin[gi].t))){
        while(gj + 1 < last && itin[gj+1].t === itin[gi].t) gj++;
      }
      if(gj - gi + 1 >= 3){ groups.push({ i:gi, j:gj }); gi = gj; }
      else groups.push({ i:gi, j:gi });
    }
    var itinSec = itin.length
      ? '<div class="qd-itin tl">' + groups.map(function(g){
          var x = itin[g.i], i = g.i, span = g.j > g.i ? { j:g.j, n:g.j - g.i + 1 } : null;
          var ls = lines(x.t);
          var hasOut = ls.some(function(l){ return /체크아웃|방콕[^\n]*출발/.test(l); });
          var hasDep = ls.some(function(l){ return /방콕[^\n]*출발/.test(l); });
          var hasArr = ls.some(function(l){ return /(인천|김해|대구) 국제공항 도착/.test(l); });
          var isFirst = (i === 0);
          var flightOnly = !isFirst && ls.length > 0 && ls.every(function(l){ return /→|출발|도착/.test(l) && !/체크/.test(l); });
          var arrOnly = flightOnly;
          var isLast = (i === last) || hasOut || hasArr;
          var home = apOf(q).city;
          var route = arrOnly ? (hasOut ? '방콕 → ' + home : home) : (isFirst && isLast ? home + ' → 방콕 → ' + home : (isFirst ? home + ' → 방콕' : ((isLast && hasDep) ? '방콕 → ' + home : '방콕')));
          /* ── 컴팩트 타임라인 (사장님 2026-09-13: 길고 단조로움) — 일차마다 한 덩어리: 제목 줄 + 흐름 한 문단 + 태그(라운딩·호텔·식사) ── */
          var evs = [], golfs = [];
          var pretty = function(s){ var m = String(s).match(/^(\d{1,2}:\d{2})\s*(.*)$/); return (m ? '<b>' + esc(m[1]) + '</b> ' : '') + esc(m ? m[2] : s); };
          ls.forEach(function(l){
            var txt = l.replace(/^⛳\s*/, '');
            var code = '';
            var cm = txt.match(/\(([^)]*[A-Z]{2}\s?\d{2,4}[^)]*)\)\s*$/);
            if(cm){ code = cm[1].trim(); txt = txt.slice(0, cm.index).trim(); }
            if(/라운딩/.test(txt) && !/^라운딩 후/.test(txt)){ evs.push('<mark class="hl golf">⛳ ' + esc(txt) + '</mark>'); return; }   /* 흐름 안 제자리 + 형광펜 */
            if(/→/.test(txt) && /(출발|도착)/.test(txt)){
              txt.split('→').forEach(function(p){ p = p.trim(); if(p) evs.push(pretty(p)); });
              return;
            }
            evs.push(pretty(txt));
          });
          /* 첫날 도착이 20시 이후(밤 비행기)면 석식 없음 */
          var meals = arrOnly ? '' : (isFirst && isLast ? '' : (isFirst ? (lateArr ? '' : '석식') : (isLast ? lastMeals.replace(/:\s*뷔페식/g, '').replace(/\s*·\s*/g, ' · ') : '조식 · 중식 · 석식')));
          var tags = (isLast ? '' : '<span class="tg hotel">' + HOT + esc(h.hotel || h.kr) + '</span>')
            + (meals ? '<span class="tg meal">' + FORK + esc(/조식.*중식.*석식/.test(meals) ? '3식 한식 뷔페' : meals + ' 한식 뷔페') + '</span>' : '');
          var dl = span ? (i+1) + '~' + (span.j+1) + '일차' : esc(x.n || ((i+1) + '일차'));
          var dd = span ? dfmt(x.d).replace(/\s*\(.*\)$/, '') + ' ~ ' + dfmt(itin[span.j].d).replace(/\s*\(.*\)$/, '') : dfmt(x.d);
          return '<div class="tl-day' + (span ? ' span' : '') + '">'
            + '<div class="tl-l"><b>' + dl + '</b><span>' + esc(dd) + '</span>' + (span ? '<i>' + span.n + '일간 동일</i>' : '') + '</div>'
            + '<div class="tl-r"><div class="tl-t">' + PIN + esc(route) + '</div>'
            +   (evs.length ? '<div class="tl-ev">' + evs.map(function(e){ return '<div>' + e + '</div>'; }).join('') + '</div>' : '')   /* 한 줄에 하나씩 — 문단 줄바꿈 뒤죽박죽 방지 (2026-09-14) */
            +   (tags ? '<div class="tl-tags">' + tags + '</div>' : '')
            + '</div></div>';
        }).join('') + '</div>'
      : '';

    /* 포함·불포함 한 줄 표기: 항목 안 ' · '는 붙이고(조식·중식·석식) 항목 사이는 ' / ' */
    var cpt = function(x){ return esc(String(x).replace(/\s*·\s*/g, '·')); };
    var infoRows = ''
      + '<div class="qi"><span class="k">고객명</span><span class="v">' + (q.name ? esc(q.name) + ' 님' : '-') + (q.tt !== 'guest' && (q.mt === 'biz' || q.mt === 'prm') ? '<em class="mtb ' + q.mt + '">' + (q.mt === 'prm' ? '프리미엄 회원' : '비즈니스 회원') + '</em>' : '') + (q.holder ? '<small class="hold">' + esc(q.holder) + ' 회원권 이용</small>' : '') + '</span></div>'
      + '<div class="qi r"><span class="k">인 원</span><span class="v">' + (c.pax > 0 ? c.pax + '명' : '-') + '</span></div>'
      + '<div class="qi full"><span class="k">일 정</span><span class="v nw">' + ((q.s && q.e) ? fmtYMD(q.s) + ' ~ ' + (String(q.s).slice(0,4) === String(q.e).slice(0,4) ? fmtMD(q.e) : fmtYMD(q.e)) + (stayTxt(q) ? ' · ' + stayTxt(q) : '') : '-') + '</span></div>'
      + '<div class="qi full"><span class="k">호 텔</span><span class="v">' + esc(h.hotel || h.kr) + ' · ' + esc(rooms) + '</span></div>'
      + '<div class="qi full onerow"><span class="k">포 함</span><span class="v one">' + (inc.length ? inc.map(cpt).join('<i class="sp">/</i>') : '-') + '</span></div>'
      + '<div class="qi full onerow"><span class="k">불포함</span><span class="v one">' + (exc.length ? exc.map(cpt).join('<i class="sp">/</i>') : '-') + '</span></div>'
;
    /* 항공 스케줄 — 견적서 표에서 빼고 일정표 맨 위에 큼지막하게 (사장님 2026-09-13) */
    var flBig = (function(){
          /* 탑승권 카드 (사장님 2026-09-13 시안 채택): 위 띠 배지·날짜 | 로고·편명, 본문 도시+큰 시각 → 비행기 → 도시+큰 시각, 아래 공항명 */
          var po = fltParts(q.out), pi = fltParts(q.inb);
          if(q.airSep || !(po.no || po.dep || pi.no || pi.dep)) return '';   /* 항공 별도면 탑승권 카드 없음 */
          var ap = apOf(q), home = ap.city, homeAp = ap.name;
          var d2 = function(d){ if(!d) return ''; var x = ds2d(d); return (x.getMonth()+1 < 10 ? '0' : '') + (x.getMonth()+1) + '/' + (x.getDate() < 10 ? '0' : '') + x.getDate() + '(' + DOW[x.getDay()] + ')'; };
          var mins = function(t){ var m = String(t || '').match(/^(\d{1,2}):(\d{2})$/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
          /* 비행 시간: 한국(UTC+9) ↔ 태국(UTC+7) 시차 2시간 보정, 자정 넘김 처리 */
          var dur = function(dep, arr, out){ var a = mins(dep), b = mins(arr); if(a == null || b == null) return ''; var d = out ? (b + 120) - a : b - (a + 120); while(d < 0) d += 1440; var h = Math.floor(d / 60), mm = d % 60; return h + '시간' + (mm ? ' ' + mm + '분' : ''); };
          var PLANE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12l7 1 3 8 2-1-1-7 6-2 3 1 1-2-3-2-6-1-2-6-2 1 1 7-7 1z"/></svg>';
          var leg = function(tag, p, d, from, fromAp, to, toAp, out){
            var al = airlineOf(p.no ? { no:p.no } : ''), lg = airlineLogo({ no:p.no }), dd = d2(d);
            var top = '<div class="bp-top"><span class="l"><em>' + tag + '</em><b>' + esc(dd) + '</b></span><span class="r">' + (lg ? '<img class="bp-lg" src="' + lg + '" alt="' + esc(al) + '" crossorigin="anonymous" onerror="this.style.display=\'none\'">' : '') + (p.no ? '<span>' + esc((al ? al + ' ' : '') + p.no) + '</span>' : '') + '</span></div>';
            if(!(p.no || p.dep)) return '<div class="bp-card">' + top + '<div class="bp-main"><div class="bp-none">항공편 미정</div></div></div>';
            return '<div class="bp-card">' + top
              + '<div class="bp-main">'
              +   '<div class="bp-city"><div class="n">' + esc(from) + '</div><div class="t">' + esc(p.dep || '') + '</div><div class="s">' + esc(fromAp) + '</div></div>'
              +   '<div class="bp-mid">' + PLANE + '<div class="line"></div><div class="dur">' + esc(dur(p.dep, p.arr, out)) + '</div></div>'
              +   '<div class="bp-city"><div class="n">' + esc(to) + '</div><div class="t">' + esc(p.arr || '') + '</div><div class="s">' + esc(toAp) + '</div></div>'
              + '</div></div>';
          };
          var eq = nq(q);
          var inbDay = isP1(eq) ? addDays(eq.e, -1) : eq.e;
          return '<div class="it-fl bp"><div class="it-fl-h">항공 스케줄</div><div class="bp-grid">' + leg('출국', po, q.s, home, homeAp, '방콕', '수완나품 국제공항', true) + leg('귀국', pi, inbDay, '방콕', '수완나품 국제공항', home, homeAp, false) + '</div></div>';
        })();

    var bank = '<div class="qd-h c-navy box">입금 계좌</div>'   /* 견적 금액 표와 같은 흰 제목칸 + 네이비 윗선 (2026-09-11) */
      + '<div class="qd-bank"><b>' + esc(BANK.bank + ' ' + BANK.no) + '</b><span>예금주 ' + esc(BANK.holder) + '</span></div>'
      + '<p class="qd-partner"><span class="nw">(주)초이스골프는</span> <span class="nw">㈜썬앤스카이골프코리아의</span> <span class="nw">공식 파트너로서</span> <span class="nw">회원 투어의</span> <b class="nw">항공권 발권 · 현지 수배 · 예약 관리</b>를 담당합니다.</p>';
    var foot = '<div class="qd-foot">'
      /* 명함 2단 (사장님 2026-09-13: 로고 쪽이 허전) — 왼쪽: 로고 + 회사 정보 / 오른쪽: 이름 · 직함 · 연락처 */
      +   '<div class="qd-card">'
      +     '<div class="qd-brand"><img class="ss" src="' + LOGO + '" alt="SUN & SKY GOLF KOREA" crossorigin="anonymous">'
      +       '<div class="qd-corp"><b>' + esc(CO.name) + '</b>' + esc(CO.addr) + '<br><span class="nw">회원사업부 ' + esc(CO.tel2) + '</span> <i>|</i> <span class="nw">팩스 ' + esc(CO.fax) + '</span></div></div>'
      +     '<div class="qd-person"><div class="nm">' + esc(CO.mgr) + '</div><div class="pos">' + esc(CO.dept) + '<i>|</i>' + esc(CO.pos) + '</div><div class="ct">M. ' + esc(CO.mobile) + ' <i>|</i> T. ' + esc(CO.tel) + '</div></div>'
      +   '</div>'
      + '</div>';
    /* ── 페이지 넘기기 방식(2026-09-11, 접힌 칸은 복잡하다는 지적으로 폐기): 견적서 본문 + 큰 버튼 4개, 각 버튼은 별도 페이지(v=inv/fees/guide/itin) ── */
    var PAGES = [['itin','📅','일정표','일자별 항공 · 라운딩 · 식사'],['inv','🧾','인보이스','청구 내역 · 입금 계좌 · 취소 규정'],['fees','💵','현지 지불 요금','카트 · 캐디피 · 공항 미팅 · 혜택'],['guide','🏨','현지 이용 안내','도착 후 절차 · 식사 시간 · 체크아웃']];
    var moreBtns = function(cur){
      return '<div class="qd-more">' + PAGES.filter(function(p){ return p[0] !== cur && (p[0] !== 'itin' || itinSec); }).map(function(p){
        return '<a class="qd-more-a" data-v="' + p[0] + '" href="' + (q.id ? link(q.id) + '&v=' + p[0] : '#') + '" target="_blank" rel="noopener"><i>' + p[1] + '</i><div><b>' + p[2] + '</b><span>' + p[3] + '</span></div><em>›</em></a>';
      }).join('') + '</div>';
    };
    var subTop = function(title){
      return '<div class="qd-top sub"><a class="qd-back" data-v="quote" href="' + (q.id ? link(q.id) : '#') + '">‹ 견적서</a><div class="qd-title"><b>' + title + '</b><small>' + (q.name ? esc(q.name) + ' 님' : '') + (q.no ? ' · ' + esc(q.no) : '') + '</small></div></div>';
    };
    if(mode === 'fees' || mode === 'guide' || mode === 'itin'){
      var body = mode === 'fees' ? localFeesHtml(q) : (mode === 'guide' ? localGuideHtml(q, c) : (flBig + (itinSec || '<div class="qd-memo">일정이 아직 없습니다.</div>')));
      var ttl = mode === 'fees' ? '현지 지불 요금 안내' : (mode === 'guide' ? '현지 이용 안내' : '일정표');
      /* 서브 페이지는 내용만 — 제목 줄(고객명·견적번호)과 명함 푸터는 견적서 페이지에만 (사장님 2026-09-11) */
      return '<div class="qdoc sub">' + '<div class="qd-sec">' + body + '</div></div>';
    }
    return '<div class="qdoc">'
      + '<div class="qd-top"><img class="qd-logo" src="' + LOGO + '" alt="SUN &amp; SKY GOLF KOREA" crossorigin="anonymous">'
      +   '<div class="qd-title"><b>투어 견적서</b><small>' + fmtDot(q.at || d2ds(new Date())) + (q.no ? ' · ' + esc(q.no) : '') + '</small></div>'
      + '</div>'
      + '<div class="qd-sec">'
      +   '<div class="qd-infow"><div class="qd-infoh">예약 정보</div><div class="qd-info">' + infoRows + '</div></div>'
      +   priceSec
      +   (q.memo ? '<div class="qd-h c-gray">안내</div><div class="qd-memo">' + esc(q.memo) + '</div>' : '')
      +   moreBtns('quote')
      +   '<div class="qd-pp">'
      +     '<div class="pp-h">여권 사본 접수</div>'   /* 소개문·예시 그림 없이 접수 칸만 (사장님 2026-09-13) */
      +     '<div class="pp-btns"><button type="button" class="pp-cam">📷 카메라로 촬영</button><button type="button" class="pp-alb">🖼 앨범에서 선택</button></div>'
      +     '<input type="file" class="pp-cam-in" accept="image/*" capture="environment" hidden>'
      +     '<input type="file" class="pp-alb-in" accept="image/*" multiple hidden>'
      +     '<div class="pp-count"><span>제출 현황</span><span><b class="pp-num">' + ((q.pp||[]).length) + '</b>' + (c.pax > 0 ? ' / ' + c.pax + '명' : '장') + '</span></div>'
      +     '<div class="pp-status"></div>'
      +   '</div>'
      + '</div>'
      + (q.card === false ? '' : foot)   /* 명함 표시 옵션 (2026-09-14) */
      + '</div>';
  }

  /* ── 고객용 인보이스(청구서) — 초이스골프 인보이스와 같은 촘촘한 형식 (2026-09-10)
     예약 정보 / 청구 내역·입금 안내(운영 안내 포함) / 취소 및 환불 규정 / 한 줄 푸터 ── */
  var INV_W = 720;
  var CANCEL_HEAD = '본 상품은 항공료 전액과 호텔 지상비 등을 선지불하는 상품으로서 일반 국외여행 약관 및 소비자 보호법의 취소료 규정이 적용되지 않으며, 아래 특별약관을 적용하여 취소료를 징수합니다.';
  var CANCEL_RULES = [
    '국외여행표준약관 제5조[특약]에 근거한 특별약관이 적용됩니다.',
    '출발 15일 전까지 취소 시: 위약금 없음',
    '출발 14~8일 전 취소 시: 지상비의 10% 배상',
    '출발 7~1일 전 취소 시: 지상비의 30% 배상',
    '출발 당일 취소 시: 지상비의 100% 배상',
    '항공권은 발권 이후 취소·변경 시 항공사 규정에 따른 취소 수수료가 부과됩니다.'
  ];
  /* 인보이스 취소 규정: 폰에서도 한 줄씩 — [조건 | 규정] (사장님 2026-09-11) */
  var CANCEL_ROWS = [
    ['출발 15일 전까지 취소', '위약금 없음'],
    ['출발 14~8일 전 취소', '지상비 10% 배상'],
    ['출발 7~1일 전 취소', '지상비 30% 배상'],
    ['출발 당일 취소', '지상비 100% 배상'],
    ['항공권 발권 후 취소·변경', '항공사 규정 수수료']
  ];   /* 사장님 확정 2026-09-14 (출발 2주 전 입금 완료 기준) */
  var CANCEL_BASIS = '국외여행표준약관 제5조[특약] 특별약관 적용';
  function invoiceHtml(q){
    return '<div class="qdoc inv">' + invoiceInner(q) + '</div>';
  }
  function invoiceInner(q){
    q = nq(q || {});
    var c = calc(q), h = HOTEL[q.hotel] || HOTEL.sunrise, home = apOf(q).city;
    var po = fltParts(q.out), pi = fltParts(q.inb);
    var mt = (q.tt !== 'guest' && (q.mt === 'biz' || q.mt === 'prm')) ? (q.mt === 'prm' ? '프리미엄 회원' : '비즈니스 회원') : (q.tt === 'guest' ? '비회원' : '');
    var d2 = function(d){ if(!d) return ''; var x = ds2d(d); return (x.getMonth()+1 < 10 ? '0' : '') + (x.getMonth()+1) + '/' + (x.getDate() < 10 ? '0' : '') + x.getDate() + '(' + DOW[x.getDay()] + ')'; };
    /* 항공: 견적서와 같은 정렬 표 (배지 | 날짜 | 출발시각 출발지 → 도착시각 도착지 | 편명) */
    var leg = function(tag, p, d, from, to){
      if(!(p.no || p.dep)) return '';
      var dd = d2(d), dm = dd.match(/^(.*?)(\(.\))$/);
      return '<tr><td class="tag"><em>' + tag + '</em></td><td class="d">' + (dm ? esc(dm[1]) + '<span class="dw">' + esc(dm[2]) + '</span>' : esc(dd)) + '</td>'
        + '<td class="t">' + esc(p.dep || '') + '</td><td class="c">' + esc(from) + '</td><td class="ar">→</td>'
        + '<td class="t">' + esc(p.arr || '') + '</td><td class="c">' + esc(to) + '</td><td class="no">' + esc(p.no || '') + '</td></tr>';
    };
    var eq = nq(q); var flRows = leg('출국', po, q.s, home, '방콕') + leg('귀국', pi, isP1(eq) ? addDays(eq.e, -1) : eq.e, '방콕', home);
    var fl = flRows ? '<table class="inv-fl">' + flRows + '</table>' : '';
    var period = (q.s && q.e) ? fmtYMD(q.s) + ' ~ ' + (String(q.s).slice(0,4) === String(q.e).slice(0,4) ? fmtMD(q.e) : fmtYMD(q.e)) + (stayTxt(q) ? ' · ' + stayTxt(q) : '') : '-';
    /* ── 청구 내역: 계약 요금대로 계산 과정이 전부 보이게 (사장님 2026-09-11)
         회원 요금 → 시즌별 "기간 · N박 × 1박 요금 = 1인 금액" → 회원 요금 1인 합계
         왕복 항공료 → 1인 / 싱글룸 → 1실 기준 / 1인 합계 → × 인원 = 납부 금액 ── */
    var bankX = '<div class="tx"><span class="lb">입금계좌</span><b>' + esc(BANK.bank + ' ' + BANK.no) + '</b><span class="brk"></span><span class="hd">예금주 ' + esc(BANK.holder) + '</span><button type="button" class="inv-copy" data-copy="' + esc(BANK.bank + ' ' + BANK.no) + '">복사</button></div>';
    var rows = priceBlock(q, c, { title:'청구 내역', total:'총 납부 금액', lean:true, grid:true, extra:bankX });   /* 1인 납부 금액 중심 (사장님 2026-09-13) */   /* 세로선 격자 (사장님 2026-09-13) */   /* 조각 최소화 (사장님 2026-09-13): 계좌는 총액 패널 안 둘째 줄 */
    return ''
      + '<div class="inv-top">'
      +   '<div class="l"><span class="ttl">INVOICE</span><img src="' + LOGO + '" alt="SUN &amp; SKY GOLF KOREA" crossorigin="anonymous"></div>'
      +   '<div class="r">발행일 ' + fmtDot(d2ds(new Date())) + (q.no ? ' · 견적번호 ' + esc(q.no) : '') + '</div>'
      + '</div>'
      /* ── 틀 없는 인보이스 (사장님 2026-09-13): 예약 정보 두 줄 → 청구 내역(공용 블록) → 입금계좌(유일한 테두리) → 안내문 → 취소 규정 목록 ── */
      + '<div class="inv-sec who"><div class="inv-h">예약 정보</div><div class="inv-kv">'
      +   '<div class="kv"><span class="k">수 신</span><span class="v"><b>' + (q.name ? esc(q.name) + ' 님' : '-') + '</b>' + (c.pax > 0 ? ' · ' + c.pax + '명' : '') + (mt ? ' (' + mt + (q.holder ? ' · ' + esc(q.holder) + ' 회원권' : '') + ')' : '') + '</span></div>'
      +   '<div class="kv"><span class="k">호 텔</span><span class="v">' + esc(h.hotel || h.kr) + ' · ' + esc(roomTxt(q)) + '</span></div>'
      +   '<div class="kv"><span class="k">기 간</span><span class="v">' + period + '</span></div>'
      + '</div></div>'
      + (rows || '<div class="inv-none">요금은 담당자에게 문의해주세요.</div>')
      + '<div class="qd-sech"><span>취소 및 환불 규정</span></div>'
      + '<div class="inv-rl">' + CANCEL_ROWS.map(function(r){ return '<div class="rl"><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('') + '</div>'
      + '<p class="inv-fn">회원 요금은 이용일 기준 · 출발 2주 전 입금 완료 · ' + esc(CANCEL_BASIS) + '<br>(주)초이스골프는 ㈜썬앤스카이골프코리아의 공식 파트너로서 회원 투어의 항공권 발권 · 현지 수배 · 예약 관리를 담당합니다.</p>';
  }
  function toInvoiceJpg(q, fname){
    var host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-3000px;top:0;z-index:-1;pointer-events:none;width:' + INV_W + 'px;background:#fff';
    host.innerHTML = invoiceHtml(q);
    document.body.appendChild(host);
    var doc = host.firstElementChild;
    return toJpg(doc, fname || '인보이스', INV_W).then(function(){ host.remove(); }, function(e){ host.remove(); throw e; });
  }
  /* ── 현지 지불 요금 안내 — 브로셔형 (사진 헤더 + 파스텔 패널 + 사진 카드), 회원 혜택·이용 안내(입회안내서) 기준 1인당 USD (2026-09-11) ── */
  var PIC = {
    fairway: IMG + 'sunrise-main1.jpg', hotelNight: IMG + 'sunrise-main2.jpg', green: IMG + 'library/golf/1783322260012_81sc38vwc2v.png',
    skyvalley: IMG + 'sunrise/skyvalley/hotel-main.jpg', shuttle: IMG + 'sunrise/tours/shuttle.jpg', massage: IMG + 'sunrise/benefits/massage.png', bbq: IMG + 'sunrise/benefits/bbq.png', bangpakong: IMG + 'sunrise/tours/bangpakong.jpg'
  };
  function img(src, cls){ return '<img class="' + (cls||'') + '" src="' + src + '" alt="" loading="lazy" crossorigin="anonymous">'; }
  function localFeesHtml(q){
    var mem = !(q && q.tt === 'guest');
    var tile = function(label, price, cls){ return '<div class="lf-tile ' + (cls||'') + '"><span>' + label + '</span><b>' + price + '</b></div>'; };
    var price = function(reg, memv){ return mem && memv != null ? '<s>$' + reg + '</s><b>$' + memv + '</b><em>회원</em>' : '<b>$' + reg + '</b>'; };
    var photo = function(icon, title, sub, priceHtml){ return '<div class="lf-photo"><i class="lf-ic">' + icon + '</i><div class="lf-pb"><div class="lf-pt">' + title + (sub ? '<small>' + sub + '</small>' : '') + '</div><div class="lf-pp">' + priceHtml + '</div></div></div>'; };   /* 실사 사진 대신 아이콘 (사장님 2026-09-11) */
    return '<div class="lf">'
      + '<div class="lf-top"><b>현지에서 직접 결제하는 항목</b><span>1인당 · USD 기준</span></div>'
      + '<div class="lf-panel green"><div class="lf-ph"><i>⛳</i><b>카트 · 캐디피 · 팁</b><span>2인 1카트 · 2인 1캐디 기준</span></div>'
      +   '<div class="lf-tiles">' + tile('18홀', '$35') + tile('9홀 추가', '$10') + tile('18홀 추가', '$20') + '</div>'
      +   '<div class="lf-note">홀수 팀의 한 분은 1인 1카트 · 1인 1캐디로 진행되며 18홀 <b>$50</b>입니다.</div>'
      + '</div>'
      + '<div class="lf-panel blue"><div class="lf-ph"><i>✈</i><b>공항 미팅 · 샌딩</b><span>첫날 차량에서 현지 지불 · 1인당</span></div>'
      +   '<div class="lf-tiles four">' + tile('1인 출발', '$100') + tile('2인 출발', '$80') + tile('3인 출발', '$60') + tile('4인 이상', '$50') + '</div>'
      + '</div>'
      + '<div class="lf-panel gold"><div class="lf-ph"><i>★</i><b>' + (mem ? '창립회원 혜택 · 기타' : '기타 현지 요금') + '</b><span>' + (mem ? '회원 상시 할인가로 이용하실 수 있습니다' : '현지에서 선택 이용') + '</span></div>'
      +   '<div class="lf-photos">'
      +     photo('💆', '타이 마사지', '120분 · 팁 포함', price(30, 25))
      +     photo('🍖', 'BBQ 삼겹살 무제한', '클럽하우스', price(15, 10))
      +     photo('🚐', '시내 셔틀', '왕복 · 클럽하우스 18:00 / 18:30 출발', price(5, 3))
      +     photo('⛳', '스카이밸리 노캐디', '비수기 1일 카트 무제한 $35 · 성수기 18홀 $20', '<b>$35 / $20</b>')
      +   '</div>'
      + '</div>'
      + '</div>';
  }
  /* ── 현지 이용 안내 — 브로셔형 (호텔 사진 헤더 + 번호 타임라인 + 아이콘 카드) ── */
  function localGuideHtml(q, c){
    var pax = c && c.pax > 0 ? c.pax : (Number(q.pax) || 0);
    var picket = '썬라이즈 라군 C.C · ' + (q.name ? esc(q.name) : '대표자 성함') + (pax ? ' ' + pax + '인' : '');
    var step = function(n, t, d){ return '<div class="lg-step"><i>' + n + '</i><div><b>' + t + '</b><span>' + d + '</span></div></div>'; };
    var h = function(t, sub){ return '<div class="lg-h"><b>' + t + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>'; };
    return '<div class="lg">'
      + '<div class="lg-top"><span>SUNRISE LAGOON HOTEL AND GOLF</span><b>썬라이즈 라군에 오신 것을 환영합니다</b><em>먼 길 오시느라 고생 많으셨습니다.</em></div>'   /* 환영 멘트 (2026-09-11) */
      + h('도착 후', '방콕 수완나품 공항 → 리조트')
      + '<div class="lg-steps">'
      +   step('01', '짐 찾기 · 3번 출구', '수하물을 찾으신 뒤 3번 출구로 이동합니다.')
      +   step('02', '피켓 확인 · 차량 탑승', '<mark>' + picket + '</mark> 피켓을 든 직원의 안내에 따라 차량에 탑승합니다.')
      +   step('03', '호텔 체크인', '한국어 가능한 태국 직원의 안내로 방을 배정받고, 휴식 또는 자유 일정입니다.')
      +   step('04', '골프백 커버 보관', '분실이 잦으니 커버는 직접 보관해 주세요.')
      + '</div>'
      + '<div class="lg-em"><i>☎</i><div><span>비상 연락처</span><b>우동영 상무 · +66-62-250-6525</b></div></div>'
      + h('1일차')
      + '<div class="lg-cards2">'
      +   '<div class="lg-card"><i>🛺</i><b>클럽하우스 셔틀 카트</b><span>호텔 1층 로비 ↔ 클럽하우스 반복 운행 · 이동 2~3분</span></div>'
      +   '<div class="lg-card"><i>🎒</i><b>준비물</b><span>아침 라운딩 복장 · 라운딩 비용 · 첫날 공항 미팅·샌딩 비용</span></div>'
      + '</div>'
      + h('식사 시간', '한식 뷔페')
      + '<div class="lg-meals"><div><i>🍳</i><span>조식</span><b>06:00 ~ 08:00</b></div><div><i>🍽</i><span>중식</span><b>11:00 ~ 13:00</b></div><div><i>🌙</i><span>석식</span><b>17:00 ~ 19:00</b></div></div>'
      + h('스카이밸리 C.C 라운딩', '차량 10분')
      + '<div class="lg-photo"><i class="lg-ic">⛳</i><ul>'
      +   '<li>전날 또는 당일 아침 식사 전에 말씀해 주세요. 쿠폰은 이동 후 동일하게 끊고 나가시면 됩니다.</li>'
      +   '<li>스카이밸리에서 점심 뷔페를 무료로 드실 수 있습니다.</li>'
      +   '<li>하루 한 구장만 라운딩할 수 있습니다. (오전 스카이밸리 18홀 후 오후 썬라이즈 추가 라운딩 불가)</li>'
      + '</ul></div>'
      + h('외부 셔틀 · 관광')
      + '<div class="lg-photo"><i class="lg-ic">🚐</i><ul>'
      +   '<li>시내(10분 거리) 셔틀: 왕복 1인 $5 (회원 $3), 클럽하우스에서 18:00 / 18:30 출발</li>'
      +   '<li>방콕 · 파타야 관광 상품은 클럽하우스 카운터에서 우동영 상무에게 문의해 주세요.</li>'
      + '</ul></div>'
      + h('마지막 날 체크아웃')
      + '<ul class="lg-check">'
      +   '<li>짐은 미리 싸 두시고, 라운딩 후 18:00 전까지 샤워를 마쳐 주세요.</li>'
      +   '<li>짐은 호텔 카운터에 맡겨 주세요.</li>'
      +   '<li>저녁 식사 후 항공편 출발 3시간 30분 전에 공항으로 이동합니다.</li>'
      + '</ul>'
      + '</div>';
  }
  /* ── 표시 + 좁은 화면 대응 ── */
  function fit(el){
    var doc = el.querySelector('.qdoc');
    if(!doc || doc.dataset.lock) return;
    doc.classList.toggle('narrow', el.clientWidth < 620);
  }
  var RO = null;
  /* 견적 페이지 뷰: quote / inv / fees / guide / itin */
  function bindCopy(el){
    Array.prototype.forEach.call(el.querySelectorAll('.qbd-more'), function(b){
      b.onclick = function(){
        var d = b.nextElementSibling; if(!d) return;
        var open = d.hidden; d.hidden = !open;
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        b.innerHTML = open ? '상세 닫기 <i>▴</i>' : '요금 상세 보기 <i>▾</i>';
      };
    });
    Array.prototype.forEach.call(el.querySelectorAll('.inv-copy'), function(b){
      b.onclick = function(){
        var t = b.getAttribute('data-copy') || '';
        copyText(t).then(function(){ b.textContent = '복사됨 ✓'; b.classList.add('ok'); setTimeout(function(){ b.textContent = '계좌 복사'; b.classList.remove('ok'); }, 2200); }, function(){ b.textContent = '복사 실패'; });
      };
    });
  }
  function mountView(el, q, v){
    el.innerHTML = v === 'inv' ? invoiceHtml(q) : render(q, v === 'quote' ? undefined : v);
    bindCopy(el);
    fit(el);
    if(!el.dataset.ssqFit){
      el.dataset.ssqFit = '1';
      if(window.ResizeObserver){ new ResizeObserver(function(){ fit(el); }).observe(el); }
      else { window.addEventListener('resize', function(){ fit(el); }); }
    }
    return el.querySelector('.qdoc');
  }
  /* 고객 페이지용 인보이스 표시 (견적서 mount와 같은 좁은 화면 대응) */
  function mountInvoice(el, q){
    el.innerHTML = invoiceHtml(q);
    bindCopy(el);
    fit(el);
    if(!el.dataset.ssqFit){
      el.dataset.ssqFit = '1';
      if(window.ResizeObserver){ new ResizeObserver(function(){ fit(el); }).observe(el); }
      else { window.addEventListener('resize', function(){ fit(el); }); }
    }
    return el.querySelector('.qdoc');
  }
  function mount(el, q){
    el.innerHTML = render(q);
    bindCopy(el);   /* 요금 상세 보기 버튼 동작 (포털 미리보기에서도, 2026-09-14) */
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
  function toJpg(doc, fname, width){
    var wasNarrow = doc.classList.contains('narrow');
    var st = { w:doc.style.width, mw:doc.style.maxWidth };
    doc.dataset.lock = '1';
    var wasClosed = Array.prototype.slice.call(doc.querySelectorAll('details:not([open])'));
    wasClosed.forEach(function(d){ d.open = true; });
    doc.classList.remove('narrow');
    doc.style.width = (width || 820) + 'px'; doc.style.maxWidth = 'none';
    var restore = function(){
      wasClosed.forEach(function(d){ d.open = false; });
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
        var isImg = (f.type || '').indexOf('image/') === 0 || ['jpg','jpeg','png','heic','heif','webp','jfif','bmp','gif','pdf'].indexOf(ext) > -1 || f.type === 'application/pdf';
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
    newId:newId, newNo:newNo, calc:calc, AIRPORTS:AIRPORTS, AIRLINES:AIRLINES, airlineOf:airlineOf, isEarlyDep:isEarlyDep, hotelNights:hotelNights, tripDays:tripDays, stayTxt:stayTxt, singleCalc:singleCalc, roomTxt:roomTxt, ROOM_TYPES:ROOM_TYPES, isP1:isP1, autoItin:autoItin, normItin:normItin, parseInquiry:parseInquiry, render:render, mount:mount, invoice:invoiceHtml, mountInvoice:mountInvoice, mountView:mountView, toInvoiceJpg:toInvoiceJpg, invLink:function(id){ return link(id) + '&v=inv'; }, CANCEL_RULES:CANCEL_RULES, CANCEL_HEAD:CANCEL_HEAD,
    save:save, load:load, list:list, remove:remove, link:link, copyText:copyText, toJpg:toJpg, uploadPassport:uploadPassport, bindPassport:bindPassport
  };
})();
