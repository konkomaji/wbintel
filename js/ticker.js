/* WBIntel · ticker.js — Scrolling ticker using CONFIG */
const Ticker = (() => {
  function updateItems(items) {
    const el=document.getElementById('tickerContent');if(!el||!items||!items.length)return;
    const html=items.map(i=>{const c=CATEGORIES[i.category]||{label:'NEWS',color:'#aaa'};return`<span class="ticker-item"><span class="ti-cat" style="color:${c.color}">◆ ${c.label.toUpperCase()}</span><span>${esc(truncate(i.title,90))}</span><span style="color:var(--t3)">· ${esc(i.source)} · ${timeAgo(i.pubDate)}</span></span>`;}).join('');
    el.innerHTML=html+html;
    el.style.animation='none';void el.offsetHeight;
    el.style.animation=`scrollLeft ${Math.max(60,items.length*CONFIG.timers.tickerSpeed)}s linear infinite`;
  }
  function init(){}
  return {init,updateItems};
})();
