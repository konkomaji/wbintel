/* ============================================================
   WBIntel · feeds.js — RSS feed system, news cards, categories
   ============================================================ */

const Feeds = (() => {
  let _allItems = [];
  let _activeCategory = 'all';
  let _districtFilter = null;
  let _refreshTimers = [];
  let _categoryCounts = {};

  // RSS2JSON proxy
  function rssUrl(feedUrl) {
    const cfg = Config.get();
    const key = cfg.rss2jsonKey ? `&api_key=${cfg.rss2jsonKey}` : '';
    return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}${key}`;
  }

  // --- FETCH SINGLE FEED ---
  async function fetchFeed(feed) {
    const data = await safeFetch(rssUrl(feed.url), `RSS:${feed.label}`);
    if (!data || !data.items) return [];

    const cfg = Config.get();
    return data.items.map(item => {
      const title = item.title || '';
      const desc = item.description || '';
      const cats = (item.categories || []).join(' ');
      const combined = title + ' ' + desc + ' ' + cats;

      // WB relevance filter
      if (cfg.settings.wbKeywordFilter && !isWBRelevant(title, desc + ' ' + cats)) {
        return null;
      }

      // Classify category
      const category = classifyItem(title, desc, cats);
      const district = detectDistrict(combined);

      return {
        id: item.guid || item.link || title,
        title: title,
        description: (desc || '').replace(/<[^>]*>/g, '').substring(0, 250),
        link: item.link || '',
        pubDate: item.pubDate || '',
        source: feed.label,
        category: category,
        feedCategory: feed.category,
        district: district,
        thumbnail: item.thumbnail || item.enclosure?.link || '',
      };
    }).filter(Boolean);
  }

  // --- FETCH ALL ACTIVE FEEDS ---
  async function fetchAll() {
    const cfg = Config.get();
    const activeFeeds = cfg.feeds.filter(f => f.active);

    const results = await Promise.allSettled(
      activeFeeds.map(f => fetchFeed(f))
    );

    const newItems = [];
    const seenIds = new Set();

    results.forEach(r => {
      if (r.status === 'fulfilled') {
        r.value.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            newItems.push(item);
          }
        });
      }
    });

    // Sort by date (newest first)
    newItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Merge with existing (avoid duplicates)
    const existingIds = new Set(_allItems.map(i => i.id));
    const brandNew = newItems.filter(i => !existingIds.has(i.id));

    _allItems = newItems;

    // Count categories
    _categoryCounts = {};
    _allItems.forEach(item => {
      _categoryCounts[item.category] = (_categoryCounts[item.category] || 0) + 1;
    });

    // Ping map for new items
    brandNew.forEach(item => {
      if (item.district) {
        WBMap.pingDistrict(item.district, item.category);
      }
    });

    // Update ticker
    if (window.Ticker) Ticker.updateItems(_allItems.slice(0, 30));

    // Render
    renderFilterPills();
    renderMasterFeed();
    renderCategoryPanels();
    renderPoliticsFeed();
    updateHeaderCounters();
    updateStatusCounters();

    return _allItems;
  }

  // --- RENDER FILTER PILLS ---
  function renderFilterPills() {
    const bar = document.getElementById('feedFilterBar');
    if (!bar) return;

    const cats = ['all', ...Object.keys(CATEGORIES)];
    bar.innerHTML = cats.map(cat => {
      const isActive = _activeCategory === cat;
      const label = cat === 'all' ? 'ALL' : CATEGORIES[cat].label.toUpperCase();
      const count = cat === 'all' ? _allItems.length : (_categoryCounts[cat] || 0);
      return `<button class="filter-pill ${isActive ? 'active' : ''}"
        onclick="WBIntel.Feeds.setCategory('${cat}')"
        style="${isActive && cat !== 'all' ? 'border-color:' + CATEGORIES[cat].color + ';color:' + CATEGORIES[cat].color : ''}">
        ${label}<span class="pill-count">${count}</span>
      </button>`;
    }).join('');
  }

  // --- RENDER MASTER FEED ---
  function renderMasterFeed() {
    const body = document.getElementById('masterFeedBody');
    if (!body) return;

    let items = _allItems;
    if (_activeCategory !== 'all') {
      items = items.filter(i => i.category === _activeCategory);
    }
    if (_districtFilter) {
      items = items.filter(i => i.district === _districtFilter);
    }

    if (items.length === 0) {
      body.innerHTML = `<div class="fetch-error">
        <div class="fe-icon">📭</div>
        <div class="fe-msg">No items found${_activeCategory !== 'all' ? ' for this category' : ''}${_districtFilter ? ' in ' + _districtFilter : ''}</div>
        <div class="fe-time">Last fetch: ${istTimeShort()}</div>
        <button class="fe-retry" onclick="WBIntel.Feeds.refreshAll()">Refresh</button>
      </div>`;
      return;
    }

    body.innerHTML = items.slice(0, 80).map(renderCard).join('');
  }

  // --- RENDER SINGLE NEWS CARD ---
  function renderCard(item) {
    const catInfo = CATEGORIES[item.category] || { label: item.category, color: '#888' };
    return `
      <div class="news-card cat-${item.category}">
        <div class="nc-top">
          <span class="nc-badge" style="border-color:${catInfo.color};color:${catInfo.color};background:${catInfo.color}11">${catInfo.label}</span>
          <span class="nc-source">${esc(item.source)}</span>
          <span class="nc-time">${timeAgo(item.pubDate)}</span>
        </div>
        <div class="nc-headline">${item.link ? `<a href="${esc(item.link)}" target="_blank" rel="noopener">${esc(item.title)}</a>` : esc(item.title)}</div>
        ${item.description ? `<div class="nc-desc">${esc(truncate(item.description, 150))}</div>` : ''}
        ${item.district ? `<div class="nc-district">📍 ${esc(item.district)}</div>` : ''}
      </div>`;
  }

  // --- RENDER POLITICS FEED (centre column) ---
  function renderPoliticsFeed() {
    const body = document.getElementById('politicsBody');
    const meta = document.getElementById('politicsLastFetch');
    if (!body) return;

    const items = _allItems.filter(i =>
      i.category === 'politics' || i.feedCategory === 'politics' || i.category === 'govt'
    );

    if (meta) meta.textContent = `${items.length} items · ${istTimeShort()}`;

    if (items.length === 0) {
      body.innerHTML = `<div class="fetch-error">
        <div class="fe-icon">🏛</div>
        <div class="fe-msg">No politics items yet</div>
        <button class="fe-retry" onclick="WBIntel.Feeds.refreshCategory('politics')">Refresh</button>
      </div>`;
      return;
    }

    body.innerHTML = items.slice(0, 30).map(renderCard).join('');
  }

  // --- RENDER CATEGORY PANELS (right column, collapsible) ---
  function renderCategoryPanels() {
    const container = document.getElementById('categoryPanels');
    if (!container) return;

    const cfg = Config.get();
    const catList = Object.entries(CATEGORIES);

    container.innerHTML = catList.map(([key, cat]) => {
      const items = _allItems.filter(i => i.category === key);
      const collapsed = cfg.collapsedPanels[key] ? 'collapsed' : '';
      return `
        <div class="cat-panel ${collapsed}" id="catPanel_${key}">
          <div class="cat-panel-header" onclick="WBIntel.Feeds.togglePanel('${key}')">
            <span style="color:${cat.color}">${cat.icon}</span>
            <span class="cat-panel-title">${cat.label}</span>
            <span class="cat-panel-count">${items.length}</span>
            <span class="cat-panel-chevron">▼</span>
          </div>
          <div class="cat-panel-body">
            ${items.length === 0
              ? `<div class="fetch-error" style="padding:10px"><div class="fe-msg">No items</div></div>`
              : items.slice(0, 15).map(renderCard).join('')
            }
          </div>
        </div>`;
    }).join('');
  }

  // --- TOGGLE PANEL ---
  function togglePanel(key) {
    const panel = document.getElementById(`catPanel_${key}`);
    if (!panel) return;
    panel.classList.toggle('collapsed');
    const cfg = Config.get();
    cfg.collapsedPanels[key] = panel.classList.contains('collapsed');
    Config.save();
  }

  // --- SET CATEGORY FILTER ---
  function setCategory(cat) {
    _activeCategory = cat;
    renderFilterPills();
    renderMasterFeed();
  }

  // --- SET DISTRICT FILTER ---
  function filterByDistrict(name) {
    _districtFilter = name;
    renderMasterFeed();
  }

  // --- REFRESH ---
  async function refreshAll() {
    await fetchAll();
  }

  async function refreshCategory(cat) {
    // Just re-fetch all for now (could be optimized per-category)
    await fetchAll();
  }

  // --- UPDATE HEADER COUNTERS ---
  function updateHeaderCounters() {
    const el = document.getElementById('headerCounters');
    if (!el) return;
    const groups = [
      { label: 'Crime', cats: ['crime', 'fire'], color: '#ff2d55' },
      { label: 'Politics', cats: ['politics', 'govt'], color: '#ffaa00' },
      { label: 'Biz/Fin', cats: ['business', 'finance'], color: '#3d9eff' },
      { label: 'Tech/RE', cats: ['tech', 'realestate'], color: '#a97fff' },
      { label: 'Life/Sport', cats: ['lifestyle', 'sports', 'health'], color: '#ff4d8f' },
    ];
    el.innerHTML = groups.map(g => {
      const count = g.cats.reduce((sum, c) => sum + (_categoryCounts[c] || 0), 0);
      return `<div class="hctr">
        <span class="hctr-label">${g.label}</span>
        <span class="hctr-val" style="color:${g.color}">${count}</span>
      </div>`;
    }).join('');
  }

  // --- UPDATE STATUS BAR COUNTERS ---
  function updateStatusCounters() {
    const el = document.getElementById('statusCounters');
    if (!el) return;
    const keys = ['crime', 'politics', 'business', 'tech'];
    el.innerHTML = keys.map(k => {
      const label = (CATEGORIES[k]?.label || k).toUpperCase().substring(0, 5);
      return `<span>${label}: ${_categoryCounts[k] || 0}</span>`;
    }).join(' <span style="color:var(--b1)">|</span> ') +
    ` <span style="color:var(--b1)">|</span> <span>SRCS: ${Config.get().feeds.filter(f => f.active).length}</span>`;
  }

  // --- AUTO REFRESH ---
  function startAutoRefresh() {
    _refreshTimers.forEach(clearInterval);
    _refreshTimers = [];
    if (Config.get().settings.autoRefreshRSS) {
      _refreshTimers.push(setInterval(fetchAll, 3 * 60 * 1000)); // 3 min
    }
  }

  // --- INIT ---
  function init() {
    fetchAll();
    startAutoRefresh();
  }

  return {
    init, refreshAll, refreshCategory,
    setCategory, filterByDistrict, togglePanel,
    getAllItems: () => _allItems,
  };
})();
