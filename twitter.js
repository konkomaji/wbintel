/* ============================================================
   WBIntel · twitter.js — Twitter/X embed widget integration
   ============================================================ */

const Twitter = (() => {

  function loadWidget(containerEl) {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(containerEl);
    } else {
      const s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      s.charset = 'utf-8';
      containerEl.appendChild(s);
    }
  }

  // --- PROFILE FEEDS ---
  function reloadProfiles() {
    const cfg = Config.get();
    const body = document.getElementById('twitterProfileBody');
    if (!body) return;

    const handles = cfg.twitterHandles;
    if (!handles || handles.length === 0) {
      body.innerHTML = `
        <div class="onboard-card">
          <p>No Twitter handles configured.</p>
          <p class="onboard-hint">Open <strong>⚙ Config → Twitter</strong> to add handles</p>
        </div>`;
      return;
    }

    body.innerHTML = handles.map(handle => `
      <div class="twitter-embed-wrap" style="margin-bottom:6px">
        <a class="twitter-timeline"
          data-theme="dark"
          data-chrome="noheader nofooter noborders transparent"
          data-tweet-limit="5"
          data-aria-polite="assertive"
          data-width="100%"
          href="https://twitter.com/${esc(handle)}">
          Loading @${esc(handle)}…
        </a>
      </div>
    `).join('');

    loadWidget(body);
  }

  // --- KEYWORD / HASHTAG FEED ---
  function reloadKeywords() {
    const cfg = Config.get();
    const body = document.getElementById('twitterKeywordBody');
    if (!body) return;

    const keywords = cfg.twitterKeywords;
    if (!keywords || keywords.length === 0) {
      body.innerHTML = `
        <div class="onboard-card">
          <p>No keywords configured.</p>
          <p class="onboard-hint">Open <strong>⚙ Config → Twitter</strong> to add hashtags</p>
        </div>`;
      return;
    }

    const query = keywords.map(k => encodeURIComponent(k)).join('%20OR%20');
    body.innerHTML = `
      <div class="twitter-embed-wrap">
        <a class="twitter-timeline"
          data-theme="dark"
          data-chrome="noheader nofooter noborders transparent"
          data-tweet-limit="10"
          data-aria-polite="assertive"
          data-width="100%"
          href="https://twitter.com/search?q=${query}&src=typed_query&f=live">
          Loading keyword feed…
        </a>
      </div>`;

    loadWidget(body);
  }

  // --- INIT ---
  function init() {
    reloadProfiles();
    reloadKeywords();
  }

  return { init, reloadProfiles, reloadKeywords };
})();
