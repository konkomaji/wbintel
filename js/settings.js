/* ============================================================
   WBIntel v7.0 · settings.js — Simple settings panel
   ============================================================ */

const Settings = (() => {
  const KEY = 'wbintel_settings';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }

  function getXHandles() {
    const s = load();
    return s.xHandles || WBINTEL_CONFIG.xHandles;
  }

  function getXKeywords() {
    const s = load();
    return s.xKeywords || WBINTEL_CONFIG.xKeywords;
  }

  function getTVChannels() {
    const s = load();
    return s.tvChannels || WBINTEL_CONFIG.tvChannels;
  }

  function getToggle(key, defaultVal) {
    const s = load();
    return s[key] !== undefined ? s[key] : defaultVal;
  }

  function setToggle(key, val) {
    const s = load();
    s[key] = val;
    save(s);
  }

  function getColumnWidths() {
    const s = load();
    return s.columnWidths || [26, 38, 36];
  }

  function setColumnWidths(widths) {
    const s = load();
    s.columnWidths = widths;
    save(s);
  }

  // --- RENDER UI ---
  function renderUI() {
    const body = document.getElementById('settingsBody');
    if (!body) return;
    const handles = getXHandles();
    const keywords = getXKeywords();
    const channels = getTVChannels();

    body.innerHTML = `
      <!-- X HANDLES -->
      <div class="cfg-section">
        <div class="cfg-section-title">𝕏 X (Twitter) Handles</div>
        <div class="cfg-list" id="sXHandles">
          ${handles.map((h, i) => `
            <div class="cfg-list-item">
              <span>@${esc(h)}</span>
              <button class="remove-btn" onclick="Settings.removeHandle(${i})">✕</button>
            </div>
          `).join('')}
        </div>
        <div class="cfg-row">
          <input class="cfg-input" id="sNewHandle" placeholder="Handle (no @)">
          <button class="cfg-btn" onclick="Settings.addHandle()">+ Add</button>
        </div>
        <button class="cfg-btn cfg-btn-primary" style="margin-top:6px;width:100%" onclick="Settings.applyX()">Apply & Reload X Feeds</button>
      </div>

      <!-- X KEYWORDS -->
      <div class="cfg-section">
        <div class="cfg-section-title"># X Keywords & Hashtags</div>
        <textarea class="cfg-textarea" id="sXKeywords" placeholder="One per line">${esc(keywords.join('\n'))}</textarea>
        <button class="cfg-btn cfg-btn-primary" style="margin-top:6px;width:100%" onclick="Settings.applyXKeywords()">Apply Keywords</button>
      </div>

      <!-- TV CHANNELS -->
      <div class="cfg-section">
        <div class="cfg-section-title">📺 YouTube Live Channels</div>
        <div class="cfg-list" id="sTVChannels">
          ${channels.map((ch, i) => `
            <div class="cfg-list-item">
              <span style="flex:1">${esc(ch.name)}</span>
              <span style="font-size:8px;color:var(--t3)">${esc(ch.id).substring(0,12)}…</span>
              <button class="remove-btn" onclick="Settings.removeTVChannel(${i})">✕</button>
            </div>
          `).join('')}
        </div>
        <div class="cfg-row">
          <input class="cfg-input" id="sNewTVName" placeholder="Channel name">
          <input class="cfg-input" id="sNewTVId" placeholder="YouTube Channel ID">
          <button class="cfg-btn" onclick="Settings.addTVChannel()">+</button>
        </div>
        <button class="cfg-btn cfg-btn-primary" style="margin-top:6px;width:100%" onclick="Settings.applyTV()">Apply & Reload TV</button>
      </div>

      <!-- TOGGLES -->
      <div class="cfg-section">
        <div class="cfg-section-title">⚙ Preferences</div>
        <div class="cfg-toggle">
          <input type="checkbox" id="sSoundEnabled" ${getToggle('soundEnabled', true) ? 'checked' : ''} onchange="Settings.toggleSound()">
          <label for="sSoundEnabled">Enable sound effects</label>
        </div>
        <div class="cfg-toggle">
          <input type="checkbox" id="sBreakingAlerts" ${getToggle('breakingAlerts', true) ? 'checked' : ''} onchange="Settings.toggleBreaking()">
          <label for="sBreakingAlerts">Breaking news popup alerts</label>
        </div>
        <div class="cfg-toggle">
          <input type="checkbox" id="sMapPings" ${getToggle('mapPings', true) ? 'checked' : ''} onchange="Settings.toggleMapPings()">
          <label for="sMapPings">Map district ping animation</label>
        </div>
        <div class="cfg-toggle">
          <input type="checkbox" id="sWBFilter" ${getToggle('wbFilter', true) ? 'checked' : ''} onchange="Settings.toggleWBFilter()">
          <label for="sWBFilter">Show only WB-relevant news</label>
        </div>
      </div>

      <!-- RESET -->
      <div class="cfg-section">
        <div class="cfg-section-title">🔄 Reset</div>
        <button class="cfg-btn" style="width:100%;color:var(--red);border-color:rgba(255,60,90,0.3)" onclick="Settings.resetAll()">Reset All Settings to Defaults</button>
        <div class="cfg-note" style="margin-top:6px">This only resets your customizations. RSS feeds and API keys are built-in.</div>
      </div>
    `;
  }

  // --- HANDLE ACTIONS ---
  function addHandle() {
    const input = document.getElementById('sNewHandle');
    const h = (input.value || '').replace(/^@/, '').trim();
    if (!h) return;
    const handles = getXHandles();
    handles.push(h);
    const s = load(); s.xHandles = handles; save(s);
    input.value = '';
    renderUI();
  }

  function removeHandle(idx) {
    const handles = getXHandles();
    handles.splice(idx, 1);
    const s = load(); s.xHandles = handles; save(s);
    renderUI();
  }

  function applyX() {
    if (window.WBIntel && WBIntel.XFeed) WBIntel.XFeed.reloadProfiles();
  }

  function applyXKeywords() {
    const val = document.getElementById('sXKeywords').value;
    const keywords = val.split('\n').map(s => s.trim()).filter(Boolean);
    const s = load(); s.xKeywords = keywords; save(s);
    if (window.WBIntel && WBIntel.XFeed) WBIntel.XFeed.reloadKeywords();
  }

  function addTVChannel() {
    const name = document.getElementById('sNewTVName').value.trim();
    const id = document.getElementById('sNewTVId').value.trim();
    if (!name || !id) return;
    const channels = getTVChannels();
    channels.push({ name, id });
    const s = load(); s.tvChannels = channels; save(s);
    renderUI();
  }

  function removeTVChannel(idx) {
    const channels = getTVChannels();
    channels.splice(idx, 1);
    const s = load(); s.tvChannels = channels; save(s);
    renderUI();
  }

  function applyTV() {
    if (window.WBIntel && WBIntel.TV) WBIntel.TV.render();
  }

  function toggleSound() {
    const v = document.getElementById('sSoundEnabled').checked;
    setToggle('soundEnabled', v);
    Sound.setEnabled(v);
  }

  function toggleBreaking() { setToggle('breakingAlerts', document.getElementById('sBreakingAlerts').checked); }
  function toggleMapPings() { setToggle('mapPings', document.getElementById('sMapPings').checked); }
  function toggleWBFilter() { setToggle('wbFilter', document.getElementById('sWBFilter').checked); }

  function resetAll() {
    if (!confirm('Reset all settings to defaults?')) return;
    localStorage.removeItem(KEY);
    renderUI();
    location.reload();
  }

  return {
    load, save, getXHandles, getXKeywords, getTVChannels,
    getToggle, setToggle, getColumnWidths, setColumnWidths,
    renderUI, addHandle, removeHandle, applyX, applyXKeywords,
    addTVChannel, removeTVChannel, applyTV,
    toggleSound, toggleBreaking, toggleMapPings, toggleWBFilter, resetAll,
  };
})();
