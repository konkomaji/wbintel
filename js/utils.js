/* ============================================================
   WBIntel · utils.js — Categories, districts, helpers, sound
   All config comes from CONFIG (config.js)
   ============================================================ */

const CATEGORIES = {
  crime:      { label: 'Crime',       icon: '🚔', color: '#ff3b5c' },
  fire:       { label: 'Fire',        icon: '🔥', color: '#ff7b1a' },
  politics:   { label: 'Politics',    icon: '🏛',  color: '#ffaa00' },
  business:   { label: 'Business',    icon: '💼', color: '#4da6ff' },
  finance:    { label: 'Finance',     icon: '📈', color: '#00e8b8' },
  realestate: { label: 'Real Estate', icon: '🏗',  color: '#00d4f0' },
  tech:       { label: 'Tech',        icon: '💻', color: '#b88aff' },
  logistics:  { label: 'Logistics',   icon: '🚛', color: '#64b5f6' },
  lifestyle:  { label: 'Lifestyle',   icon: '🎭', color: '#ff5a9e' },
  sports:     { label: 'Sports',      icon: '⚽', color: '#8aff7a' },
  health:     { label: 'Health',      icon: '🏥', color: '#ff9f43' },
  govt:       { label: 'Govt',        icon: '🏛',  color: '#4fc3f7' },
  weather:    { label: 'Weather',     icon: '🌤',  color: '#80deea' },
  hyperlocal: { label: 'Hyperlocal',  icon: '📍', color: '#e0e0e0' },
};

const CAT_KEYWORDS = {
  crime:['crime','murder','robbery','arrested','seized','police','fir ','killed','dead body','blast','explosion','rape','theft','dacoity','shootout','kidnap','attack','encounter','custod'],
  fire:['fire','blaze','inferno','burn','arson','fire brigade','gutted','engulf'],
  politics:['mamata','tmc','bjp','cpim','left front','congress','election','assembly','governor','cabinet','panchayat','municipality','aitc','trinamool','bengal government','wb govt','isf','suci','modi bengal','amit shah bengal','chief minister','cm bengal','political','mla ','mp ','lok sabha','rajya sabha','by-election','political rally'],
  business:['investment','factory','plant','industry','jobs','employment','mou','crore','manufacturing','export','import','trade','startup','company','corporate'],
  finance:['sensex','nifty','market','stock','share','ipo','rbi','banking','budget','fiscal','revenue','gdp','inflation','rupee'],
  realestate:['flat','apartment','property','housing','real estate','sqft','bungalow','plot','land','rajarhat','hidco'],
  tech:['startup','funding','series a','series b','it park','software','tech','nasscom','sector v','saas','fintech','edtech','ai ','artificial intelligence'],
  logistics:['kolkata port','haldia port','freight','logistics','transport','highway','rail','airport','netaji subhas','metro','infrastructure','bridge'],
  lifestyle:['food','restaurant','festival','culture','cinema','theatre','music','art','durga puja','kiff','lifestyle','park street','tourism'],
  sports:['mohun bagan','east bengal','atk','isl','i-league','eden gardens','cricket','kkr','football','olympic'],
  health:['dengue','malaria','hospital','sskm','health department','disease','outbreak','vaccination','medical','doctor','patient','pandemic','covid'],
  weather:['cyclone','flood','alert','warning','rain','drought','aqi','pollution','weather','imd','storm','heat wave','cold wave'],
  govt:['government','ministry','scheme','wb govt','state govt','notification','gazette','policy','department','cabinet meeting'],
};

const WB_DISTRICTS = [
  'Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur',
  'Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong',
  'Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas',
  'Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur',
  'Purulia','South 24 Parganas','Uttar Dinajpur',
];

const AREA_TO_DISTRICT = {
  'salt lake':'North 24 Parganas','bidhannagar':'North 24 Parganas','rajarhat':'North 24 Parganas',
  'new town':'North 24 Parganas','barasat':'North 24 Parganas','barrackpore':'North 24 Parganas',
  'habra':'North 24 Parganas','naihati':'North 24 Parganas','basirhat':'North 24 Parganas',
  'bongaon':'North 24 Parganas','sector v':'North 24 Parganas',
  'diamond harbour':'South 24 Parganas','baruipur':'South 24 Parganas','sundarbans':'South 24 Parganas',
  'canning':'South 24 Parganas','kakdwip':'South 24 Parganas',
  'singur':'Hooghly','tarakeswar':'Hooghly','chinsurah':'Hooghly','serampore':'Hooghly','chandannagar':'Hooghly',
  'bolpur':'Birbhum','suri':'Birbhum','rampurhat':'Birbhum','santiniketan':'Birbhum',
  'durgapur':'Paschim Bardhaman','asansol':'Paschim Bardhaman','raniganj':'Paschim Bardhaman',
  'burdwan':'Purba Bardhaman','bardhaman':'Purba Bardhaman','kalna':'Purba Bardhaman',
  'kalyani':'Nadia','krishnanagar':'Nadia','ranaghat':'Nadia',
  'siliguri':'Darjeeling','darjeeling town':'Darjeeling','kurseong':'Darjeeling',
  'kharagpur':'Paschim Medinipur','midnapore':'Paschim Medinipur',
  'tamluk':'Purba Medinipur','contai':'Purba Medinipur','haldia':'Purba Medinipur','digha':'Purba Medinipur',
  'english bazar':'Malda','malda town':'Malda',
  'berhampore':'Murshidabad','jiaganj':'Murshidabad',
  'raiganj':'Uttar Dinajpur','islampur':'Uttar Dinajpur',
  'balurghat':'Dakshin Dinajpur','gangarampur':'Dakshin Dinajpur',
  'howrah':'Howrah','shibpur':'Howrah','uluberia':'Howrah',
  'park street':'Kolkata','esplanade':'Kolkata','college street':'Kolkata','eden gardens':'Kolkata',
  'bankura town':'Bankura','bishnupur':'Bankura',
  'purulia town':'Purulia','jhargram town':'Jhargram',
};

// ── HELPERS ────────────────────────────────────────────────
function windDirection(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}
function istTime12(d) { return (d||new Date()).toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour12:true,hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
function istDate(d) { return (d||new Date()).toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata',weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
function istTimeShort(d) { return (d||new Date()).toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:true}); }
function timeAgo(s) {
  const diff=Math.floor((Date.now()-new Date(s).getTime())/1000);
  if(isNaN(diff)||diff<0)return '';
  if(diff<60)return diff+'s ago'; if(diff<3600)return Math.floor(diff/60)+'m ago';
  if(diff<86400)return Math.floor(diff/3600)+'h ago'; return Math.floor(diff/86400)+'d ago';
}
async function safeFetch(url, label) {
  try { const r=await fetch(url); if(!r.ok)throw new Error(`HTTP ${r.status}`); return await r.json(); }
  catch(e){ console.warn(`[WBIntel] Fetch fail: ${label}`,e.message); return null; }
}
function detectDistrict(text) {
  if(!text)return null; const l=text.toLowerCase();
  for(const d of WB_DISTRICTS){ if(l.includes(d.toLowerCase()))return d; }
  for(const[a,d]of Object.entries(AREA_TO_DISTRICT)){ if(l.includes(a))return d; }
  return null;
}
function classifyItem(title,desc,cats) {
  const t=((title||'')+' '+(desc||'')+' '+(cats||'')).toLowerCase();
  for(const[cat,kws]of Object.entries(CAT_KEYWORDS)){ for(const kw of kws){ if(t.includes(kw))return cat; } }
  return 'hyperlocal';
}
function isWBRelevant(text) {
  const l=(text||'').toLowerCase();
  for(const kw of CONFIG.wbKeywords){ if(l.includes(kw.toLowerCase()))return true; }
  return false;
}
function getUrgency(text) {
  const l=(text||'').toLowerCase();
  for(const kw of CONFIG.alertKeywords){ if(l.includes(kw))return 'critical'; }
  for(const kw of CONFIG.alertLevelKeywords){ if(l.includes(kw))return 'alert'; }
  return 'normal';
}
function esc(s) { if(!s)return ''; const e=document.createElement('div'); e.textContent=s; return e.innerHTML; }
function truncate(s,max) { if(!s)return ''; return s.length>max?s.substring(0,max)+'…':s; }

// ── SOUND ENGINE (Web Audio API) ───────────────────────────
const Sound = (() => {
  let _enabled=true, _ctx=null;
  function ctx() { if(!_ctx)try{_ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){} return _ctx; }
  function ping() { if(!_enabled)return; const c=ctx();if(!c)return; const o=c.createOscillator(),g=c.createGain(); o.connect(g);g.connect(c.destination); o.frequency.value=880;o.type='sine'; g.gain.setValueAtTime(0.06,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.2); o.start(c.currentTime);o.stop(c.currentTime+0.2); }
  function alert() { if(!_enabled)return; const c=ctx();if(!c)return; [440,660].forEach((f,i)=>{ const o=c.createOscillator(),g=c.createGain(); o.connect(g);g.connect(c.destination); o.frequency.value=f;o.type='square'; g.gain.setValueAtTime(0.1,c.currentTime+i*0.15);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.15+0.3); o.start(c.currentTime+i*0.15);o.stop(c.currentTime+i*0.15+0.3); }); }
  function mapPing() { if(!_enabled)return; const c=ctx();if(!c)return; const o=c.createOscillator(),g=c.createGain(); o.connect(g);g.connect(c.destination); o.frequency.value=1200;o.type='sine'; g.gain.setValueAtTime(0.03,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.1); o.start(c.currentTime);o.stop(c.currentTime+0.1); }
  return { ping, alert, mapPing, setEnabled:(v)=>{_enabled=v}, isEnabled:()=>_enabled };
})();

// ── RSS XML PARSER (for fallback proxies) ──────────────────
function parseRSSXml(xmlText) {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    const items = [];
    doc.querySelectorAll('item, entry').forEach(el => {
      const gt = (s) => { const e=el.querySelector(s); return e?e.textContent:''; };
      const link = el.querySelector('link');
      items.push({
        title: gt('title'),
        link: link ? (link.textContent || link.getAttribute('href') || '') : '',
        description: gt('description') || gt('summary') || gt('content'),
        pubDate: gt('pubDate') || gt('published') || gt('updated'),
        categories: Array.from(el.querySelectorAll('category')).map(c=>c.textContent).join(' '),
      });
    });
    return items;
  } catch { return []; }
}
