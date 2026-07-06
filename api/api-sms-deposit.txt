// /api/sms-deposit.js
// 💰 휴대폰 SMS 자동전달 → 입금 문자 파싱 → Supabase bank_sms 저장
// 지원 형식: 신한은행, 하나은행 입출금 알림 문자

const SUPABASE_URL = 'https://qmzrpyyadoajwziqachm.supabase.co';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const SECRET = process.env.SMS_SECRET;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SECRET || !SERVICE_KEY) return res.status(500).json({ error: '환경변수(SMS_SECRET, SUPABASE_SERVICE_KEY)가 설정되지 않았습니다' });

  const body = req.body || {};
  // SMS Forwarder 앱마다 필드명이 다를 수 있어 여러 이름 허용
  const secret = body.secret || body.key || req.query.secret;
  const text = String(body.message || body.text || body.msg || body.body || '');

  if (secret !== SECRET) return res.status(401).json({ error: 'unauthorized' });
  if (!text.trim()) return res.status(200).json({ ok: true, skipped: 'empty' });

  const parsed = parseSms(text);
  if (!parsed) return res.status(200).json({ ok: true, skipped: 'not-bank-sms' });

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/bank_sms`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ ...parsed, raw: text })
    });
    if (!r.ok) throw new Error('DB 저장 실패 (' + r.status + ') ' + (await r.text()).slice(0, 200));
    return res.status(200).json({ ok: true, saved: parsed });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// ── 문자 파싱 ──
function parseSms(text) {
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);

  // 은행 판별
  let bank = null;
  if (/신한/.test(text)) bank = 'shinhan';
  else if (/하나/.test(text)) bank = 'hana';
  if (!bank) return null;

  // 입금/출금 판별
  const direction = /입금/.test(text) ? 'in' : (/출금/.test(text) ? 'out' : null);
  if (!direction) return null;

  // 금액 / 잔액
  const amtM = text.match(/(?:입금|출금)\s*([\d,]+)/);
  const balM = text.match(/잔액\s*([\d,]+)/);
  const amount = amtM ? Number(amtM[1].replace(/,/g, '')) : null;
  const balance = balM ? Number(balM[1].replace(/,/g, '')) : null;
  if (!amount) return null;

  // 날짜/시간 → 올해 기준, 한국시간
  let smsAt = null;
  const dtM = text.match(/(\d{2})\/(\d{2})[,\s]+(\d{2}):(\d{2})/);
  if (dtM) {
    const y = new Date().getFullYear();
    smsAt = `${y}-${dtM[1]}-${dtM[2]}T${dtM[3]}:${dtM[4]}:00+09:00`;
  }

  // 입금자명
  let depositor = '';
  const amtIdx = lines.findIndex(l => /(?:입금|출금)\s*[\d,]+/.test(l));
  const balIdx = lines.findIndex(l => /잔액\s*[\d,]+/.test(l));
  if (bank === 'hana') {
    // 하나: 입금600,000원 다음 줄이 이름
    if (amtIdx >= 0 && lines[amtIdx + 1] && !/잔액/.test(lines[amtIdx + 1])) depositor = lines[amtIdx + 1];
  } else {
    // 신한: 잔액 줄 다음 줄이 이름
    if (balIdx >= 0 && lines[balIdx + 1]) depositor = lines[balIdx + 1];
  }
  depositor = depositor.replace(/원$/, '').trim();

  return { bank, direction, amount, balance, depositor, sms_at: smsAt };
}
