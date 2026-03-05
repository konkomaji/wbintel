/* ============================================================
   WBIntel v7.1 · xfeed.js — X (Twitter) embeds
   TEMPORARILY DISABLED — uncomment when X embed issues resolved
   ============================================================ */
const XFeed = (() => {
  function reloadProfiles() {
    const body = document.getElementById('xProfileBody');
    if (body) body.innerHTML = `<div class="onboard-card">
      <p style="color:var(--t2)">𝕏 feeds temporarily disabled</p>
      <p class="onboard-hint">X embed widget has loading issues on some deployments. This feature will be re-enabled in a future update.</p>
    </div>`;
  }
  function reloadKeywords() {
    const body = document.getElementById('xKeywordBody');
    if (body) body.innerHTML = `<div class="onboard-card">
      <p style="color:var(--t2)"># keyword feeds temporarily disabled</p>
      <p class="onboard-hint">Will be re-enabled in a future update.</p>
    </div>`;
  }
  function init() { reloadProfiles(); reloadKeywords(); }
  return { init, reloadProfiles, reloadKeywords };
})();

/* --- ORIGINAL CODE (uncomment to re-enable) ---
const XFeed = (() => {
  let _widgetLoaded = false;
  function ensureWidget(cb) {
    if (window.twttr && window.twttr.widgets) { cb(); return; }
    if (!_widgetLoaded) {
      _widgetLoaded = true;
      const s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true; s.charset = 'utf-8';
      s.onload = () => { if (window.twttr && window.twttr.ready) window.twttr.ready(cb); else setTimeout(cb, 1000); };
      document.head.appendChild(s);
    }
  }
  function reloadProfiles() {
    const handles = Settings.getXHandles();
    const body = document.getElementById('xProfileBody');
    if (!body || !handles || handles.length === 0) return;
    body.innerHTML = handles.map(h => '<div style="margin-bottom:8px;min-height:200px"><a class="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="4" data-width="100%" href="https://twitter.com/' + h + '">Loading @' + h + '…</a></div>').join('');
    ensureWidget(() => { if (window.twttr && window.twttr.widgets) window.twttr.widgets.load(body); });
  }
  function reloadKeywords() {
    const keywords = Settings.getXKeywords();
    const body = document.getElementById('xKeywordBody');
    if (!body || !keywords || keywords.length === 0) return;
    const q = keywords.map(k => encodeURIComponent(k)).join('%20OR%20');
    body.innerHTML = '<div style="min-height:200px"><a class="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="8" data-width="100%" href="https://twitter.com/search?q=' + q + '&src=typed_query&f=live">Loading…</a></div>';
    ensureWidget(() => { if (window.twttr && window.twttr.widgets) window.twttr.widgets.load(body); });
  }
  function init() { reloadProfiles(); reloadKeywords(); }
  return { init, reloadProfiles, reloadKeywords };
})();
*/
