/* ============================================================
   WBIntel · config.js — Configuration panel & localStorage
   ============================================================ */

const Config = (() => {
  const STORAGE_KEY = 'wbintel_config';

  // --- DEFAULT CONFIGURATION ---
  const DEFAULTS = {
    // RSS Feeds
    feeds: [
      { url: 'https://scroll.in/rss', label: 'Scroll.in', category: 'politics', active: true, interval: 5 },
      { url: 'https://thewire.in/rss', label: 'The Wire', category: 'politics', active: true, interval: 5 },
      { url: 'https://theprint.in/feed', label: 'The Print', category: 'politics', active: true, interval: 5 },
      { url: 'https://livelaw.in/feed', label: 'LiveLaw', category: 'politics', active: true, interval: 10 },
      { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', label: 'Economic Times', category: 'business', active: true, interval: 5 },
      { url: 'https://www.business-standard.com/rss/latest.rss', label: 'Business Standard', category: 'business', active: true, interval: 10 },
      { url: 'https://www.livemint.com/rss/news', label: 'Mint', category: 'business', active: true, interval: 10 },
      { url: 'https://inc42.com/feed/', label: 'Inc42', category: 'tech', active: true, interval: 15 },
      { url: 'https://yourstory.com/feed', label: 'YourStory', category: 'tech', active: true, interval: 15 },
      { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3', label: 'PIB Kolkata', category: 'govt', active: true, interval: 10 },
    ],

    // Twitter handles
    twitterHandles: ['WBPolice', 'mamataofficial', 'BJP4Bengal', 'AITCofficial', 'ABPAnandaTV'],

    // Twitter keywords
    twitterKeywords: ['#WestBengal', '#Kolkata', '#WBPolice', '#TMC4Bengal', '#BJP4Bengal', '#কলকাতা', 'Mamata Banerjee'],

    // Weather cities
    weatherCities: [
      { name: 'Kolkata',  lat: 22.5726, lon: 88.3639 },
      { name: 'Siliguri', lat: 26.7271, lon: 88.3953 },
      { name: 'Asansol',  lat: 23.6833, lon: 86.9833 },
      { name: 'Durgapur', lat: 23.5204, lon: 87.3119 },
    ],

    // TV channels
    tvChannels: [
      { name: 'ABP Ananda', channelId: 'UC1Mv_ZJjg7xqGFdLFuodAAA', active: true },
      { name: 'Zee 24 Ghanta', channelId: 'UCmDJGMDMiP-iF3bdNfYQgag', active: true },
      { name: 'News18 Bangla', channelId: 'UCmErZfbMaO71dFMFwJDfJmA', active: true },
      { name: 'Republic Bangla', channelId: 'UCaIoVYtOV2kVLjGbyMfGYig', active: true },
      { name: 'Kolkata TV', channelId: 'UCnACFGgbNv_1aYoXjGB5bhQ', active: false },
      { name: 'DD Bangla', channelId: 'UC8GFreeUJU06_LofbI7DJLA', active: false },
      { name: 'Sangbad Pratidin', channelId: 'UCVj_5M5MPHrz9y2DpQcVwuA', active: false },
      { name: 'NDTV India', channelId: 'UCt1BIb6OeSMmhOEFwNIcPIA', active: false },
    ],

    // Telegram channels (for hyperlocal)
    telegramChannels: [],

    // API keys (optional)
    newsApiKey: '',
    rss2jsonKey: '',
    alphaVantageKey: '',

    // Layout
    columnWidths: [28, 36, 36], // percentages

    // Settings
    settings: {
      autoRefreshRSS: true,
      wbKeywordFilter: true,
      mapDistrictPing: true,
      soundAlerts: false,
    },

    // Collapsed panels
    collapsedPanels: {},

    // Global keyword filter (extra, user-added)
    globalKeywords: '',
  };

  let _config = null;

  // --- LOAD ---
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        _config = { ...DEFAULTS, ...JSON.parse(raw) };
        // Merge nested objects
        _config.settings = { ...DEFAULTS.settings, ...(_config.settings || {}) };
      } else {
        _config = JSON.parse(JSON.stringify(DEFAULTS));
      }
    } catch (e) {
      console.warn('[Config] Load error, using defaults:', e);
      _config = JSON.parse(JSON.stringify(DEFAULTS));
    }
    return _config;
  }

  // --- SAVE ---
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
    } catch (e) {
      console.warn('[Config] Save error:', e);
    }
  }

  // --- GET ---
  function get() {
    if (!_config) load();
    return _config;
  }

  // --- UPDATE ---
  function update(key, value) {
    if (!_config) load();
    _config[key] = value;
    save();
  }

  // --- RENDER CONFIG PANEL UI ---
  function renderConfigUI() {
    const cfg = get();
    const body = document.getElementById('configBody');
    if (!body) return;

    body.innerHTML = `
      <!-- TWITTER SECTION -->
      <div class="cfg-section">
        <div class="cfg-section-title">🐦 Twitter / X</div>
        <div class="cfg-label" style="margin-bottom:4px">Profile Handles</div>
        <div class="cfg-list" id="cfgTwitterHandles">
          ${cfg.twitterHandles.map((h, i) => `
            <div class="cfg-list-item">
              <span>@${esc(h)}</span>
              <button class="remove-btn" onclick="Config.removeHandle(${i})">✕</button>
            </div>
          `).join('')}
        </div>
        <div class="cfg-row">
          <input class="cfg-input" id="cfgNewHandle" placeholder="e.g. WBPolice (no @)">
          <button class="cfg-btn" onclick="Config.addHandle()">+ Add</button>
        </div>
        <div class="cfg-label" style="margin-top:10px;margin-bottom:4px">Keywords & Hashtags</div>
        <textarea class="cfg-textarea" id="cfgTwitterKw" placeholder="One per line: #WestBengal&#10;#Kolkata&#10;Mamata Banerjee">${esc(cfg.twitterKeywords.join('\n'))}</textarea>
        <div class="cfg-row" style="margin-top:4px">
          <button class="cfg-btn cfg-btn-primary" onclick="Config.saveTwitter()">Save & Reload Twitter</button>
        </div>
      </div>

      <!-- RSS FEEDS SECTION -->
      <div class="cfg-section">
        <div class="cfg-section-title">📡 RSS Feeds</div>
        <div class="cfg-list" id="cfgFeedList">
          ${cfg.feeds.map((f, i) => `
            <div class="cfg-list-item" style="flex-wrap:wrap">
              <span style="flex:1;min-width:100px">${esc(f.label)}</span>
              <span style="font-size:8px;color:var(--t3)">${esc(f.category)}</span>
              <span style="font-size:8px;color:${f.active ? 'var(--grn)' : 'var(--red)'}">${f.active ? 'ON' : 'OFF'}</span>
              <button class="remove-btn" onclick="Config.toggleFeed(${i})">${f.active ? '⏸' : '▶'}</button>
              <button class="remove-btn" onclick="Config.removeFeed(${i})">✕</button>
            </div>
          `).join('')}
        </div>
        <div class="cfg-row">
          <input class="cfg-input" id="cfgNewFeedUrl" placeholder="RSS URL" style="flex:2">
          <input class="cfg-input" id="cfgNewFeedLabel" placeholder="Label" style="flex:1">
        </div>
        <div class="cfg-row">
          <select class="cfg-input" id="cfgNewFeedCat" style="flex:1">
            ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
          <button class="cfg-btn" onclick="Config.addFeed()">+ Add Feed</button>
        </div>
      </div>

      <!-- WEATHER SECTION -->
      <div class="cfg-section">
        <div class="cfg-section-title">🌤 Weather Cities</div>
        ${cfg.weatherCities.map((c, i) => `
          <div class="cfg-row">
            <input class="cfg-input" id="cfgWxName${i}" value="${esc(c.name)}" placeholder="City" style="flex:1">
            <input class="cfg-input" id="cfgWxLat${i}" value="${c.lat}" placeholder="Lat" style="width:70px">
            <input class="cfg-input" id="cfgWxLon${i}" value="${c.lon}" placeholder="Lon" style="width:70px">
          </div>
        `).join('')}
        <div class="cfg-row" style="margin-top:4px">
          <button class="cfg-btn cfg-btn-primary" onclick="Config.saveWeather()">Save & Refresh Weather</button>
          <button class="cfg-btn" onclick="Config.resetWeather()">Reset Defaults</button>
        </div>
      </div>

      <!-- TV CHANNELS SECTION -->
      <div class="cfg-section">
        <div class="cfg-section-title">📺 TV Channels</div>
        <div class="cfg-list" id="cfgTVList">
          ${cfg.tvChannels.map((ch, i) => `
            <div class="cfg-list-item">
              <span style="flex:1">${esc(ch.name)}</span>
              <span style="font-size:8px;color:var(--t3)">${esc(ch.channelId).substring(0, 10)}…</span>
              <button class="remove-btn" onclick="Config.removeTVChannel(${i})">✕</button>
            </div>
          `).join('')}
        </div>
        <div class="cfg-row">
          <input class="cfg-input" id="cfgNewTVName" placeholder="Channel name">
          <input class="cfg-input" id="cfgNewTVId" placeholder="YouTube Channel ID">
          <button class="cfg-btn" onclick="Config.addTVChannel()">+ Add</button>
        </div>
      </div>

      <!-- API KEYS SECTION -->
      <div class="cfg-section">
        <div class="cfg-section-title">🔑 API Keys (Optional)</div>
        <div class="cfg-row">
          <span class="cfg-label">NewsAPI</span>
          <input class="cfg-input" id="cfgNewsApiKey" type="password" value="${esc(cfg.newsApiKey)}" placeholder="Your NewsAPI.org key">
        </div>
        <div class="cfg-row">
          <span class="cfg-label">RSS2JSON</span>
          <input class="cfg-input" id="cfgRss2JsonKey" type="password" value="${esc(cfg.rss2jsonKey)}" placeholder="Optional — boosts rate limit">
        </div>
        <div class="cfg-row" style="margin-top:4px">
          <button class="cfg-btn cfg-btn-primary" onclick="Config.saveApiKeys()">Save Keys</button>
        </div>
        <div class="cfg-note">Keys are stored locally in your browser. Never shared.</div>
      </div>

      <!-- SETTINGS SECTION -->
      <div class="cfg-section">
        <div class="cfg-section-title">⚙ Settings</div>
        <div class="cfg-toggle">
          <input type="checkbox" id="cfgAutoRefresh" ${cfg.settings.autoRefreshRSS ? 'checked' : ''} onchange="Config.toggleSetting('autoRefreshRSS')">
          <label for="cfgAutoRefresh">Auto-refresh RSS feeds</label>
        </div>
        <div class="cfg-toggle">
          <input type="checkbox" id="cfgWBFilter" ${cfg.settings.wbKeywordFilter ? 'checked' : ''} onchange="Config.toggleSetting('wbKeywordFilter')">
          <label for="cfgWBFilter">WB keyword filter (show only WB-relevant)</label>
        </div>
        <div class="cfg-toggle">
          <input type="checkbox" id="cfgMapPing" ${cfg.settings.mapDistrictPing ? 'checked' : ''} onchange="Config.toggleSetting('mapDistrictPing')">
          <label for="cfgMapPing">Map district ping on news</label>
        </div>
        <div class="cfg-toggle">
          <input type="checkbox" id="cfgSound" ${cfg.settings.soundAlerts ? 'checked' : ''} onchange="Config.toggleSetting('soundAlerts')">
          <label for="cfgSound">Sound on critical alerts</label>
        </div>
      </div>

      <!-- IMPORT/EXPORT -->
      <div class="cfg-section">
        <div class="cfg-section-title">💾 Import / Export</div>
        <div class="cfg-row">
          <button class="cfg-btn" onclick="Config.exportConfig()">📤 Export Config</button>
          <button class="cfg-btn" onclick="document.getElementById('cfgImportFile').click()">📥 Import Config</button>
          <input type="file" id="cfgImportFile" accept=".json" style="display:none" onchange="Config.importConfig(event)">
        </div>
        <div class="cfg-row" style="margin-top:8px">
          <button class="cfg-btn cfg-btn-danger" onclick="Config.resetAll()">🗑 Reset All to Defaults</button>
        </div>
      </div>
    `;
  }

  // --- ACTION HANDLERS ---
  function addHandle() {
    const input = document.getElementById('cfgNewHandle');
    const handle = (input.value || '').replace(/^@/, '').trim();
    if (!handle) return;
    _config.twitterHandles.push(handle);
    save();
    input.value = '';
    renderConfigUI();
  }

  function removeHandle(idx) {
    _config.twitterHandles.splice(idx, 1);
    save();
    renderConfigUI();
  }

  function saveTwitter() {
    const kw = document.getElementById('cfgTwitterKw');
    _config.twitterKeywords = kw.value.split('\n').map(s => s.trim()).filter(Boolean);
    save();
    renderConfigUI();
    if (window.WBIntel && WBIntel.Twitter) {
      WBIntel.Twitter.reloadProfiles();
      WBIntel.Twitter.reloadKeywords();
    }
  }

  function addFeed() {
    const url = document.getElementById('cfgNewFeedUrl').value.trim();
    const label = document.getElementById('cfgNewFeedLabel').value.trim();
    const category = document.getElementById('cfgNewFeedCat').value;
    if (!url) return;
    _config.feeds.push({ url, label: label || url, category, active: true, interval: 5 });
    save();
    renderConfigUI();
  }

  function removeFeed(idx) {
    _config.feeds.splice(idx, 1);
    save();
    renderConfigUI();
  }

  function toggleFeed(idx) {
    _config.feeds[idx].active = !_config.feeds[idx].active;
    save();
    renderConfigUI();
  }

  function saveWeather() {
    for (let i = 0; i < 4; i++) {
      _config.weatherCities[i] = {
        name: document.getElementById(`cfgWxName${i}`).value.trim() || `City ${i+1}`,
        lat: parseFloat(document.getElementById(`cfgWxLat${i}`).value) || 0,
        lon: parseFloat(document.getElementById(`cfgWxLon${i}`).value) || 0,
      };
    }
    save();
    if (window.WBIntel && WBIntel.Weather) WBIntel.Weather.refresh();
  }

  function resetWeather() {
    _config.weatherCities = JSON.parse(JSON.stringify(DEFAULTS.weatherCities));
    save();
    renderConfigUI();
    if (window.WBIntel && WBIntel.Weather) WBIntel.Weather.refresh();
  }

  function addTVChannel() {
    const name = document.getElementById('cfgNewTVName').value.trim();
    const channelId = document.getElementById('cfgNewTVId').value.trim();
    if (!name || !channelId) return;
    _config.tvChannels.push({ name, channelId, active: true });
    save();
    renderConfigUI();
    if (window.WBIntel && WBIntel.TV) WBIntel.TV.render();
  }

  function removeTVChannel(idx) {
    _config.tvChannels.splice(idx, 1);
    save();
    renderConfigUI();
  }

  function saveApiKeys() {
    _config.newsApiKey = document.getElementById('cfgNewsApiKey').value.trim();
    _config.rss2jsonKey = document.getElementById('cfgRss2JsonKey').value.trim();
    save();
  }

  function toggleSetting(key) {
    _config.settings[key] = !_config.settings[key];
    save();
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify(_config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wbintel_config.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importConfig(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        _config = { ...DEFAULTS, ...imported };
        save();
        renderConfigUI();
        location.reload();
      } catch (err) {
        alert('Invalid config file');
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    _config = JSON.parse(JSON.stringify(DEFAULTS));
    save();
    location.reload();
  }

  return {
    load, save, get, update, renderConfigUI,
    addHandle, removeHandle, saveTwitter,
    addFeed, removeFeed, toggleFeed,
    saveWeather, resetWeather,
    addTVChannel, removeTVChannel,
    saveApiKeys, toggleSetting,
    exportConfig, importConfig, resetAll,
  };
})();
