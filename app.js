/* ============================================================
   WBIntel · app.js — Main initialization & orchestration
   ============================================================ */

const WBIntel = (() => {

  // --- IST CLOCK ---
  function startClock() {
    const el = document.getElementById('istClock');
    if (!el) return;
    function tick() {
      el.textContent = istTime();
    }
    tick();
    setInterval(tick, 1000);
  }

  // --- LIVE TV ---
  const TV = (() => {
    function render() {
      const cfg = Config.get();
      const grid = document.getElementById('tvGrid');
      if (!grid) return;

      const activeChannels = cfg.tvChannels.filter(ch => ch.active).slice(0, 4);
      const extraChannels = cfg.tvChannels.filter(ch => !ch.active);

      grid.innerHTML = activeChannels.map((ch, i) => `
        <div class="tv-cell" id="tvCell${i}" onclick="WBIntel.TV.loadStream(${i}, '${esc(ch.channelId)}')">
          <div class="tv-name">${esc(ch.name)}</div>
          <div class="tv-play">▶</div>
          <div class="tv-label">LOAD LIVE</div>
        </div>
      `).join('');

      if (activeChannels.length === 0) {
        grid.innerHTML = `
          <div class="onboard-card" style="grid-column:span 2">
            <p>No TV channels configured.</p>
            <p class="onboard-hint">Open <strong>⚙ Config → TV Channels</strong> to add channels</p>
          </div>`;
      }
    }

    function loadStream(idx, channelId) {
      const cell = document.getElementById(`tvCell${idx}`);
      if (!cell || cell.classList.contains('loaded')) return;
      cell.classList.add('loaded');
      cell.innerHTML = `<iframe
        src="https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
    }

    return { render, loadStream };
  })();

  // --- CONFIG PANEL TOGGLE ---
  function toggleConfig() {
    const panel = document.getElementById('configPanel');
    const overlay = document.getElementById('configOverlay');
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
      overlay.classList.remove('open');
    } else {
      Config.renderConfigUI();
      panel.classList.add('open');
      overlay.classList.add('open');
    }
  }

  // --- MODALS ---
  function showAbout() {
    document.getElementById('aboutModal').classList.add('open');
  }
  function showDeploy() {
    document.getElementById('deployModal').classList.add('open');
  }
  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  // --- STATUS BAR ROTATION ---
  function startStatusRotation() {
    const el = document.getElementById('statusRotating');
    if (!el) return;
    const messages = [
      'Monitoring all 23 districts of West Bengal in real time',
      'Aggregating RSS feeds · Twitter · YouTube · Open-Meteo',
      'Politics · Crime · Business · Tech · Logistics · Sports · Health',
      'All data fetched live — no pre-coded content',
      'Open-source intelligence for West Bengal',
      'Kolkata · Siliguri · Asansol · Durgapur · Howrah · and more',
      `${Config.get().feeds.filter(f => f.active).length} active feeds · refreshing every 3 min`,
    ];
    let idx = 0;
    function rotate() {
      el.style.opacity = 0;
      setTimeout(() => {
        el.textContent = messages[idx % messages.length];
        el.style.opacity = 1;
        idx++;
      }, 300);
    }
    rotate();
    setInterval(rotate, 5000);
    el.style.transition = 'opacity 0.3s';
  }

  // --- KEYBOARD SHORTCUTS ---
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModals();
        const panel = document.getElementById('configPanel');
        if (panel.classList.contains('open')) toggleConfig();
      }
    });
  }

  // --- MAIN INIT ---
  function init() {
    console.log('[WBIntel] Initializing v6.0…');

    // Load config
    Config.load();

    // Start clock
    startClock();

    // Init column resize
    Resize.init();

    // Init TV grid
    TV.render();

    // Init weather
    Weather.init();

    // Init map (async, D3-dependent)
    if (typeof d3 !== 'undefined') {
      WBMap.init();
    } else {
      // Wait for D3 to load
      const waitForD3 = setInterval(() => {
        if (typeof d3 !== 'undefined') {
          clearInterval(waitForD3);
          WBMap.init();
        }
      }, 200);
      // Timeout after 10s
      setTimeout(() => clearInterval(waitForD3), 10000);
    }

    // Init Twitter embeds
    Twitter.init();

    // Init ticker
    Ticker.init();

    // Init RSS feeds (async, populates everything)
    Feeds.init();

    // Start status bar rotation
    startStatusRotation();

    // Keyboard
    initKeyboard();

    console.log('[WBIntel] All modules initialized.');
  }

  // --- PUBLIC API ---
  return {
    init,
    TV,
    Weather,
    Map: WBMap,
    Feeds,
    Twitter,
    Ticker,
    toggleConfig,
    showAbout,
    showDeploy,
    closeModals,
  };
})();

// --- BOOT ---
document.addEventListener('DOMContentLoaded', () => {
  WBIntel.init();
});
