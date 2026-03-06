/* ============================================================
   WBIntel · settings.js — User-adjustable settings
   Defaults come from CONFIG. User changes saved to localStorage.
   ============================================================ */
const Settings = (() => {
  const KEY = 'wbintel_settings';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} }
  function getXHandles()  { return load().xHandles  || CONFIG.x.handles; }
  function getXKeywords() { return load().xKeywords  || CONFIG.x.keywords; }
  function getTVChannels(){ return load().tvChannels || CONFIG.tv.channels; }
  function getToggle(k,def) { const s=load(); return s[k]!==undefined?s[k]:def; }
  function setToggle(k,v) { const s=load();s[k]=v;save(s); }
  function getColumnWidths() { return load().columnWidths || [26,38,36]; }
  function setColumnWidths(w) { const s=load();s.columnWidths=w;save(s); }

  function renderUI() {
    const body=document.getElementById('settingsBody'); if(!body)return;
    const handles=getXHandles(), keywords=getXKeywords(), channels=getTVChannels();
    body.innerHTML = `
      <div class="cfg-section"><div class="cfg-section-title">𝕏 X Handles</div>
        <div class="cfg-list" id="sXH">${handles.map((h,i)=>`<div class="cfg-list-item"><span>@${esc(h)}</span><button class="remove-btn" onclick="Settings.rmHandle(${i})">✕</button></div>`).join('')}</div>
        <div class="cfg-row"><input class="cfg-input" id="sNH" placeholder="Handle (no @)"><button class="cfg-btn" onclick="Settings.addHandle()">+</button></div>
        <button class="cfg-btn cfg-btn-primary" style="margin-top:6px;width:100%" onclick="Settings.applyX()">Apply & Reload</button></div>
      <div class="cfg-section"><div class="cfg-section-title"># X Keywords</div>
        <textarea class="cfg-textarea" id="sXK">${esc(keywords.join('\n'))}</textarea>
        <button class="cfg-btn cfg-btn-primary" style="margin-top:6px;width:100%" onclick="Settings.applyKw()">Apply</button></div>
      <div class="cfg-section"><div class="cfg-section-title">📺 YouTube Channels</div>
        <div class="cfg-list">${channels.map((c,i)=>`<div class="cfg-list-item"><span style="flex:1">${esc(c.name)}</span><span style="font-size:8px;color:var(--t3)">${esc(c.id).substring(0,12)}…</span><button class="remove-btn" onclick="Settings.rmTV(${i})">✕</button></div>`).join('')}</div>
        <div class="cfg-row"><input class="cfg-input" id="sTN" placeholder="Name"><input class="cfg-input" id="sTI" placeholder="Channel ID"><button class="cfg-btn" onclick="Settings.addTV()">+</button></div>
        <button class="cfg-btn cfg-btn-primary" style="margin-top:6px;width:100%" onclick="Settings.applyTV()">Apply</button></div>
      <div class="cfg-section"><div class="cfg-section-title">⚙ Preferences</div>
        <div class="cfg-toggle"><input type="checkbox" id="sS" ${getToggle('soundEnabled',true)?'checked':''} onchange="Settings.setToggle('soundEnabled',this.checked);Sound.setEnabled(this.checked)"><label for="sS">Sound effects</label></div>
        <div class="cfg-toggle"><input type="checkbox" id="sB" ${getToggle('breakingAlerts',true)?'checked':''} onchange="Settings.setToggle('breakingAlerts',this.checked)"><label for="sB">Breaking news alerts</label></div>
        <div class="cfg-toggle"><input type="checkbox" id="sM" ${getToggle('mapPings',true)?'checked':''} onchange="Settings.setToggle('mapPings',this.checked)"><label for="sM">Map ping animations</label></div>
        <div class="cfg-toggle"><input type="checkbox" id="sW" ${getToggle('wbFilter',true)?'checked':''} onchange="Settings.setToggle('wbFilter',this.checked)"><label for="sW">WB-only filter</label></div></div>
      <div class="cfg-section"><div class="cfg-section-title">🔄 Reset</div>
        <button class="cfg-btn" style="width:100%;color:var(--red);border-color:rgba(255,60,90,0.3)" onclick="if(confirm('Reset?')){localStorage.removeItem('${KEY}');location.reload()}">Reset All</button>
        <div class="cfg-note" style="margin-top:6px">RSS feeds & API keys are in config.js (hardcoded).</div></div>`;
  }
  function addHandle(){const i=document.getElementById('sNH'),h=(i.value||'').replace(/^@/,'').trim();if(!h)return;const a=getXHandles();a.push(h);const s=load();s.xHandles=a;save(s);i.value='';renderUI();}
  function rmHandle(idx){const a=getXHandles();a.splice(idx,1);const s=load();s.xHandles=a;save(s);renderUI();}
  function applyX(){if(window.WBIntel&&WBIntel.XFeed)WBIntel.XFeed.reloadProfiles();}
  function applyKw(){const v=document.getElementById('sXK').value;const kw=v.split('\n').map(s=>s.trim()).filter(Boolean);const s=load();s.xKeywords=kw;save(s);if(window.WBIntel&&WBIntel.XFeed)WBIntel.XFeed.reloadKeywords();}
  function addTV(){const n=document.getElementById('sTN').value.trim(),id=document.getElementById('sTI').value.trim();if(!n||!id)return;const c=getTVChannels();c.push({name:n,id});const s=load();s.tvChannels=c;save(s);renderUI();}
  function rmTV(idx){const c=getTVChannels();c.splice(idx,1);const s=load();s.tvChannels=c;save(s);renderUI();}
  function applyTV(){if(window.WBIntel&&WBIntel.TV)WBIntel.TV.render();}
  return {load,save,getXHandles,getXKeywords,getTVChannels,getToggle,setToggle,getColumnWidths,setColumnWidths,renderUI,addHandle,rmHandle,applyX,applyKw,addTV,rmTV,applyTV};
})();
