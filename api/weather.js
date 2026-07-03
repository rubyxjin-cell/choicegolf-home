// api/weather.js
// 날씨 중계 v2 — Open-Meteo가 막히면 노르웨이 기상청(met.no)으로 자동 대체
// 사용: /api/weather?lat=..&lng=..&tz=..

// met.no 날씨코드 → Open-Meteo(WMO) 코드 변환
function symbolToWmo(sym) {
  const s = String(sym || '').replace(/_(day|night|polartwilight)$/, '');
  const map = {
    clearsky: 0, fair: 1, partlycloudy: 2, cloudy: 3, fog: 45,
    lightrainshowers: 80, rainshowers: 80, heavyrainshowers: 81,
    lightrain: 61, rain: 63, heavyrain: 65,
    lightsleet: 61, sleet: 63, heavysleet: 65,
    lightsleetshowers: 80, sleetshowers: 80, heavysleetshowers: 81,
    lightsnow: 71, snow: 73, heavysnow: 75,
    lightsnowshowers: 71, snowshowers: 73, heavysnowshowers: 75,
    lightrainandthunder: 95, rainandthunder: 95, heavyrainandthunder: 95,
    lightrainshowersandthunder: 95, rainshowersandthunder: 95, heavyrainshowersandthunder: 95,
    snowandthunder: 95, sleetandthunder: 95,
  };
  return map[s] ?? 3;
}

// met.no 응답 → Open-Meteo와 같은 모양으로 변환
function convertMetNo(data, tz) {
  const ts = data?.properties?.timeseries || [];
  if (!ts.length) throw new Error('empty');
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const localDate = (iso) => fmt.format(new Date(iso));

  const first = ts[0];
  const cur = first.data?.instant?.details || {};
  const curSym = first.data?.next_1_hours?.summary?.symbol_code
    || first.data?.next_6_hours?.summary?.symbol_code || '';

  // 날짜별 집계 (6일)
  const days = {};
  for (const t of ts) {
    const d = localDate(t.time);
    const det = t.data?.instant?.details || {};
    if (!days[d]) days[d] = { max: -99, min: 99, prob: 0, sym: null };
    if (typeof det.air_temperature === 'number') {
      days[d].max = Math.max(days[d].max, det.air_temperature);
      days[d].min = Math.min(days[d].min, det.air_temperature);
    }
    const p6 = t.data?.next_6_hours;
    if (p6) {
      const pp = p6.details?.probability_of_precipitation;
      if (typeof pp === 'number') days[d].prob = Math.max(days[d].prob, pp);
      if (!days[d].sym && p6.summary?.symbol_code) days[d].sym = p6.summary.symbol_code;
    }
  }
  const dates = Object.keys(days).sort().slice(0, 6);
  return {
    current: {
      temperature_2m: cur.air_temperature ?? 0,
      weather_code: symbolToWmo(curSym),
      wind_speed_10m: cur.wind_speed ?? 0,
      relative_humidity_2m: cur.relative_humidity ?? 0,
      apparent_temperature: cur.air_temperature ?? 0,
    },
    daily: {
      time: dates,
      weather_code: dates.map(d => symbolToWmo(days[d].sym)),
      temperature_2m_max: dates.map(d => Math.round(days[d].max * 10) / 10),
      temperature_2m_min: dates.map(d => Math.round(days[d].min * 10) / 10),
      precipitation_probability_max: dates.map(d => Math.round(days[d].prob)),
    },
    source: 'met.no',
  };
}

export default async function handler(req, res) {
  try {
    const q = req.query || {};
    const lat = parseFloat(q.lat), lng = parseFloat(q.lng);
    const tz = String(q.tz || 'Asia/Seoul');
    if (isNaN(lat) || isNaN(lng)) { res.status(400).json({ error: 'bad coords' }); return; }

    // 1차: Open-Meteo
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&timezone=${encodeURIComponent(tz)}&forecast_days=6`;
      const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (r.ok) {
        const data = await r.json();
        res.setHeader('Cache-Control', 'public, max-age=1800');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);
        return;
      }
    } catch (e) { /* 아래 예비로 진행 */ }

    // 2차(예비): 노르웨이 기상청 met.no
    const url2 = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lng}`;
    const r2 = await fetch(url2, {
      headers: { 'User-Agent': 'choicegolf-weather/1.0 chctour.com' },
      signal: AbortSignal.timeout(6000),
    });
    if (!r2.ok) { res.status(502).json({ error: 'weather upstream ' + r2.status }); return; }
    const converted = convertMetNo(await r2.json(), tz);

    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(converted);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
