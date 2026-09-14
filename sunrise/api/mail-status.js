/* 수배서 메일 수신 확인 — Resend 이메일 상태 조회
   AGT 포털 투어 상세의 "수배서 발송" 표시가 호출 (마스터만). 프로젝트 루트 = sunrise/.
   요청: GET /api/mail-status?id=<resend email id>
   응답: { ok:true, event:'delivered'|'opened'|'clicked'|'bounced'|'sent'|..., at:'ISO' }
   ※ 열람(opened)은 Resend 대시보드 › Domains › sunskygolf.com › Open tracking 을 켜야 잡힘 */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: 'RESEND_API_KEY가 Vercel 환경변수에 없습니다.' });
  const id = String((req.query && req.query.id) || '').trim();
  if (!/^[A-Za-z0-9-]{8,80}$/.test(id)) return res.status(400).json({ error: 'id 필요' });
  try {
    const r = await fetch('https://api.resend.com/emails/' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + key } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: (j && (j.message || j.error)) || ('Resend ' + r.status) });
    return res.status(200).json({ ok: true, event: j.last_event || 'sent', at: j.created_at || null, to: j.to || null });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
};
