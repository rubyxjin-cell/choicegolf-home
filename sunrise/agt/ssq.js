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
    '공항 미팅 · 샌딩 (현지 지불)',
    '객실 싱글 차지',
    '개인 경비 · 여행자보험'
  ].join('\n');

  var DOW = ['일','월','화','수','목','금','토'];
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function won(n){ return (Number(n)||0).toLocaleString(); }
  function ds2d(ds){ var p=String(ds).split('-').map(Number); return new Date(p[0],p[1]-1,p[2]); }
  function fmtYMD(ds){ if(!ds) return '-'; var d=ds2d(ds); return d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate()+'('+DOW[d.getDay()]+')'; }
  function fmtMD(ds){ if(!ds) return '-'; var d=ds2d(ds); return (d.getMonth()+1)+'.'+d.getDate()+'('+DOW[d.getDay()]+')'; }
  function fmtDot(ds){ if(!ds) return '-'; var d=ds2d(ds); return d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0'); }
  function nights(a,b){ if(!a||!b) return 0; return Math.round((ds2d(b)-ds2d(a))/86400000); }
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
        + '<div class="qd-note">· 원화 기준 · 현지 지불 항목(카트·캐디피·팁, 공항 미팅·샌딩 등)은 별도입니다.</div>'
      : '<div class="qd-h">견적 금액</div><div class="qd-memo">요금은 담당자에게 문의해주세요.</div>';

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
      +   '<div class="qd-title"><span class="en">TOUR QUOTATION</span><b>투어 견적서</b>'
      +   '<small>' + esc(q.no || '') + (q.no ? ' · ' : '') + fmtDot(q.at || d2ds(new Date())) + '</small></div></div>'
      + '<div class="qd-hero"><img src="' + (HERO[q.hotel] || HERO.sunrise) + '" alt="" crossorigin="anonymous">'
      +   '<div class="qd-hero-in"><span class="qd-kicker">' + esc(h.en) + '</span><h1>' + title + '</h1><p>' + esc(sched) + '</p></div></div>'
      + '<div class="qd-sec">'
      +   '<div class="qd-h">기본 정보</div>'
      +   '<div class="qd-info">' + info.map(function(r){ return '<div class="qi"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '</span></div>'; }).join('') + '</div>'
      +   priceSec
      +   '<div class="qd-h">포함 · 불포함</div>'
      +   '<div class="qd-cols">'
      +     '<div class="qd-col inc"><div class="t">포함 사항</div><ul>' + (inc.length ? inc.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') : '<li>-</li>') + '</ul></div>'
      +     '<div class="qd-col exc"><div class="t">불포함 사항</div><ul>' + (exc.length ? exc.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') : '<li>-</li>') + '</ul></div>'
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
    var base = location.pathname.replace(/[^\/]*$/, '');
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
    LOGO:LOGO, HERO:HERO, HOTEL:HOTEL, DEF_INC:DEF_INC, DEF_EXC:DEF_EXC,
    esc:esc, won:won, fmtYMD:fmtYMD, fmtMD:fmtMD, fmtDot:fmtDot, nights:nights, d2ds:d2ds, fltStr:fltStr,
    newId:newId, newNo:newNo, calc:calc, render:render, mount:mount,
    save:save, load:load, list:list, remove:remove, link:link, copyText:copyText, toJpg:toJpg
  };
})();
