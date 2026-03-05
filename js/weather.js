/* ============================================================
   WBIntel v7.0 · weather.js — WeatherAPI.com live weather
   ============================================================ */
const Weather = (() => {
  let _timer = null;

  async function fetchCity(city) {
    const key = WBINTEL_CONFIG.weatherApiKey;
    const url = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(city.q)}&aqi=yes`;
    return await safeFetch(url, `Weather:${city.name}`);
  }

  function renderCard(city, data) {
    if (!data || !data.current) {
      return `<div class="weather-card">
        <div class="wc-city">${esc(city.name)}</div>
        <div class="wc-division">${esc(city.division)}</div>
        <div class="fetch-error" style="padding:10px">
          <div class="fe-msg">No data</div>
          <button class="fe-retry" onclick="WBIntel.Weather.refresh()">Retry</button>
        </div>
      </div>`;
    }
    const c = data.current;
    const aqi = c.air_quality;
    const aqiVal = aqi ? Math.round(aqi.pm2_5 || 0) : null;
    let aqiLabel = '', aqiColor = '';
    if (aqiVal !== null) {
      if (aqiVal <= 30) { aqiLabel = 'Good'; aqiColor = '#00e8b8'; }
      else if (aqiVal <= 60) { aqiLabel = 'Moderate'; aqiColor = '#ffd060'; }
      else if (aqiVal <= 90) { aqiLabel = 'Poor'; aqiColor = '#ff7b1a'; }
      else { aqiLabel = 'Severe'; aqiColor = '#ff3b5c'; }
    }

    return `<div class="weather-card">
      <div class="wc-city">${esc(city.name)}</div>
      <div class="wc-division">${esc(city.division)}</div>
      <div class="wc-temp">${c.temp_c}°C</div>
      <div class="wc-condition">${c.condition ? c.condition.text : ''}</div>
      <div class="wc-details">
        <div class="wc-detail"><span>Feels like</span><span>${c.feelslike_c}°C</span></div>
        <div class="wc-detail"><span>Humidity</span><span>${c.humidity}%</span></div>
        <div class="wc-detail"><span>Wind</span><span>${c.wind_kph} kph ${c.wind_dir}</span></div>
        <div class="wc-detail"><span>UV Index</span><span>${c.uv}</span></div>
        ${aqiVal !== null ? `<div class="wc-detail"><span>AQI (PM2.5)</span><span style="color:${aqiColor}">${aqiVal} · ${aqiLabel}</span></div>` : ''}
      </div>
      <div class="wc-updated">Updated ${istTimeShort()}</div>
    </div>`;
  }

  async function refresh() {
    const grid = document.getElementById('weatherGrid');
    if (!grid) return;
    const cities = WBINTEL_CONFIG.weatherCities;
    grid.innerHTML = cities.map(c =>
      `<div class="weather-card"><div class="wc-city">${esc(c.name)}</div><div class="loader" style="margin:10px auto"></div></div>`
    ).join('');
    const results = await Promise.all(cities.map(c => fetchCity(c)));
    grid.innerHTML = cities.map((c, i) => renderCard(c, results[i])).join('');
  }

  function init() {
    refresh();
    if (_timer) clearInterval(_timer);
    _timer = setInterval(refresh, 20 * 60 * 1000); // 20 min
  }

  return { init, refresh };
})();
