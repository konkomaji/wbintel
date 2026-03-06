/* WBIntel · xfeed.js — X embeds (controlled by CONFIG.x.enabled) */
const XFeed = (() => {
  function reloadProfiles() {
    const b=document.getElementById('xProfileBody');if(!b)return;
    if (!CONFIG.x.enabled) { b.innerHTML='<div class="onboard-card"><p style="color:var(--t2)">𝕏 feeds disabled in config</p><p class="onboard-hint">Set <code>CONFIG.x.enabled = true</code> in config.js to activate</p></div>'; return; }
    const handles=Settings.getXHandles();
    b.innerHTML=handles.map(h=>`<div style="margin-bottom:8px;min-height:200px"><a class="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="4" data-width="100%" href="https://twitter.com/${h}">Loading @${esc(h)}…</a></div>`).join('');
    if(window.twttr&&window.twttr.widgets)window.twttr.widgets.load(b);
    else{const s=document.createElement('script');s.src='https://platform.twitter.com/widgets.js';s.async=true;document.head.appendChild(s);}
  }
  function reloadKeywords() {
    const b=document.getElementById('xKeywordBody');if(!b)return;
    if (!CONFIG.x.enabled) { b.innerHTML='<div class="onboard-card"><p style="color:var(--t2)"># keywords disabled</p></div>'; return; }
    const kw=Settings.getXKeywords(),q=kw.map(k=>encodeURIComponent(k)).join('%20OR%20');
    b.innerHTML=`<div style="min-height:200px"><a class="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="8" data-width="100%" href="https://twitter.com/search?q=${q}&src=typed_query&f=live">Loading…</a></div>`;
    if(window.twttr&&window.twttr.widgets)window.twttr.widgets.load(b);
  }
  function init(){reloadProfiles();reloadKeywords();}
  return {init,reloadProfiles,reloadKeywords};
})();
