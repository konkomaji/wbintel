/* ============================================================
   WBIntel v7.1 · feeds.js — RSS feed aggregation (FIXED)
   Multiple proxy fallbacks, XML parsing, current-day filter
   ============================================================ */
const Feeds = (() => {
  let _allItems = [], _activeCategory = 'all', _districtFilter = null, _searchQuery = '', _catCounts = {};
  let _refreshTimer = null, _seenIds = new Set(), _fetchCount = 0, _failCount = 0;

  function parseRSSXml(xmlText) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      const items = [];
      doc.querySelectorAll('item, entry').forEach(entry => {
        const getText = (sel) => { const el = entry.querySelector(sel); return el ? el.textContent : ''; };
        const getLink = () => {
          const el = entry.querySelector('link');
          return el ? (el.textContent || el.getAttribute('href') || '') : '';
        };
        items.push({
          title: getText('title'),
          link: getLink(),
          description: getText('description') || getText('summary') || getText('content'),
          pubDate: getText('pubDate') || getText('published') || getText('updated'),
          categories: Array.from(entry.querySelectorAll('category')).map(c => c.textContent).join(' '),
        });
      });
      return items;
    } catch { return []; }
  }

  async function fetchViaRss2Json(url) {
    try {
      const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=25`);
      if (!r.ok) return null;
      const d = await r.json();
      return (d && d.items && d.items.length > 0) ? d.items : null;
    } catch { return null; }
  }

  async function fetchViaAllOrigins(url) {
    try {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      if (!r.ok) return null;
      const d = await r.json();
      return d && d.contents ? parseRSSXml(d.contents) : null;
    } catch { return null; }
  }

  async function fetchFeed(feed) {
    let rawItems = await fetchViaRss2Json(feed.url);
    if (!rawItems || rawItems.length === 0) {
      rawItems = await fetchViaAllOrigins(feed.url);
    }
    if (!rawItems || rawItems.length === 0) { _failCount++; return []; }
    _fetchCount++;

    const wbFilter = Settings.getToggle('wbFilter', true);
    return rawItems.map(item => {
      const title = item.title || '';
      const desc = ((item.description || item.content || '')).replace(/<[^>]*>/g, '').substring(0, 300);
      const cats = item.categories || '';
      const combined = title + ' ' + desc + ' ' + cats;
      if (wbFilter && !isWBRelevant(combined)) return null;
      // Skip items older than 48 hours
      if (item.pubDate) {
        const hrs = (Date.now() - new Date(item.pubDate).getTime()) / 3600000;
        if (hrs > 48 || isNaN(hrs)) return null;
      }
      return {
        id: item.guid || item.link || title + (item.pubDate || ''),
        title, description: desc, link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.label,
        category: classifyItem(title, desc, cats),
        district: detectDistrict(combined),
        urgency: getUrgency(title + ' ' + desc),
      };
    }).filter(Boolean);
  }

  async function fetchAll() {
    _fetchCount = 0; _failCount = 0;
    const statusEl = document.getElementById('statusRotating');
    if (statusEl) statusEl.textContent = 'Fetching live RSS feeds…';

    const feeds = WBINTEL_CONFIG.feeds;
    const allResults = [];
    // Batch requests (3 at a time) to avoid rate limits
    for (let i = 0; i < feeds.length; i += 3) {
      const batch = feeds.slice(i, i + 3);
      const results = await Promise.allSettled(batch.map(f => fetchFeed(f)));
      allResults.push(...results);
      if (i + 3 < feeds.length) await new Promise(r => setTimeout(r, 400));
    }

    const newItems = [], ids = new Set();
    allResults.forEach(r => {
      if (r.status === 'fulfilled') r.value.forEach(item => {
        if (!ids.has(item.id)) { ids.add(item.id); newItems.push(item); }
      });
    });
    newItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const brandNew = newItems.filter(i => !_seenIds.has(i.id));
    newItems.forEach(i => _seenIds.add(i.id));
    _allItems = newItems;
    _catCounts = {};
    _allItems.forEach(i => { _catCounts[i.category] = (_catCounts[i.category] || 0) + 1; });

    brandNew.forEach(item => {
      if (item.district && window.WBMap) WBMap.pingDistrict(item.district, item.category);
      if (item.urgency === 'critical' && brandNew.indexOf(item) < 3 && window.WBIntel) WBIntel.Alerts.show(item);
    });
    if (brandNew.length > 0) Sound.ping();
    if (window.Ticker) Ticker.updateItems(_allItems.slice(0, 40));

    renderFilterPills(); renderMasterFeed(); renderCategoryPanels(); renderPoliticsFeed();
    updateHeaderCounters(); updateStatusCounters();
    const el = document.getElementById('feedLastUpdate');
    if (el) el.textContent = `${_allItems.length} · ${istTimeShort()}`;
    if (statusEl) statusEl.textContent = `Loaded ${_allItems.length} items from ${_fetchCount} feeds`;
    console.log(`[Feeds] ${_allItems.length} items, ${_fetchCount} ok, ${_failCount} failed`);
  }

  function renderFilterPills() {
    const bar = document.getElementById('feedFilterBar'); if (!bar) return;
    const cats = ['all', ...Object.keys(CATEGORIES)];
    bar.innerHTML = cats.map(cat => {
      const active = _activeCategory === cat;
      const label = cat === 'all' ? 'ALL' : CATEGORIES[cat].label.toUpperCase();
      const count = cat === 'all' ? _allItems.length : (_catCounts[cat] || 0);
      const color = cat !== 'all' && active ? CATEGORIES[cat].color : '';
      return `<button class="filter-pill ${active?'active':''}" onclick="WBIntel.Feeds.setCategory('${cat}')"
        style="${color?'border-color:'+color+';color:'+color:''}">
        ${label}<span class="pill-count">${count}</span></button>`;
    }).join('');
  }

  function getFiltered() {
    let items = _allItems;
    if (_activeCategory !== 'all') items = items.filter(i => i.category === _activeCategory);
    if (_districtFilter) items = items.filter(i => i.district === _districtFilter);
    if (_searchQuery) { const q = _searchQuery.toLowerCase(); items = items.filter(i => (i.title+' '+i.description+' '+i.source).toLowerCase().includes(q)); }
    return items;
  }

  function renderMasterFeed() {
    const body = document.getElementById('masterFeedBody'); if (!body) return;
    const items = getFiltered();
    if (items.length === 0) {
      body.innerHTML = `<div class="fetch-error"><div class="fe-icon">${_allItems.length===0?'📡':'📭'}</div>
        <div class="fe-msg">${_allItems.length===0?'Fetching live feeds… this may take 10-15 seconds.':'No items match current filters.'}</div>
        <button class="fe-retry" onclick="WBIntel.Feeds.refreshAll()">Refresh Now</button></div>`;
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
      <div class="nc-headline">${item.link?`<a href="${esc(item.link)}" target="_blank" rel="noopener">${esc(item.title)}</a>`:esc(item.title)}</div>
      ${item.description?`<div class="nc-desc">${esc(truncate(item.description,160))}</div>`:''}
      ${item.district?`<div class="nc-district">📍 ${esc(item.district)}</div>`:''}
    </div>`;
  }

  function renderPoliticsFeed() {
    const body = document.getElementById('politicsBody'), meta = document.getElementById('politicsLastFetch');
    if (!body) return;
    const items = _allItems.filter(i => i.category==='politics'||i.category==='govt');
    if (meta) meta.textContent = `${items.length} · ${istTimeShort()}`;
    if (items.length === 0) {
      body.innerHTML = `<div class="fetch-error"><div class="fe-icon">🏛</div><div class="fe-msg">${_allItems.length===0?'Fetching…':'No WB political news today'}</div></div>`;
      return;
    }
    body.innerHTML = items.slice(0, 25).map(renderCard).join('');
  }

  function renderCategoryPanels() {
    const container = document.getElementById('categoryPanels'); if (!container) return;
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
          ${items.length===0?'<div class="fetch-error" style="padding:8px"><div class="fe-msg">No items</div></div>'
            :items.slice(0,12).map(renderCard).join('')}
        </div></div>`;
    }).join('');
  }

  function togglePanel(key) {
    const p = document.getElementById(`catPanel_${key}`); if (!p) return;
    p.classList.toggle('collapsed');
    const s = Settings.load(); if (!s.collapsedPanels) s.collapsedPanels = {};
    s.collapsedPanels[key] = p.classList.contains('collapsed'); Settings.save(s);
  }

  function setCategory(cat) { _activeCategory = cat; renderFilterPills(); renderMasterFeed(); }
  function filterByDistrict(name) { _districtFilter = name; renderMasterFeed(); }
  function search(query) { _searchQuery = query; renderMasterFeed(); }

  function updateHeaderCounters() {
    const el = document.getElementById('headerCounters'); if (!el) return;
    const groups = [
      {label:'Crime',cats:['crime','fire'],color:'#ff3b5c'},{label:'Pol',cats:['politics','govt'],color:'#ffaa00'},
      {label:'Biz',cats:['business','finance'],color:'#4da6ff'},{label:'Tech',cats:['tech','realestate'],color:'#b88aff'},
      {label:'Life',cats:['lifestyle','sports','health'],color:'#ff5a9e'},
    ];
    el.innerHTML = groups.map(g => {
      const c = g.cats.reduce((s,k)=>s+(_catCounts[k]||0),0);
      return `<div class="hctr"><span class="hctr-label">${g.label}</span><span class="hctr-val" style="color:${g.color}">${c}</span></div>`;
    }).join('');
  }

  function updateStatusCounters() {
    const el = document.getElementById('statusCounters'); if (!el) return;
    el.innerHTML = `<span>ITEMS: ${_allItems.length}</span> · <span>FEEDS: ${_fetchCount}/${WBINTEL_CONFIG.feeds.length}</span>`;
  }

  async function refreshAll() { await fetchAll(); }

  function init() {
    const ticker = document.getElementById('tickerContent');
    if (ticker) ticker.innerHTML = '<span class="ticker-placeholder">📡 Connecting to RSS feeds… loading headlines…</span>';
    fetchAll();
    if (_refreshTimer) clearInterval(_refreshTimer);
    _refreshTimer = setInterval(fetchAll, 3 * 60 * 1000);
  }

  return { init, refreshAll, refreshCategory:refreshAll, setCategory, filterByDistrict, togglePanel, search, getAllItems:()=>_allItems };
})();
