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
  var HERO = {
    sunrise:   IMG + 'sunrise-main1.jpg',
    skyvalley: IMG + 'sunrise/skyvalley/hotel-main.jpg'
  };
  var HOTEL = {
    sunrise:   { kr:'썬라이즈 라군 호텔 & 골프', en:'SUNRISE LAGOON HOTEL & GOLF · THAILAND', short:'썬라이즈 라군' },
    skyvalley: { kr:'스카이밸리 골프텔', en:'SKY VALLEY GOLF & HOTEL · THAILAND', short:'스카이밸리' }
  };
  var COURSE = { sunrise:'썬라이즈 라군 C.C', skyvalley:'스카이밸리 C.C' };
  var CO = {
    name:'주식회사 썬앤스카이골프코리아', en:'SUN & SKY GOLF KOREA CO., LTD.',
    tel1:'회원사업부 02-540-6114', tel2:'예약실 1533-3160',
    addr:'서울특별시 서초구 강남대로101안길 18-1, 201호 (잠원동, 잠원빌딩)'
  };
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
    var land = per * pax;
    var ext = extras.reduce(function(s,x){ return s + Number(x.per)*pax; }, 0);
    var perAll = per + extras.reduce(function(s,x){ return s + Number(x.per); }, 0);
    return { nights:nights(q.s,q.e), pax:pax, per:per, land:land, extras:extras, ext:ext, perAll:perAll, total:land+ext };
  }

  /* ── 간단 일정 자동 생성 — 도착일 / 체류 기간(매일 자유 라운딩) / 출발일 세 줄 ──
     항목: {d:날짜 표기, t:내용}. 과거 저장분(문자열 배열 = 날짜별)도 itinOf가 변환 */
  function autoItin(q){
    var n = nights(q.s, q.e);
    if(!(n > 0)) return [];
    var h = HOTEL[q.hotel] || HOTEL.sunrise;
    var fo = fltStr(q.out), fi = fltStr(q.inb);
    var it = [];
    it.push({ d: fmtMD(q.s),
      t: '인천 출발' + (fo ? ' (' + fo + ')' : '') + ' → 방콕 도착 · 미팅 후 호텔 이동\n' + h.short + ' 체크인 · 석식' });
    if(n >= 2){
      var a = addDays(q.s, 1), b = addDays(q.e, -1);
      it.push({ d: n === 2 ? fmtMD(a) : fmtMD(a) + ' ~ ' + fmtMD(b),
        t: '매일 자유 라운딩 · 18~36홀 무제한 그린피 (썬라이즈 라군 · 스카이밸리)\n조식 · 중식 · 석식 호텔 한식 뷔페' });
    }
    it.push({ d: fmtMD(q.e),
      t: '호텔 체크아웃 · 공항 이동 → 방콕 출발' + (fi ? ' (' + fi + ')' : '') + ' → 인천 도착' });
    return it;
  }
  function normItin(q){
    var it = Array.isArray(q.itin) ? q.itin : [];
    if(it.length && typeof it[0] === 'string') it = it.map(function(t, i){ return { d: q.s ? fmtMD(addDays(q.s, i)) : '', t: t }; });
    return it.filter(function(x){ return x && (String(x.t||'').trim() || String(x.d||'').trim()); })
             .map(function(x){ return { d: String(x.d||''), t: String(x.t||'') }; });
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
    var a = q.agt || {};
    var sched = (q.s && q.e)
      ? fmtYMD(q.s) + ' 출발 ~ ' + fmtYMD(q.e) + ' 귀국' + (n>0 ? ' · ' + n + '박 ' + (n+1) + '일' : '')
      : '일정 미정';
    var title = (q.name ? esc(q.name) + ' 님 · ' : '') + esc(h.short) + ' 골프 투어';

    var priceRows = '';
    if(c.pax > 0 && c.per > 0){
      priceRows += '<tr><td>지상비 <small>' + esc(h.short) + ' ' + (n>0 ? n + '박 ' + (n+1) + '일 · ' : '') + tt + ' 요금 · 숙박 + 3식 + 무제한 그린피</small></td>'
        + '<td>' + won(c.per) + '원</td><td class="c">' + c.pax + '명</td><td>' + won(c.land) + '원</td></tr>';
      c.extras.forEach(function(x){
        priceRows += '<tr><td>' + esc(x.label) + '</td><td>' + won(x.per) + '원</td><td class="c">' + c.pax + '명</td><td>' + won(Number(x.per)*c.pax) + '원</td></tr>';
      });
      priceRows += '<tr class="tot"><td>총 견적 금액</td><td>' + won(c.perAll) + '원</td><td class="c">' + c.pax + '명</td>'
        + '<td class="amt">' + won(c.total) + '<small>원</small></td></tr>';
    }
    var priceSec = priceRows
      ? '<div class="qd-h">견적 금액</div><table class="qd-price"><tr><th>항목</th><th>1인</th><th>인원</th><th>금액</th></tr>' + priceRows + '</table>'
        + '<div class="qd-note">· 원화 기준 · 현지 지불 요금은 아래 안내를 참고해주세요.</div>'
      : '<div class="qd-h">견적 금액</div><div class="qd-memo">요금은 담당자에게 문의해주세요.</div>';

    var itin = itinOf(q);
    var itinSec = itin.length
      ? '<div class="qd-h">일정</div><div class="qd-itin">' + itin.map(function(x){
          var body = lines(x.t).map(function(l){ return (/라운딩/.test(l) ? '⛳ ' : '') + esc(l); }).join('<br>');
          return '<div class="qd-day"><div class="dn"><b>' + esc(x.d).replace(' ~ ', '<br>~ ') + '</b></div><div class="dt">' + (body || '-') + '</div></div>';
        }).join('') + '</div>'
      : '';

    var info = [
      ['고객명', q.name ? esc(q.name) + ' 님' : '-'],
      ['인원', c.pax > 0 ? c.pax + '명' : '-'],
      ['호텔', esc(h.kr)],
      ['일정', (q.s && q.e) ? fmtMD(q.s) + ' ~ ' + fmtMD(q.e) + (n>0 ? ' <small>' + n + '박 ' + (n+1) + '일</small>' : '') : '-'],
      ['출국편', esc(fltStr(q.out)) || '<small>미정</small>'],
      ['귀국편', esc(fltStr(q.inb)) || '<small>미정</small>']
    ];

    return '<div class="qdoc">'
      + '<div class="qd-top"><img class="qd-logo" src="' + LOGO + '" alt="SUN &amp; SKY GOLF KOREA" crossorigin="anonymous">'
      +   '<div class="qd-main"><h1>' + title + '</h1><p>' + esc(sched) + '</p></div>'
      +   '<div class="qd-title"><b>투어 견적서</b><small>' + fmtDot(q.at || d2ds(new Date())) + (q.no ? '<br>' + esc(q.no) : '') + '</small></div>'
      + '</div>'
      + '<div class="qd-sec">'
      +   '<div class="qd-h">기본 정보</div>'
      +   '<div class="qd-info">' + info.map(function(r){ return '<div class="qi"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '</span></div>'; }).join('') + '</div>'
      +   itinSec
      +   priceSec
      +   '<div class="qd-h">포함 · 불포함</div>'
      +   '<div class="qd-cols">'
      +     '<div class="qd-col inc"><div class="t">포함 사항</div><ul>' + (inc.length ? inc.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') : '<li>-</li>') + '</ul></div>'
      +     '<div class="qd-col exc"><div class="t">불포함 사항</div><ul>' + (exc.length ? exc.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') : '<li>-</li>') + '</ul></div>'
      +   '</div>'
      +   '<div class="qd-h">현지 지불 요금 안내</div>'
      +   '<div class="qd-fees">'
      +     LOCAL_FEES.map(function(r){ return '<div class="qf"><div class="qf-k">' + esc(r[0]) + '</div><div class="qf-v"><b>' + esc(r[1]) + '</b><span>· ' + esc(r[2]) + '</span></div></div>'; }).join('')
      +   '</div>'
      +   (q.memo ? '<div class="qd-h">안내</div><div class="qd-memo">' + esc(q.memo) + '</div>' : '')
      + '</div>'
      + '<div class="qd-foot">'
      +   '<div class="qd-agent"><span class="k">담당</span><b>' + esc((a.co ? a.co + ' · ' : '') + (a.n || '')) + '</b>' + (a.tel ? '<span>' + esc(a.tel) + '</span>' : '') + '</div>'
      +   '<div class="qd-co"><b>' + esc(CO.name) + '</b>' + esc(CO.tel1) + ' · ' + esc(CO.tel2) + '<br>' + esc(CO.addr) + '<span class="en">' + esc(CO.en) + '</span></div>'
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

  window.SSQ = {
    LOGO:LOGO, HERO:HERO, HOTEL:HOTEL, DEF_INC:DEF_INC, DEF_EXC:DEF_EXC, LOCAL_FEES:LOCAL_FEES,
    esc:esc, won:won, fmtYMD:fmtYMD, fmtMD:fmtMD, fmtDot:fmtDot, nights:nights, addDays:addDays, d2ds:d2ds, fltStr:fltStr,
    newId:newId, newNo:newNo, calc:calc, autoItin:autoItin, normItin:normItin, parseInquiry:parseInquiry, render:render, mount:mount,
    save:save, load:load, list:list, remove:remove, link:link, copyText:copyText, toJpg:toJpg
  };
})();
