/* ═══════════════════════════════════════════════════════════════
   초이스골프 인보이스(청구서) 공용 렌더러 — v2 양식 (2026-09-17)
   invoice.html(고객 링크) · admin.html(미리보기) · product.html(견적서 안 청구서)이 함께 씀.
   데이터: bookings.invoice_table = {
     v:2,
     items:[{ name, qty, unit, note }],          // 청구 항목 (금액 = qty × unit)
     pay:{ show:true|false, rows:[{ label, date, amount, note }] },   // 입금 내역 (선택)
     notice:'한 줄에 하나'                       // 안내사항
   }
   그 외 bookings 컬럼: rep_name(수신) product_name(청구 제목) departure_date/return_date total_pax
   booking_no(인보이스 번호) invoice_bank(은행 계좌) invoice_note(잔금·기한 강조) cancellation_policy
   ═══════════════════════════════════════════════════════════════ */
window.CG_INV = (function(){
  const SELLER = {
    name: '(주)초이스골프', en: 'CHOICE GOLF CO., LTD.',
    bizno: '594-88-03010', ceo: '최진우', tel: '1533-3160',
    email: '', address: '서울특별시 서초구 강남대로101안길 18-1, 201호'
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const num = v => Math.round(Number(String(v == null ? '' : v).replace(/[^\d.-]/g, '')) || 0);
  const comma = n => (Number(n) || 0).toLocaleString();
  const fmtDate = d => { if (!d) return ''; const dt = new Date(d); if (isNaN(dt)) return String(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
  const fmtMD = d => { if (!d) return ''; const dt = new Date(d); if (isNaN(dt)) return String(d); const w = ['일','월','화','수','목','금','토'][dt.getDay()]; return `${dt.getMonth()+1}/${dt.getDate()}(${w})`; };

  function isV2(b){ return !!(b && b.invoice_table && Number(b.invoice_table.v) === 2); }
  function parseBank(s){
    const t = String(s || '').trim();
    const m = t.match(/^(\S+)\s+(.+)$/);
    return m ? { bank: m[1], acct: m[2].trim() } : { bank: t, acct: '' };
  }
  /* 합계 계산 — 항목 합 · 입금 합 · 잔금 */
  function calc(b){
    const t = (b && b.invoice_table) || {};
    const items = (t.items || []).map(it => ({ name: it.name || '', qty: num(it.qty) || 0, unit: num(it.unit), note: it.note || '' }))
      .filter(it => it.name || it.unit);
    items.forEach(it => { it.amt = (it.qty || 1) * it.unit; });
    const total = items.reduce((s, it) => s + it.amt, 0);
    const pay = t.pay || {};
    const payRows = (pay.rows || []).map(r => ({ label: r.label || '', date: r.date || '', amount: num(r.amount), note: r.note || '' }))
      .filter(r => r.label || r.amount);
    const paid = payRows.reduce((s, r) => s + r.amount, 0);
    return { items, total, showPay: !!pay.show, payRows, paid, balance: total - paid };
  }

  const CSS = `
    .inv{--navy:#1c3c70;--navy-lt:#eef3fb;--line:#d9dfe8;--ink:#23272f;--mut:#4f5662;max-width:820px;margin:0 auto;background:#fff;border:1px solid #dfe3ea;padding:34px 36px 26px;font-family:'Noto Sans KR',sans-serif;color:var(--ink);font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
    .inv *{box-sizing:border-box}
    .inv-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding-bottom:14px;border-bottom:3px double var(--navy);margin-bottom:22px}
    .inv-brand{display:flex;align-items:center;gap:14px}
    .inv-brand img{height:34px;width:auto;display:block}
    .inv-brand .co{font-size:18px;font-weight:800;color:var(--navy);line-height:1.15}
    .inv-brand .en{font-size:11px;letter-spacing:.18em;color:var(--mut);font-weight:600;margin-top:3px}
    .inv-title{text-align:right;flex-shrink:0}
    .inv-title .t{font-family:'Cormorant Garamond','Noto Serif KR',serif;font-size:40px;font-weight:700;letter-spacing:.16em;color:var(--navy);line-height:1}
    .inv-title .s{font-size:13px;color:var(--mut);letter-spacing:.32em;margin-top:4px;font-weight:600}
    .inv-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}
    .inv-box{border:1px solid var(--line)}
    .inv-box h3{margin:0;background:var(--navy-lt);color:var(--navy);font-size:14.5px;font-weight:800;padding:9px 14px;border-bottom:1px solid var(--line)}
    .inv-box table{width:100%;border-collapse:collapse}
    .inv-box th{width:104px;text-align:left;font-weight:600;color:var(--mut);font-size:13.5px;padding:8px 14px;border-bottom:1px solid #eef1f5;vertical-align:top;white-space:nowrap}
    .inv-box td{font-size:14.5px;font-weight:600;padding:8px 14px 8px 0;border-bottom:1px solid #eef1f5;word-break:keep-all;font-variant-numeric:tabular-nums}
    .inv-box tr:last-child th,.inv-box tr:last-child td{border-bottom:0}
    .inv-total{display:flex;justify-content:space-between;align-items:center;gap:12px;border:2px solid var(--navy);background:var(--navy-lt);padding:16px 22px;margin-bottom:18px}
    .inv-total .k{font-size:16px;font-weight:800;color:var(--navy)}
    .inv-total .k small{display:block;font-size:12px;font-weight:600;color:var(--mut);letter-spacing:.04em;margin-top:2px}
    .inv-total .v{font-size:30px;font-weight:800;color:var(--navy);font-variant-numeric:tabular-nums;white-space:nowrap}
    .inv-total .v i{font-style:normal;font-size:20px;margin-right:4px;font-weight:700}
    .inv-total.paid .v{color:#1f7a4d}
    .inv-scroll{overflow-x:auto;margin-bottom:18px}
    table.inv-items{width:100%;border-collapse:collapse;border:1px solid var(--line);min-width:520px}
    .inv-items th{background:var(--navy);color:#fff;font-size:13.5px;font-weight:700;padding:10px 10px;text-align:center;white-space:nowrap}
    .inv-items td{padding:11px 10px;font-size:14.5px;border-bottom:1px solid #e9edf2;text-align:center;vertical-align:middle;font-variant-numeric:tabular-nums}
    .inv-items td.nm{text-align:left;font-weight:700;padding-left:14px}
    .inv-items td.num{text-align:right}
    .inv-items td.note{color:var(--mut);font-size:13.5px}
    .inv-items tfoot td{background:var(--navy-lt);font-weight:800;color:var(--navy);border-bottom:0;font-size:15px}
    .inv-sec{font-size:15.5px;font-weight:800;color:var(--navy);border-left:4px solid var(--navy);padding-left:10px;margin:0 0 10px;line-height:1.3}
    .inv-due{background:#fff7e6;border:1px solid #f0d9a3;color:#6b4e0e;padding:12px 16px;font-weight:700;font-size:14.5px;margin:-6px 0 18px;line-height:1.65}
    .inv-notes{margin-bottom:18px}
    .inv-notes p{margin:0;font-size:14px;color:#33394a;line-height:1.75;padding-left:14px;text-indent:-14px}
    .inv-notes p::before{content:'\\25AA';color:var(--navy);margin-right:7px;font-size:10px}
    .inv-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;border-top:1px solid var(--line);padding-top:14px;margin-top:6px;font-size:12.5px;color:var(--mut);line-height:1.7}
    .inv-foot .fl{display:flex;align-items:center;gap:10px}
    .inv-foot .fl img{height:22px;width:auto;opacity:.9}
    .inv-foot .fr{text-align:right}
    .inv-foot b{color:var(--navy);font-weight:800;font-size:13.5px}
    .inv-stamp{width:46px;height:46px;flex-shrink:0;margin-left:8px}
    .inv-stamp img{width:100%;height:100%;object-fit:contain}
    @media (max-width:640px){
      .inv{padding:20px 14px 18px;font-size:14.5px}
      .inv-head{flex-direction:row;align-items:center}
      .inv-brand img{height:26px}.inv-brand .co{font-size:15px}.inv-brand .en{display:none}
      .inv-title .t{font-size:28px}.inv-title .s{font-size:11px}
      .inv-grid{grid-template-columns:1fr}
      .inv-total{padding:13px 14px}.inv-total .v{font-size:24px}.inv-total .v i{font-size:16px}
      .inv-foot{flex-direction:column;align-items:flex-start}.inv-foot .fr{text-align:left}
    }
    @media print{ .inv{border:none;max-width:none;padding:10mm 8mm} }`;

  function build(b, opts){
    opts = opts || {};
    const c = calc(b);
    const t = b.invoice_table || {};
    const bankSrc = (b.invoice_bank && String(b.invoice_bank).trim()) ? b.invoice_bank : (opts.account || '');
    const bank = parseBank(bankSrc);
    const invNo = b.booking_no ? b.booking_no : ('INV-' + (b.id ? String(b.id).slice(0, 8) : ''));
    const issue = fmtDate(b.invoice_issued_at || b.created_at || new Date());
    const pax = Number(b.total_pax) || 0;
    const dep = b.departure_date ? fmtMD(b.departure_date) : '';
    const ret = b.return_date ? fmtMD(b.return_date) : '';
    let sched = '';
    if (dep) {
      sched = ret ? `${dep} ~ ${ret}` : dep;
      if (b.departure_date && b.return_date) {
        const n = Math.round((new Date(b.return_date) - new Date(b.departure_date)) / 86400000);
        if (n > 0) sched += ` (${n}박${n + 1}일)`;
      }
    }
    const fullyPaid = c.total > 0 && c.showPay && c.balance <= 0;

    /* 행사 정보 */
    const infoRows = [
      ['인보이스 번호', esc(invNo)],
      ['발행일자', esc(issue)],
      ['수 신', esc(b.rep_name || '-')],
      sched ? ['행사 일정', esc(sched) + (pax > 0 ? ` · ${pax}명` : '')] : (pax > 0 ? ['인 원', `${pax}명`] : null),
      ['청구 내용', esc(b.product_name || '-')]
    ].filter(Boolean);
    const provRows = [
      ['회사명', esc(SELLER.name)],
      ['대표자', esc(SELLER.ceo)],
      ['사업자번호', esc(SELLER.bizno)],
      ['연락처', esc(SELLER.tel)],
      ['주 소', esc(SELLER.address)]
    ];
    const boxTable = rows => `<table>${rows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table>`;

    /* 청구 항목 */
    const hasNote = c.items.some(it => it.note);
    const itemRows = c.items.map((it, i) => `<tr>
        <td>${i + 1}</td>
        <td class="nm">${esc(it.name)}</td>
        <td>${it.qty ? comma(it.qty) : '-'}</td>
        <td class="num">${comma(it.unit)}</td>
        <td class="num"><b>${comma(it.amt)}</b></td>
        ${hasNote ? `<td class="note">${esc(it.note)}</td>` : ''}
      </tr>`).join('');
    const itemsTbl = `<div class="inv-scroll"><table class="inv-items">
        <colgroup><col style="width:46px"><col><col style="width:64px"><col style="width:120px"><col style="width:130px">${hasNote ? '<col style="width:22%">' : ''}</colgroup>
        <thead><tr><th>번호</th><th>품명 및 항목</th><th>수량</th><th>단가</th><th>금액</th>${hasNote ? '<th>비고</th>' : ''}</tr></thead>
        <tbody>${itemRows || '<tr><td colspan="6" style="color:#999">청구 항목이 없습니다</td></tr>'}</tbody>
        <tfoot><tr><td colspan="4">합 계</td><td class="num">${comma(c.total)}</td>${hasNote ? '<td></td>' : ''}</tr></tfoot>
      </table></div>`;

    /* 입금 내역 (선택) */
    let paySec = '';
    if (c.showPay) {
      const rows = c.payRows.map(r => `<tr>
          <td class="nm">${esc(r.label)}</td>
          <td>${r.date ? esc(fmtDate(r.date)) : '-'}</td>
          <td class="num">${comma(r.amount)}</td>
          <td class="note">${esc(r.note)}</td>
        </tr>`).join('');
      const balRow = `<tr>
          <td class="nm">잔 금</td><td>-</td>
          <td class="num" style="${c.balance <= 0 ? 'color:#1f7a4d' : 'color:var(--navy)'};font-weight:800">${c.balance <= 0 ? '완납' : comma(c.balance)}</td>
          <td class="note">${c.balance > 0 && b.invoice_note ? '' : ''}</td>
        </tr>`;
      paySec = `<div class="inv-sec">입금 내역 (Payment)</div>
        <div class="inv-scroll"><table class="inv-items">
          <colgroup><col style="width:26%"><col style="width:20%"><col style="width:26%"><col></colgroup>
          <thead><tr><th>구 분</th><th>입금일자</th><th>금액</th><th>비고</th></tr></thead>
          <tbody>${rows}${balRow}</tbody>
          <tfoot><tr><td colspan="2">합 계</td><td class="num">${comma(c.total)}</td><td></td></tr></tfoot>
        </table></div>`;
    }
    const dueNote = (b.invoice_note && String(b.invoice_note).trim()) ? `<div class="inv-due">${esc(b.invoice_note).replace(/\n/g, '<br>')}</div>` : '';

    /* 결제 안내 */
    const bankSec = bank.bank ? `<div class="inv-sec">결제 안내 (Bank Info)</div>
      <div class="inv-box" style="margin-bottom:18px"><table>
        <tr><th>은행명</th><td>${esc(bank.bank)}</td></tr>
        ${bank.acct ? `<tr><th>계좌번호</th><td>${esc(bank.acct)}</td></tr>` : ''}
        <tr><th>예금주</th><td>${esc(SELLER.name)}</td></tr>
      </table></div>` : '';

    /* 안내사항 · 취소 규정 */
    const noticeLines = String(t.notice || '').split('\n').map(s => s.trim()).filter(Boolean);
    const noticeSec = noticeLines.length ? `<div class="inv-sec">안내사항 (Notice)</div><div class="inv-notes">${noticeLines.map(l => `<p>${esc(l)}</p>`).join('')}</div>` : '';
    const presets = opts.cancelPresets || {};
    const cpRaw = (b.cancellation_policy && String(b.cancellation_policy).trim()) ? String(b.cancellation_policy) : '';
    const cancelSec = cpRaw ? `<div class="inv-sec">취소 및 환불 규정</div><div class="inv-notes">${cpRaw.split('\n').filter(l => l.trim()).map(l => presets[l.trim()] || `<p>${esc(l)}</p>`).join('')}</div>` : '';

    const base = opts.base || '';
    return `<div class="inv">
      <div class="inv-head">
        <div class="inv-brand"><img src="${base}images/logo-h.png?v=20260725i" alt="초이스골프" onerror="this.style.display='none'"><div><div class="co">${esc(SELLER.name)}</div><div class="en">${esc(SELLER.en)}</div></div></div>
        <div class="inv-title"><div class="t">INVOICE</div><div class="s">( 청 구 서 )</div></div>
      </div>
      <div class="inv-grid">
        <div class="inv-box"><h3>청구 정보 (Invoice Info)</h3>${boxTable(infoRows)}</div>
        <div class="inv-box"><h3>공급자 정보 (Provider)</h3>${boxTable(provRows)}</div>
      </div>
      <div class="inv-total${fullyPaid ? ' paid' : ''}"><div class="k">${fullyPaid ? '납부 완료' : '총 청구금액'}<small>${fullyPaid ? 'PAID IN FULL' : 'TOTAL AMOUNT DUE'}</small></div><div class="v"><i>₩</i>${comma(c.total)}</div></div>
      <div class="inv-sec">청구 내역 (Details)</div>
      ${itemsTbl}
      ${paySec}
      ${dueNote}
      ${bankSec}
      ${noticeSec}
      ${cancelSec}
      <div class="inv-foot">
        <div class="fl"><img src="${base}images/logo-h.png?v=20260725i" alt="" onerror="this.style.display='none'"></div>
        <div class="fr"><b>${esc(SELLER.name)}</b> · 사업자등록번호 ${esc(SELLER.bizno)} · ${esc(SELLER.tel)}<br>${esc(SELLER.address)}</div>
        <div class="inv-stamp"><img src="${base}images/INGAM.jpg" alt="인감" onerror="this.style.display='none'"></div>
      </div>
    </div>`;
  }

  /* 새 창용 전체 문서 (어드민 미리보기 · 견적서 안 청구서 열기) */
  function doc(b, opts){
    opts = opts || {};
    const base = opts.base != null ? opts.base : (function(){ try { return new URL('./', location.href).href; } catch (e) { return ''; } })();
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>청구서 · ${esc(b.rep_name || '')} · 초이스골프</title>
      <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Noto+Serif+KR:wght@600;700&family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>*{margin:0;padding:0}body{background:#eef0f4;padding:22px 12px 50px}.barwrap{max-width:820px;margin:0 auto 14px;display:flex;gap:8px;justify-content:flex-end}.pbtn{border:1px solid #ccd2db;border-radius:6px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}.pbtn.print{background:#1c3c70;color:#fff;border-color:#1c3c70}.pbtn.close{background:#fff;color:#1c3c70}@media print{body{background:#fff;padding:0}.barwrap{display:none}}${CSS}</style></head><body>
      <div class="barwrap"><button class="pbtn print" onclick="window.print()">인쇄 / PDF 저장</button><button class="pbtn close" onclick="window.close()">닫기</button></div>
      ${build(b, Object.assign({}, opts, { base }))}</body></html>`;
  }

  return { SELLER, isV2, calc, build, doc, css: CSS, parseBank };
})();
