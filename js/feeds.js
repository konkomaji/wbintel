/* ============================================================
   WBIntel v7.0 · feeds.js — RSS feed aggregation
   ============================================================ */
const Feeds = (() => {
  let _allItems = [], _activeCategory = 'all', _districtFilter = null, _searchQuery = '', _catCounts = {};
  let _refreshTimer = null, _seenIds = new Set();

  function rssProxy(feedUrl) {
    return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
  }

  async function fetchFeed(feed) {
    const data = await safeFetch(rssProxy(feed.url), `RSS:${feed.label}`);
    if (!data || !data.items) return [];
    const wbFilter = Settings.getToggle('wbFilter', true);
    return data.items.map(item => {
      const title = item.title || '';
      const desc = (item.description || '').replace(/<[^>]*>/g, '').substring(0, 300);
      const cats = (item.categories || []).join(' ');
      const combined = title + ' ' + desc + ' ' + cats;
      if (wbFilter && !isWBRelevant(combined)) return null;
      const category = classifyItem(title, desc, cats);
      const district = detectDistrict(combined);
      const urgency = getUrgency(title + ' ' + desc);
      return {
        id: item.guid || item.link || title + item.pubDate,
        title, description: desc, link: item.link || '',
        pubDate: item.pubDate || '', source: feed.label,
        category, district, urgency,
      };
    }).filter(Boolean);
  }

  async function fetchAll() {
    const feeds = WBINTEL_CONFIG.feeds;
    const results = await Promise.allSettled(feeds.map(f => fetchFeed(f)));
    const newItems = [];
    const ids = new Set();
    results.forEach(r => {
      if (r.status === 'fulfilled') r.value.forEach(item => {
        if (!ids.has(item.id)) { ids.add(item.id); newItems.push(item); }
      });
    });
    newItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Detect brand-new items
    const brandNew = newItems.filter(i => !_seenIds.has(i.id));
    newItems.forEach(i => _seenIds.add(i.id));

    _allItems = newItems;
    _catCounts = {};
    _allItems.forEach(i => { _catCounts[i.category] = (_catCounts[i.category] || 0) + 1; });

    // Ping map + check alerts for new items
    brandNew.forEach(item => {
      if (item.district) WBMap.pingDistrict(item.district, item.category);
      if (item.urgency === 'critical' && brandNew.indexOf(item) < 3) {
        WBIntel.Alerts.show(item);
      }
    });
    if (brandNew.length > 0) Sound.ping();

    // Update ticker
    if (window.Ticker) Ticker.updateItems(_allItems.slice(0, 40));

    // Render everything
    renderFilterPills();
    renderMasterFeed();
    renderCategoryPanels();
    renderPoliticsFeed();
    updateHeaderCounters();
    updateStatusCounters();

    document.getElementById('feedLastUpdate').textContent = istTimeShort();
  }

  function renderFilterPills() {
    const bar = document.getElementById('feedFilterBar');
    if (!bar) return;
    const cats = ['all', ...Object.keys(CATEGORIES)];
    bar.innerHTML = cats.map(cat => {
      const active = _activeCategory === cat;
      const label = cat === 'all' ? 'ALL' : CATEGORIES[cat].label.toUpperCase();
      const count = cat === 'all' ? _allItems.length : (_catCounts[cat] || 0);
      const color = cat !== 'all' && active ? CATEGORIES[cat].color : '';
      return `<button class="filter-pill ${active?'active':''}" onclick="WBIntel.Feeds.setCategory('${cat}')"
        style="${color ? 'border-color:'+color+';color:'+color : ''}">
        ${label}<span class="pill-count">${count}</span></button>`;
    }).join('');
  }

  function getFiltered() {
    let items = _allItems;
    if (_activeCategory !== 'all') items = items.filter(i => i.category === _activeCategory);
    if (_districtFilter) items = items.filter(i => i.district === _districtFilter);
    if (_searchQuery) {
      const q = _searchQuery.toLowerCase();
      items = items.filter(i => (i.title + ' ' + i.description + ' ' + i.source).toLowerCase().includes(q));
    }
    return items;
  }

  function renderMasterFeed() {
    const body = document.getElementById('masterFeedBody');
    if (!body) return;
    const items = getFiltered();
    if (items.length === 0) {
      body.innerHTML = `<div class="fetch-error"><div class="fe-icon">📭</div>
        <div class="fe-msg">No items found</div>
        <div class="fe-time">Last fetch: ${istTimeShort()}</div>
        <button class="fe-retry" onclick="WBIntel.Feeds.refreshAll()">Refresh</button></div>`;
      return;
    }
    body.innerHTML = items.slice(0, 100).map(renderCard).join('');
  }

  function renderCard(item) {
    const cat = CATEGORIES[item.category] || { label: item.category, color: '#888' };
    const urgClass = item.urgency !== 'normal' ? `urgency-${item.urgency}` : '';
    let urgBadge = '';
    if (item.urgency === 'critical') urgBadge = '<span class="nc-urgency urg-critical">⚠ CRITICAL</span>';
    else if (item.urgency === 'alert') urgBadge = '<span class="nc-urgency urg-alert">⚡ ALERT</span>';
    return `<div class="news-card cat-${item.category} ${urgClass}">
      <div class="nc-top">
        <span class="nc-badge" style="border-color:${cat.color};color:${cat.color};background:${cat.color}11">${cat.label}</span>
        ${urgBadge}
        <span class="nc-source">${esc(item.source)}</span>
        <span class="nc-time">${timeAgo(item.pubDate)}</span>
      </div>
      <div class="nc-headline">${item.link ? `<a href="${esc(item.link)}" target="_blank" rel="noopener">${esc(item.title)}</a>` : esc(item.title)}</div>
      ${item.description ? `<div class="nc-desc">${esc(truncate(item.description, 160))}</div>` : ''}
      ${item.district ? `<div class="nc-district">📍 ${esc(item.district)}</div>` : ''}
    </div>`;
  }

  function renderPoliticsFeed() {
    const body = document.getElementById('politicsBody');
    const meta = document.getElementById('politicsLastFetch');
    if (!body) return;
    const items = _allItems.filter(i => i.category === 'politics' || i.category === 'govt');
    if (meta) meta.textContent = `${items.length} items · ${istTimeShort()}`;
    if (items.length === 0) {
      body.innerHTML = `<div class="fetch-error"><div class="fe-icon">🏛</div><div class="fe-msg">No politics items yet</div>
        <button class="fe-retry" onclick="WBIntel.Feeds.refreshAll()">Refresh</button></div>`;
      return;
    }
    body.innerHTML = items.slice(0, 25).map(renderCard).join('');
  }

  function renderCategoryPanels() {
    const container = document.getElementById('categoryPanels');
    if (!container) return;
    const collapsed = Settings.load().collapsedPanels || {};
    container.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => {
      const items = _allItems.filter(i => i.category === key);
      const coll = collapsed[key] ? 'collapsed' : '';
      return `<div class="cat-panel ${coll}" id="catPanel_${key}">
        <div class="cat-panel-header" onclick="WBIntel.Feeds.togglePanel('${key}')">
          <span style="color:${cat.color}">${cat.icon}</span>
          <span class="cat-panel-title">${cat.label}</span>
          <span class="cat-panel-count">${items.length}</span>
          <span class="cat-panel-chevron">▼</span>
        </div>
        <div class="cat-panel-body">
          ${items.length === 0 ? '<div class="fetch-error" style="padding:8px"><div class="fe-msg">No items</div></div>'
            : items.slice(0, 12).map(renderCard).join('')}
        </div>
      </div>`;
    }).join('');
  }

  function togglePanel(key) {
    const p = document.getElementById(`catPanel_${key}`);
    if (!p) return;
    p.classList.toggle('collapsed');
    const s = Settings.load();
    if (!s.collapsedPanels) s.collapsedPanels = {};
    s.collapsedPanels[key] = p.classList.contains('collapsed');
    Settings.save(s);
  }

  function setCategory(cat) { _activeCategory = cat; renderFilterPills(); renderMasterFeed(); }
  function filterByDistrict(name) { _districtFilter = name; renderMasterFeed(); }
  function search(query) { _searchQuery = query; renderMasterFeed(); }

  function updateHeaderCounters() {
    const el = document.getElementById('headerCounters');
    if (!el) return;
    const groups = [
      { label:'Crime', cats:['crime','fire'], color:'#ff3b5c' },
      { label:'Politics', cats:['politics','govt'], color:'#ffaa00' },
      { label:'Biz', cats:['business','finance'], color:'#4da6ff' },
      { label:'Tech', cats:['tech','realestate'], color:'#b88aff' },
      { label:'Life', cats:['lifestyle','sports','health'], color:'#ff5a9e' },
    ];
    el.innerHTML = groups.map(g => {
      const c = g.cats.reduce((s, k) => s + (_catCounts[k]||0), 0);
      return `<div class="hctr"><span class="hctr-label">${g.label}</span><span class="hctr-val" style="color:${g.color}">${c}</span></div>`;
    }).join('');
  }

  function updateStatusCounters() {
    const el = document.getElementById('statusCounters');
    if (!el) return;
    const total = _allItems.length;
    const src = WBINTEL_CONFIG.feeds.length;
    el.innerHTML = `<span>TOTAL: ${total}</span> <span style="color:var(--b1)">|</span> <span>FEEDS: ${src}</span>`;
  }

  async function refreshAll() { await fetchAll(); }
  async function refreshCategory(cat) { await fetchAll(); }

  function startAutoRefresh() {
    if (_refreshTimer) clearInterval(_refreshTimer);
    _refreshTimer = setInterval(fetchAll, 3 * 60 * 1000);
  }

  function init() { fetchAll(); startAutoRefresh(); }

  return { init, refreshAll, refreshCategory, setCategory, filterByDistrict, togglePanel, search, getAllItems: () => _allItems };
})();
