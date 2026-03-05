/* ============================================================
   WBIntel v7.0 · xfeed.js — X (Twitter) embed widget
   ============================================================ */
const XFeed = (() => {
  let _widgetLoaded = false;

  function ensureWidget(callback) {
    if (window.twttr && window.twttr.widgets) {
      callback();
      return;
    }
    // Load Twitter widget script
    if (!_widgetLoaded) {
      _widgetLoaded = true;
      window.twttr = window.twttr || {};
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      script.onload = () => {
        // Wait for twttr.widgets to be ready
        if (window.twttr && window.twttr.ready) {
          window.twttr.ready(callback);
        } else {
          setTimeout(callback, 1000);
        }
      };
      script.onerror = () => {
        console.warn('[WBIntel] Failed to load X widget script');
      };
      document.head.appendChild(script);
    } else {
      // Already loading, just wait
      const check = setInterval(() => {
        if (window.twttr && window.twttr.widgets) {
          clearInterval(check);
          callback();
        }
      }, 300);
      setTimeout(() => clearInterval(check), 10000);
    }
  }

  function reloadProfiles() {
    const handles = Settings.getXHandles();
    const body = document.getElementById('xProfileBody');
    if (!body) return;

    if (!handles || handles.length === 0) {
      body.innerHTML = `<div class="onboard-card"><p>No X handles configured.</p>
        <p class="onboard-hint">Open <strong>⚙ Settings</strong> to add handles like <code>@WBPolice</code></p></div>`;
      return;
    }

    // Create embed HTML
    body.innerHTML = handles.map(handle => `
      <div class="x-embed-wrap" style="margin-bottom:8px;min-height:200px">
        <a class="twitter-timeline"
          data-theme="dark"
          data-chrome="noheader nofooter noborders transparent"
          data-tweet-limit="4"
          data-width="100%"
          href="https://twitter.com/${handle}">
          Loading @${esc(handle)}…
        </a>
      </div>
    `).join('');

    // Load/reload widgets
    ensureWidget(() => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load(body);
      }
    });
  }

  function reloadKeywords() {
    const keywords = Settings.getXKeywords();
    const body = document.getElementById('xKeywordBody');
    if (!body) return;

    if (!keywords || keywords.length === 0) {
      body.innerHTML = `<div class="onboard-card"><p>No keywords configured.</p>
        <p class="onboard-hint">Open <strong>⚙ Settings</strong> to add hashtags like <code>#WestBengal</code></p></div>`;
      return;
    }

    const query = keywords.map(k => encodeURIComponent(k)).join('%20OR%20');
    body.innerHTML = `
      <div class="x-embed-wrap" style="min-height:200px">
        <a class="twitter-timeline"
          data-theme="dark"
          data-chrome="noheader nofooter noborders transparent"
          data-tweet-limit="8"
          data-width="100%"
          href="https://twitter.com/search?q=${query}&src=typed_query&f=live">
          Loading keyword feed…
        </a>
      </div>`;

    ensureWidget(() => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load(body);
      }
    });
  }

  function init() {
    reloadProfiles();
    reloadKeywords();
  }

  return { init, reloadProfiles, reloadKeywords };
})();
