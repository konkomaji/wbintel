/* ============================================================
   WBIntel · ticker.js — Scrolling breaking news ticker
   ============================================================ */

const Ticker = (() => {

  function updateItems(items) {
    const content = document.getElementById('tickerContent');
    if (!content || !items || items.length === 0) return;

    // Build ticker items
    const tickerHTML = items.map(item => {
      const catInfo = CATEGORIES[item.category] || { label: 'NEWS', color: '#888' };
      const time = timeAgo(item.pubDate);
      return `<span class="ticker-item">
        <span class="ti-cat" style="color:${catInfo.color}">◆ ${catInfo.label.toUpperCase()}</span>
        <span>${esc(truncate(item.title, 80))}</span>
        <span class="ti-dot">·</span>
        <span style="color:var(--t3)">${esc(item.source)}</span>
        <span class="ti-dot">·</span>
        <span style="color:var(--t3)">${time}</span>
      </span>`;
    }).join('');

    // Duplicate for seamless loop
    content.innerHTML = tickerHTML + tickerHTML;

    // Reset animation
    content.style.animation = 'none';
    content.offsetHeight; // force reflow
    const duration = Math.max(60, items.length * 6);
    content.style.animation = `scrollLeft ${duration}s linear infinite`;
  }

  function init() {
    // Will be populated by feeds module when data arrives
  }

  return { init, updateItems };
})();
