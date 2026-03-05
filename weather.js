/* ============================================================
   WBIntel · weather.js — Open-Meteo weather for 4 WB cities
   ============================================================ */

const Weather = (() => {
  let _refreshTimer = null;

  async function fetchCity(city) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata&forecast_days=1`;
    return await safeFetch(url, `Weather:${city.name}`);
  }

  function renderCard(city, data) {
    if (!data || !data.current) {
      return `
        <div class="weather-card">
          <div class="wc-city">${esc(city.name)}</div>
          <div class="fetch-error" style="padding:8px">
            <div class="fe-icon" style="font-size:14px">⚠</div>
            <div class="fe-msg" style="font-size:9px">No data</div>
            <button class="fe-retry" onclick="WBIntel.Weather.refresh()">Retry</button>
          </div>
        </div>`;
    }
    const c = data.current;
    const d = data.daily || {};
    const wmo = WMO_CODES[c.weather_code] || { desc: 'Unknown', emoji: '❓' };
    const wind = `${c.wind_speed_10m || 0} km/h ${windDirection(c.wind_direction_10m || 0)}`;
    const hi = d.temperature_2m_max ? d.temperature_2m_max[0] : '--';
    const lo = d.temperature_2m_min ? d.temperature_2m_min[0] : '--';

    return `
      <div class="weather-card">
        <div class="wc-city">${esc(city.name)}</div>
        <div class="wc-temp">${wmo.emoji} ${c.temperature_2m}°C</div>
        <div class="wc-condition">${wmo.desc}</div>
        <div class="wc-details">
          <div class="wc-detail"><span>Feels like</span><span>${c.apparent_temperature}°C</span></div>
          <div class="wc-detail"><span>Humidity</span><span>${c.relative_humidity_2m}%</span></div>
          <div class="wc-detail"><span>Wind</span><span>${wind}</span></div>
          <div class="wc-detail"><span>Hi / Lo</span><span>${hi}° / ${lo}°</span></div>
          ${c.precipitation > 0 ? `<div class="wc-detail"><span>Precip</span><span>${c.precipitation} mm</span></div>` : ''}
        </div>
        <div class="wc-updated">Updated ${istTimeShort()}</div>
      </div>`;
  }

  async function refresh() {
    const cfg = Config.get();
    const grid = document.getElementById('weatherGrid');
    if (!grid) return;

    grid.innerHTML = cfg.weatherCities.map(c =>
      `<div class="weather-card"><div class="wc-city">${esc(c.name)}</div><div class="loader" style="margin:10px auto"></div></div>`
    ).join('');

    const results = await Promise.all(cfg.weatherCities.map(c => fetchCity(c)));
    grid.innerHTML = cfg.weatherCities.map((c, i) => renderCard(c, results[i])).join('');
  }

  function startAutoRefresh() {
    if (_refreshTimer) clearInterval(_refreshTimer);
    _refreshTimer = setInterval(refresh, 30 * 60 * 1000); // 30 min
  }

  function init() {
    refresh();
    startAutoRefresh();
  }

  return { init, refresh };
})();
