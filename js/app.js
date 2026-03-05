/* ============================================================
   WBIntel v7.1 · app.js — Main orchestration (FIXED)
   ============================================================ */
const WBIntel = (() => {

  // --- 12-HOUR CLOCK + DATE ---
  function startClock() {
    function tick() {
      const now = new Date();
      const timeEl = document.getElementById('clockTime');
      const dateEl = document.getElementById('clockDate');
      if (timeEl) timeEl.textContent = istTime12(now);
      if (dateEl) dateEl.textContent = istDate(now);
    }
    tick(); setInterval(tick, 1000);
  }

  // --- LIVE TV (FIXED — uses YouTube channel page embed) ---
  const TV = (() => {
    function render() {
      const channels = Settings.getTVChannels();
      const grid = document.getElementById('tvGrid');
      if (!grid) return;
      if (!channels || channels.length === 0) {
        grid.innerHTML = `<div class="onboard-card" style="grid-column:span 2"><p>No channels</p></div>`;
        return;
      }
      grid.innerHTML = channels.slice(0, 4).map((ch, i) => `
        <div class="tv-cell" id="tvCell${i}" onclick="WBIntel.TV.loadStream(${i}, '${esc(ch.id)}')">
          <div class="tv-name">${esc(ch.name)}</div>
          <div class="tv-play">▶</div>
          <div class="tv-label">TAP TO LOAD</div>
        </div>
      `).join('');
    }

    function loadStream(idx, channelId) {
      const cell = document.getElementById(`tvCell${idx}`);
      if (!cell || cell.classList.contains('loaded')) return;
      cell.classList.add('loaded');
      // Use YouTube channel page embed — shows latest/live content
      // This is more reliable than live_stream?channel= which often 404s
      cell.innerHTML = `<iframe
        src="https://www.youtube.com/embed?listType=user_uploads&list=${channelId}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen loading="lazy"
        onerror="this.parentElement.innerHTML='<div class=\\'tv-name\\'>Stream unavailable</div>'"
        style="width:100%;height:100%;border:none;position:absolute;inset:0"></iframe>`;
      // If that doesn't work, try the /live URL after a delay
      setTimeout(() => {
        if (cell.classList.contains('loaded')) {
          const iframe = cell.querySelector('iframe');
          if (iframe) {
            // Switch to channel live URL format
            iframe.src = `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1`;
          }
        }
      }, 3000);
    }

    return { render, loadStream };
  })();

  // --- THEME TOGGLE ---
  function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    if (body.getAttribute('data-theme') === 'dark') {
      body.setAttribute('data-theme', 'day'); btn.textContent = '☀️';
      localStorage.setItem('wbintel_theme', 'day');
    } else {
      body.setAttribute('data-theme', 'dark'); btn.textContent = '🌙';
      localStorage.setItem('wbintel_theme', 'dark');
    }
  }
  function restoreTheme() {
    if (localStorage.getItem('wbintel_theme') === 'day') {
      document.body.setAttribute('data-theme', 'day');
      const btn = document.getElementById('themeToggle');
      if (btn) btn.textContent = '☀️';
    }
  }

  // --- SETTINGS PANEL ---
  function toggleSettings() {
    const p = document.getElementById('settingsPanel');
    const o = document.getElementById('settingsOverlay');
    if (p.classList.contains('open')) { p.classList.remove('open'); o.classList.remove('open'); }
    else { Settings.renderUI(); p.classList.add('open'); o.classList.add('open'); }
  }

  // --- MODALS ---
  function showAbout() { document.getElementById('aboutModal').classList.add('open'); }
  function closeModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open')); }

  // --- STATUS ROTATION ---
  function startStatusRotation() {
    const el = document.getElementById('statusRotating');
    if (!el) return;
    const msgs = [
      'Monitoring all 23 districts of West Bengal',
      'Everything. Everywhere. All at Once.',
      `${WBINTEL_CONFIG.feeds.length} RSS feeds · auto-refreshing every 3 min`,
      'Presidency · Burdwan · Jalpaiguri · Medinipur divisions',
      'Built for journalists, analysts & researchers',
    ];
    let i = 0;
    // Start rotation after initial fetch completes (delayed)
    setTimeout(() => {
      setInterval(() => {
        el.style.opacity = 0;
        setTimeout(() => { el.textContent = msgs[i++ % msgs.length]; el.style.opacity = 1; }, 250);
      }, 6000);
    }, 20000); // start rotating after 20s (feeds should be loaded by then)
  }

  // --- KEYBOARD ---
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeModals();
        const p = document.getElementById('settingsPanel');
        if (p && p.classList.contains('open')) toggleSettings();
        if (window.Alerts) Alerts.dismiss();
      }
    });
  }

  // --- INIT ---
  function init() {
    console.log('[WBIntel] v7.1 starting…');
    restoreTheme();
    startClock();
    Sound.setEnabled(Settings.getToggle('soundEnabled', true));
    Resize.init();
    TV.render();
    Weather.init();

    // D3 map
    const w = setInterval(() => {
      if (typeof d3 !== 'undefined') { clearInterval(w); WBMap.init(); }
    }, 200);
    setTimeout(() => clearInterval(w), 15000);

    // X feeds (currently disabled)
    XFeed.init();

    // RSS feeds + ticker
    Ticker.init();
    Feeds.init();

    startStatusRotation();
    initKeyboard();
    console.log('[WBIntel] Initialized.');
  }

  return {
    init, TV, Weather, Map: WBMap, Feeds, XFeed, Ticker, Alerts,
    toggleSettings, showAbout, closeModals, toggleTheme,
  };
})();

document.addEventListener('DOMContentLoaded', () => WBIntel.init());
