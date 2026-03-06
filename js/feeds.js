/* ============================================================
   WBIntel · feeds.js — RSS aggregation via CONFIG
   ============================================================ */
const Feeds = (() => {
  let _allItems=[],_activeCat='all',_distFilter=null,_searchQ='',_catCounts={};
  let _timer=null,_seenIds=new Set(),_okCount=0,_failCount=0;

  async function fetchViaProxy(feedUrl, proxy) {
    try {
      const url = proxy.buildUrl(feedUrl, CONFIG.apiKeys.rss2json);
      const r = await fetch(url);
      if (!r.ok) return null;
      if (proxy.type === 'json') {
        const d = await r.json();
        return proxy.parseResponse(d);
      }
      if (proxy.type === 'xml-in-json') {
        const d = await r.json();
        const xml = proxy.parseResponse(d);
        return xml ? parseRSSXml(xml) : null;
      }
      if (proxy.type === 'raw-xml') {
        const text = await r.text();
        return parseRSSXml(text);
      }
    } catch { return null; }
    return null;
  }

  async function fetchFeed(feed) {
    let items = null;
    for (const proxy of CONFIG.rssProxies) {
      items = await fetchViaProxy(feed.url, proxy);
      if (items && items.length > 0) break;
    }
    if (!items || !items.length) { _failCount++; return []; }
    _okCount++;
    const wbFilter = Settings.getToggle('wbFilter', true);
    const maxAge = CONFIG.timers.maxItemAge;
    return items.map(item => {
      const title=item.title||'', desc=((item.description||item.content||'')).replace(/<[^>]*>/g,'').substring(0,300);
      const cats=item.categories||'', combined=title+' '+desc+' '+cats;
      if (wbFilter && !isWBRelevant(combined)) return null;
      if (item.pubDate) { const hrs=(Date.now()-new Date(item.pubDate).getTime())/3600000; if(hrs>maxAge||isNaN(hrs))return null; }
      return { id:item.guid||item.link||title+(item.pubDate||''), title, description:desc, link:item.link||'', pubDate:item.pubDate||new Date().toISOString(), source:feed.label, category:classifyItem(title,desc,cats), district:detectDistrict(combined), urgency:getUrgency(title+' '+desc) };
    }).filter(Boolean);
  }

  async function fetchAll() {
    _okCount=0;_failCount=0;
    const statusEl=document.getElementById('statusRotating');
    if(statusEl) statusEl.textContent='Fetching live RSS feeds…';
    const feeds=CONFIG.feeds, allR=[], bs=CONFIG.timers.batchSize;
    for(let i=0;i<feeds.length;i+=bs){
      const batch=feeds.slice(i,i+bs);
      const res=await Promise.allSettled(batch.map(f=>fetchFeed(f)));
      allR.push(...res);
      if(i+bs<feeds.length) await new Promise(r=>setTimeout(r,CONFIG.timers.batchDelay));
    }
    const newItems=[],ids=new Set();
    allR.forEach(r=>{if(r.status==='fulfilled')r.value.forEach(item=>{if(!ids.has(item.id)){ids.add(item.id);newItems.push(item);}});});
    newItems.sort((a,b)=>new Date(b.pubDate)-new Date(a.pubDate));
    const brandNew=newItems.filter(i=>!_seenIds.has(i.id));
    newItems.forEach(i=>_seenIds.add(i.id));
    _allItems=newItems;_catCounts={};
    _allItems.forEach(i=>{_catCounts[i.category]=(_catCounts[i.category]||0)+1;});
    brandNew.forEach(item=>{
      if(item.district&&window.WBMap)WBMap.pingDistrict(item.district,item.category);
      if(item.urgency==='critical'&&brandNew.indexOf(item)<3&&window.WBIntel)WBIntel.Alerts.show(item);
    });
    if(brandNew.length>0)Sound.ping();
    if(window.Ticker)Ticker.updateItems(_allItems.slice(0,40));
    renderPills();renderMaster();renderCats();renderPol();updateHdr();updateStatus();
    const el=document.getElementById('feedLastUpdate');if(el)el.textContent=`${_allItems.length} · ${istTimeShort()}`;
    if(statusEl)statusEl.textContent=`Loaded ${_allItems.length} items from ${_okCount} feeds`;
    console.log(`[Feeds] ${_allItems.length} items, ${_okCount} ok, ${_failCount} failed`);
  }

  function renderPills(){const bar=document.getElementById('feedFilterBar');if(!bar)return;const cats=['all',...Object.keys(CATEGORIES)];bar.innerHTML=cats.map(c=>{const a=_activeCat===c,l=c==='all'?'ALL':CATEGORIES[c].label.toUpperCase(),n=c==='all'?_allItems.length:(_catCounts[c]||0),clr=c!=='all'&&a?CATEGORIES[c].color:'';return`<button class="filter-pill ${a?'active':''}" onclick="WBIntel.Feeds.setCategory('${c}')" style="${clr?'border-color:'+clr+';color:'+clr:''}">${l}<span class="pill-count">${n}</span></button>`;}).join('');}
  function getFiltered(){let i=_allItems;if(_activeCat!=='all')i=i.filter(x=>x.category===_activeCat);if(_distFilter)i=i.filter(x=>x.district===_distFilter);if(_searchQ){const q=_searchQ.toLowerCase();i=i.filter(x=>(x.title+' '+x.description+' '+x.source).toLowerCase().includes(q));}return i;}
  function renderMaster(){const b=document.getElementById('masterFeedBody');if(!b)return;const i=getFiltered();if(!i.length){b.innerHTML=`<div class="fetch-error"><div class="fe-icon">${_allItems.length===0?'📡':'📭'}</div><div class="fe-msg">${_allItems.length===0?'Fetching feeds… 10-15 sec…':'No items match filters.'}</div><button class="fe-retry" onclick="WBIntel.Feeds.refreshAll()">Refresh</button></div>`;return;}b.innerHTML=i.slice(0,100).map(renderCard).join('');}
  function renderCard(item){const cat=CATEGORIES[item.category]||{label:item.category,color:'#888'};const urg=item.urgency!=='normal'?`urgency-${item.urgency}`:'';let uBadge='';if(item.urgency==='critical')uBadge='<span class="nc-urgency urg-critical">⚠ CRITICAL</span>';else if(item.urgency==='alert')uBadge='<span class="nc-urgency urg-alert">⚡ ALERT</span>';return`<div class="news-card cat-${item.category} ${urg}"><div class="nc-top"><span class="nc-badge" style="border-color:${cat.color};color:${cat.color};background:${cat.color}11">${cat.label}</span>${uBadge}<span class="nc-source">${esc(item.source)}</span><span class="nc-time">${timeAgo(item.pubDate)}</span></div><div class="nc-headline">${item.link?`<a href="${esc(item.link)}" target="_blank" rel="noopener">${esc(item.title)}</a>`:esc(item.title)}</div>${item.description?`<div class="nc-desc">${esc(truncate(item.description,160))}</div>`:''}${item.district?`<div class="nc-district">📍 ${esc(item.district)}</div>`:''}</div>`;}
  function renderPol(){const b=document.getElementById('politicsBody'),m=document.getElementById('politicsLastFetch');if(!b)return;const i=_allItems.filter(x=>x.category==='politics'||x.category==='govt');if(m)m.textContent=`${i.length} · ${istTimeShort()}`;if(!i.length){b.innerHTML=`<div class="fetch-error"><div class="fe-icon">🏛</div><div class="fe-msg">${_allItems.length===0?'Fetching…':'No WB political news today'}</div></div>`;return;}b.innerHTML=i.slice(0,25).map(renderCard).join('');}
  function renderCats(){const c=document.getElementById('categoryPanels');if(!c)return;const col=Settings.load().collapsedPanels||{};c.innerHTML=Object.entries(CATEGORIES).map(([k,cat])=>{const i=_allItems.filter(x=>x.category===k);return`<div class="cat-panel ${col[k]?'collapsed':''}" id="catPanel_${k}"><div class="cat-panel-header" onclick="WBIntel.Feeds.togglePanel('${k}')"><span style="color:${cat.color}">${cat.icon}</span><span class="cat-panel-title">${cat.label}</span><span class="cat-panel-count">${i.length}</span><span class="cat-panel-chevron">▼</span></div><div class="cat-panel-body">${!i.length?'<div class="fetch-error" style="padding:8px"><div class="fe-msg">No items</div></div>':i.slice(0,12).map(renderCard).join('')}</div></div>`;}).join('');}
  function togglePanel(k){const p=document.getElementById(`catPanel_${k}`);if(!p)return;p.classList.toggle('collapsed');const s=Settings.load();if(!s.collapsedPanels)s.collapsedPanels={};s.collapsedPanels[k]=p.classList.contains('collapsed');Settings.save(s);}
  function setCategory(c){_activeCat=c;renderPills();renderMaster();}
  function filterByDistrict(n){_distFilter=n;renderMaster();}
  function search(q){_searchQ=q;renderMaster();}
  function updateHdr(){const el=document.getElementById('headerCounters');if(!el)return;[{l:'Crime',c:['crime','fire'],cl:'#ff3b5c'},{l:'Pol',c:['politics','govt'],cl:'#ffaa00'},{l:'Biz',c:['business','finance'],cl:'#4da6ff'},{l:'Tech',c:['tech','realestate'],cl:'#b88aff'},{l:'Life',c:['lifestyle','sports','health'],cl:'#ff5a9e'}].forEach(g=>{});el.innerHTML=[{l:'Crime',c:['crime','fire'],cl:'#ff3b5c'},{l:'Pol',c:['politics','govt'],cl:'#ffaa00'},{l:'Biz',c:['business','finance'],cl:'#4da6ff'},{l:'Tech',c:['tech','realestate'],cl:'#b88aff'},{l:'Life',c:['lifestyle','sports','health'],cl:'#ff5a9e'}].map(g=>`<div class="hctr"><span class="hctr-label">${g.l}</span><span class="hctr-val" style="color:${g.cl}">${g.c.reduce((s,k)=>s+(_catCounts[k]||0),0)}</span></div>`).join('');}
  function updateStatus(){const el=document.getElementById('statusCounters');if(!el)return;el.innerHTML=`<span>ITEMS: ${_allItems.length}</span> · <span>FEEDS: ${_okCount}/${CONFIG.feeds.length}</span>`;}
  async function refreshAll(){await fetchAll();}
  function init(){
    const t=document.getElementById('tickerContent');if(t)t.innerHTML='<span class="ticker-placeholder">📡 Connecting to RSS feeds…</span>';
    fetchAll();if(_timer)clearInterval(_timer);_timer=setInterval(fetchAll,CONFIG.timers.feedRefresh);
  }
  return {init,refreshAll,refreshCategory:refreshAll,setCategory,filterByDistrict,togglePanel,search,getAllItems:()=>_allItems};
})();
