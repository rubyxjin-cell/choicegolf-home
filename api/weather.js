// api/weather.js
// 날씨 중계 — Open-Meteo가 일부 지역(한국 등) 접속을 차단해서, 서버가 대신 받아옴
// 사용: /api/weather?lat=..&lng=..&tz=..

export default async function handler(req, res) {
  try {
    const q = req.query || {};
    const lat = parseFloat(q.lat), lng = parseFloat(q.lng);
    const tz = String(q.tz || 'Asia/Seoul');
    if (isNaN(lat) || isNaN(lng)) { res.status(400).json({ error: 'bad coords' }); return; }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=${encodeURIComponent(tz)}&forecast_days=6`;

    const r = await fetch(url);
    if (!r.ok) { res.status(502).json({ error: 'weather upstream ' + r.status }); return; }
    const data = await r.json();

    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30분 캐시
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
