/* ============================================================
   WBIntel · weather.js — Reads from CONFIG, fallback support
   ============================================================ */
const Weather = (() => {
  let _timer = null;
  async function fetchWeatherApi(city) {
    const key = CONFIG.apiKeys.weatherApi;
    if (!key) return null;
    return await safeFetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(city.query)}&aqi=yes`, `Wx:${city.name}`);
  }
  async function fetchOpenMeteo(city) {
    return await safeFetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&timezone=Asia/Kolkata`, `OWx:${city.name}`);
  }
  function renderCard(city, data) {
    if (!data) return `<div class="weather-card"><div class="wc-city">${esc(city.name)}</div><div class="wc-division">${esc(city.division)}</div><div class="fetch-error" style="padding:8px"><div class="fe-msg">No data</div><button class="fe-retry" onclick="WBIntel.Weather.refresh()">Retry</button></div></div>`;
    // WeatherAPI format
    if (data.current && data.current.temp_c !== undefined) {
      const c=data.current, aqi=c.air_quality, pm=aqi?Math.round(aqi.pm2_5||0):null;
      let aqiL='',aqiC=''; if(pm!==null){if(pm<=30){aqiL='Good';aqiC='#00e8b8'}else if(pm<=60){aqiL='Moderate';aqiC='#ffd060'}else if(pm<=90){aqiL='Poor';aqiC='#ff7b1a'}else{aqiL='Severe';aqiC='#ff3b5c'}}
      return `<div class="weather-card"><div class="wc-city">${esc(city.name)}</div><div class="wc-division">${esc(city.division)}</div><div class="wc-temp">${c.temp_c}°C</div><div class="wc-condition">${c.condition?c.condition.text:''}</div><div class="wc-details"><div class="wc-detail"><span>Feels like</span><span>${c.feelslike_c}°C</span></div><div class="wc-detail"><span>Humidity</span><span>${c.humidity}%</span></div><div class="wc-detail"><span>Wind</span><span>${c.wind_kph} kph ${c.wind_dir}</span></div><div class="wc-detail"><span>UV</span><span>${c.uv}</span></div>${pm!==null?`<div class="wc-detail"><span>AQI</span><span style="color:${aqiC}">${pm} · ${aqiL}</span></div>`:''}</div><div class="wc-updated">Updated ${istTimeShort()}</div></div>`;
    }
    // Open-Meteo format
    if (data.current && data.current.temperature_2m !== undefined) {
      const c=data.current;
      return `<div class="weather-card"><div class="wc-city">${esc(city.name)}</div><div class="wc-division">${esc(city.division)}</div><div class="wc-temp">${c.temperature_2m}°C</div><div class="wc-condition">Humidity: ${c.relative_humidity_2m}%</div><div class="wc-details"><div class="wc-detail"><span>Feels like</span><span>${c.apparent_temperature}°C</span></div><div class="wc-detail"><span>Wind</span><span>${c.wind_speed_10m} kph ${windDirection(c.wind_direction_10m||0)}</span></div></div><div class="wc-updated">Updated ${istTimeShort()} (Open-Meteo)</div></div>`;
    }
    return `<div class="weather-card"><div class="wc-city">${esc(city.name)}</div><div class="fe-msg">Parse error</div></div>`;
  }
  async function refresh() {
    const grid=document.getElementById('weatherGrid'); if(!grid)return;
    const useWeatherApi = !!CONFIG.apiKeys.weatherApi;
    const cities = useWeatherApi ? CONFIG.weather.cities : CONFIG.weather.fallbackCities;
    grid.innerHTML = cities.map(c=>`<div class="weather-card"><div class="wc-city">${esc(c.name)}</div><div class="loader" style="margin:10px auto"></div></div>`).join('');
    const results = await Promise.all(cities.map(c => useWeatherApi ? fetchWeatherApi(c) : fetchOpenMeteo(c)));
    grid.innerHTML = cities.map((c,i) => renderCard(c, results[i])).join('');
  }
  function init() { refresh(); if(_timer)clearInterval(_timer); _timer=setInterval(refresh, CONFIG.timers.weatherRefresh); }
  return { init, refresh };
})();
