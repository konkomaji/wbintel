/* ============================================================
   WBIntel · app.js — Orchestration, reads CONFIG
   ============================================================ */
const WBIntel = (() => {
  function startClock(){function t(){const n=new Date();const a=document.getElementById('clockTime'),b=document.getElementById('clockDate');if(a)a.textContent=istTime12(n);if(b)b.textContent=istDate(n);}t();setInterval(t,CONFIG.timers.clockTick);}

  const TV = (() => {
    function render(){const chs=Settings.getTVChannels(),g=document.getElementById('tvGrid');if(!g)return;if(!chs||!chs.length){g.innerHTML='<div class="onboard-card" style="grid-column:span 2"><p>No channels. Open ⚙ Settings.</p></div>';return;}g.innerHTML=chs.slice(0,4).map((c,i)=>`<div class="tv-cell" id="tvCell${i}" onclick="WBIntel.TV.loadStream(${i},'${esc(c.id)}')"><div class="tv-name">${esc(c.name)}</div><div class="tv-play">▶</div><div class="tv-label">TAP TO LOAD</div></div>`).join('');}
    function loadStream(i,id){const c=document.getElementById(`tvCell${i}`);if(!c||c.classList.contains('loaded'))return;c.classList.add('loaded');c.innerHTML=`<iframe src="https://www.youtube.com/embed/live_stream?channel=${id}&autoplay=1&mute=1" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy" style="width:100%;height:100%;border:none;position:absolute;inset:0"></iframe>`;}
    return {render,loadStream};
  })();

  function toggleTheme(){const b=document.body,btn=document.getElementById('themeToggle');if(b.getAttribute('data-theme')==='dark'){b.setAttribute('data-theme','day');btn.textContent='☀️';localStorage.setItem('wbintel_theme','day');}else{b.setAttribute('data-theme','dark');btn.textContent='🌙';localStorage.setItem('wbintel_theme','dark');}}
  function restoreTheme(){if(localStorage.getItem('wbintel_theme')==='day'){document.body.setAttribute('data-theme','day');const b=document.getElementById('themeToggle');if(b)b.textContent='☀️';}}
  function toggleSettings(){const p=document.getElementById('settingsPanel'),o=document.getElementById('settingsOverlay');if(p.classList.contains('open')){p.classList.remove('open');o.classList.remove('open');}else{Settings.renderUI();p.classList.add('open');o.classList.add('open');}}
  function showAbout(){document.getElementById('aboutModal').classList.add('open');}
  function closeModals(){document.querySelectorAll('.modal-overlay').forEach(m=>m.classList.remove('open'));}

  function startStatusRotation(){const el=document.getElementById('statusRotating');if(!el)return;const msgs=['Monitoring all 23 districts of West Bengal',CONFIG.app.tagline,`${CONFIG.feeds.length} RSS feeds · auto-refreshing`,`Weather via ${CONFIG.apiKeys.weatherApi?'WeatherAPI.com':'Open-Meteo'}`,'Built for journalists, analysts & researchers'];let i=0;setTimeout(()=>{setInterval(()=>{el.style.opacity=0;setTimeout(()=>{el.textContent=msgs[i++%msgs.length];el.style.opacity=1;},250);},CONFIG.timers.statusRotate);},20000);}

  function initKeyboard(){document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModals();const p=document.getElementById('settingsPanel');if(p&&p.classList.contains('open'))toggleSettings();Alerts.dismiss();}});}

  function init(){
    console.log(`[${CONFIG.app.name}] v${CONFIG.app.version} starting…`);
    restoreTheme(); startClock();
    Sound.setEnabled(Settings.getToggle('soundEnabled',true));
    Resize.init(); TV.render(); Weather.init();
    const w=setInterval(()=>{if(typeof d3!=='undefined'){clearInterval(w);WBMap.init();}},200);setTimeout(()=>clearInterval(w),15000);
    XFeed.init(); Ticker.init(); Feeds.init();
    startStatusRotation(); initKeyboard();
    console.log(`[${CONFIG.app.name}] All modules loaded.`);
  }

  return {init,TV,Weather,Map:WBMap,Feeds,XFeed,Ticker,Alerts,toggleSettings,showAbout,closeModals,toggleTheme};
})();
document.addEventListener('DOMContentLoaded',()=>WBIntel.init());
