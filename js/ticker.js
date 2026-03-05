/* ============================================================
   WBIntel v7.0 · ticker.js — Scrolling news ticker
   ============================================================ */
const Ticker = (() => {
  function updateItems(items) {
    const el = document.getElementById('tickerContent');
    if (!el || !items || items.length === 0) return;

    const html = items.map(item => {
      const cat = CATEGORIES[item.category] || { label: 'NEWS', color: '#888' };
      return `<span class="ticker-item">
        <span class="ti-cat" style="color:${cat.color}">◆ ${cat.label.toUpperCase()}</span>
        <span>${esc(truncate(item.title, 90))}</span>
        <span style="color:var(--t3)">· ${esc(item.source)} · ${timeAgo(item.pubDate)}</span>
      </span>`;
    }).join('');

    // Duplicate for seamless scroll loop
    el.innerHTML = html + html;

    // Calculate duration based on content width
    el.classList.remove('scrolling');
    void el.offsetWidth; // force reflow
    const duration = Math.max(80, items.length * 5);
    el.style.setProperty('--ticker-duration', duration + 's');
    el.classList.add('scrolling');
  }

  function init() { /* populated by feeds */ }
  return { init, updateItems };
})();
