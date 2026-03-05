/* ============================================================
   WBIntel v7.0 · app.js — Main orchestration
   ============================================================ */
const WBIntel = (() => {

  // --- 12-HOUR CLOCK + DATE ---
  function startClock() {
    function tick() {
      const now = new Date();
      document.getElementById('clockTime').textContent = istTime12(now);
      document.getElementById('clockDate').textContent = istDate(now);
    }
    tick();
    setInterval(tick, 1000);
  }

  // --- LIVE TV ---
  const TV = (() => {
    function render() {
      const channels = Settings.getTVChannels();
      const grid = document.getElementById('tvGrid');
      if (!grid) return;
      if (!channels || channels.length === 0) {
        grid.innerHTML = `<div class="onboard-card" style="grid-column:span 2">
          <p>No TV channels configured.</p><p class="onboard-hint">Open <strong>⚙ Settings</strong> to add channels</p></div>`;
        return;
      }
      grid.innerHTML = channels.slice(0, 4).map((ch, i) => `
        <div class="tv-cell" id="tvCell${i}" onclick="WBIntel.TV.loadStream(${i}, '${esc(ch.id)}')">
          <div class="tv-name">${esc(ch.name)}</div>
          <div class="tv-play">▶</div>
          <div class="tv-label">TAP TO LOAD LIVE</div>
        </div>
      `).join('');
    }

    function loadStream(idx, channelId) {
      const cell = document.getElementById(`tvCell${idx}`);
      if (!cell || cell.classList.contains('loaded')) return;
      cell.classList.add('loaded');
      // Use YouTube channel live embed
      cell.innerHTML = `<iframe
        src="https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"></iframe>`;
    }

    return { render, loadStream };
  })();

  // --- THEME TOGGLE ---
  function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    if (body.getAttribute('data-theme') === 'dark') {
      body.setAttribute('data-theme', 'day');
      btn.textContent = '☀️';
      localStorage.setItem('wbintel_theme', 'day');
    } else {
      body.setAttribute('data-theme', 'dark');
      btn.textContent = '🌙';
      localStorage.setItem('wbintel_theme', 'dark');
    }
  }

  function restoreTheme() {
    const saved = localStorage.getItem('wbintel_theme');
    if (saved === 'day') {
      document.body.setAttribute('data-theme', 'day');
      document.getElementById('themeToggle').textContent = '☀️';
    }
  }

  // --- SETTINGS PANEL ---
  function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      overlay.classList.remove('open');
    } else {
      Settings.renderUI();
      panel.classList.add('open');
      overlay.classList.add('open');
    }
  }

  // --- MODALS ---
  function showAbout() { document.getElementById('aboutModal').classList.add('open'); }
  function closeModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open')); }

  // --- STATUS ROTATION ---
  function startStatusRotation() {
    const el = document.getElementById('statusRotating');
    if (!el) return;
    const msgs = [
      'Monitoring all 23 districts of West Bengal in real time',
      'Everything. Everywhere. All at Once.',
      `${WBINTEL_CONFIG.feeds.length} RSS feeds · WeatherAPI · X Embeds · YouTube Live`,
      'Politics · Crime · Business · Tech · Logistics · Sports · Health',
      'Presidency · Burdwan · Jalpaiguri · Medinipur divisions covered',
      'Built for journalists, analysts, researchers & news enthusiasts',
      'All data fetched live — zero fake content',
    ];
    let i = 0;
    function rotate() {
      el.style.opacity = 0;
      setTimeout(() => { el.textContent = msgs[i++ % msgs.length]; el.style.opacity = 1; }, 250);
    }
    rotate();
    setInterval(rotate, 5000);
  }

  // --- KEYBOARD ---
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeModals();
        const p = document.getElementById('settingsPanel');
        if (p.classList.contains('open')) toggleSettings();
        Alerts.dismiss();
      }
    });
  }

  // --- INIT SOUND from settings ---
  function initSound() {
    Sound.setEnabled(Settings.getToggle('soundEnabled', true));
  }

  // --- MAIN INIT ---
  function init() {
    console.log('[WBIntel] v7.0 initializing…');
    restoreTheme();
    startClock();
    initSound();
    Resize.init();
    TV.render();
    Weather.init();

    // D3 map (wait for D3 to load)
    const waitD3 = setInterval(() => {
      if (typeof d3 !== 'undefined') { clearInterval(waitD3); WBMap.init(); }
    }, 200);
    setTimeout(() => clearInterval(waitD3), 15000);

    XFeed.init();
    Ticker.init();
    Feeds.init();
    startStatusRotation();
    initKeyboard();
    console.log('[WBIntel] All modules loaded.');
  }

  return {
    init, TV, Weather, Map: WBMap, Feeds, XFeed, Ticker, Alerts,
    toggleSettings, showAbout, closeModals, toggleTheme,
  };
})();

document.addEventListener('DOMContentLoaded', () => WBIntel.init());
