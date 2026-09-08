/* 수배서 메일 발송 — AGT 포털 [수배서 메일 발송] 버튼이 호출
   Vercel 서버리스 함수 (프로젝트 루트 = sunrise/). Resend API 사용.
   환경변수: RESEND_API_KEY (필수), RESEND_FROM (선택, 예: "Choice Golf <booking@sunskygolf.com>")
   요청: POST JSON { to, cc, subject, html, attachment:{ filename, content(base64) } } */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: 'RESEND_API_KEY가 Vercel 환경변수에 없습니다.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || !body.to || !body.subject) return res.status(400).json({ error: 'to, subject 필요' });
  const payload = {
    from: process.env.RESEND_FROM || 'Choice Golf <onboarding@resend.dev>',
    to: String(body.to).split(/[,;\s]+/).filter(Boolean),
    subject: String(body.subject),
    html: String(body.html || '')
  };
  if (body.cc) payload.cc = String(body.cc).split(/[,;\s]+/).filter(Boolean);
  if (body.attachment && body.attachment.content) {
    payload.attachments = [{ filename: body.attachment.filename || 'booking.xls', content: body.attachment.content }];
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: (j && (j.message || j.error)) || ('Resend ' + r.status), detail: j });
    return res.status(200).json({ ok: true, id: j.id || null });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
};
