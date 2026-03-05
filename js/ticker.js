/* ============================================================
   WBIntel v7.1 · ticker.js — Scrolling news ticker (FIXED)
   ============================================================ */
const Ticker = (() => {
  let _initialized = false;

  function updateItems(items) {
    const el = document.getElementById('tickerContent');
    if (!el || !items || items.length === 0) return;

    const html = items.map(item => {
      const cat = CATEGORIES[item.category] || { label: 'NEWS', color: '#aaa' };
      return `<span class="ticker-item">
        <span class="ti-cat" style="color:${cat.color}">◆ ${cat.label.toUpperCase()}</span>
        <span>${esc(truncate(item.title, 90))}</span>
        <span style="color:var(--t3)">· ${esc(item.source)} · ${timeAgo(item.pubDate)}</span>
      </span>`;
    }).join('');

    // Duplicate content for seamless infinite scroll
    el.innerHTML = html + html;

    // Remove old animation class, force reflow, re-apply
    el.classList.remove('scrolling');
    el.style.animation = 'none';
    void el.offsetHeight; // trigger reflow

    const duration = Math.max(60, items.length * 4);
    el.style.animation = `scrollLeft ${duration}s linear infinite`;
    el.classList.add('scrolling');
    _initialized = true;
  }

  function init() {
    // Initial placeholder is set in HTML
    _initialized = false;
  }

  return { init, updateItems };
})();
