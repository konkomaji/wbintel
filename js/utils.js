/* ============================================================
   WBIntel v7.0 · utils.js — Constants, helpers, sound engine
   ============================================================ */

// --- HARDCODED CONFIG ---
const WBINTEL_CONFIG = {
  weatherApiKey: '114c6a51c1604874a04201743260503',

  // WB's 4 Administrative Divisions
  weatherCities: [
    { name: 'Kolkata',    division: 'Presidency Div.', q: 'Kolkata' },
    { name: 'Burdwan',    division: 'Burdwan Div.',    q: 'Bardhaman' },
    { name: 'Jalpaiguri', division: 'Jalpaiguri Div.', q: 'Siliguri' },
    { name: 'Medinipur',  division: 'Medinipur Div.',  q: 'Midnapore' },
  ],

  // X (Twitter) Handles
  xHandles: [
    'WBPolice','mamataofficial','BJP4Bengal','AITCofficial','CPaborgh',
    'ABPAnandaTV','ZeeBangla','News18Bangla','RepublicBangla'
  ],

  // X Keywords
  xKeywords: [
    '#WestBengal','#Kolkata','#WBPolice','#TMC4Bengal','#BJP4Bengal',
    '#কলকাতা','#বাংলা','Mamata Banerjee','West Bengal news'
  ],

  // YouTube Live TV Channels
  tvChannels: [
    { name: 'ABP Ananda',     id: 'UCmI_XsaYbBDjRMYYnlqolcA' },
    { name: 'Zee 24 Ghanta',  id: 'UCmDJGMDMiP-iF3bdNfYQgag' },
    { name: 'News18 Bangla',  id: 'UCmErZfbMaO71dFMFwJDfJmA' },
    { name: 'Republic Bangla', id: 'UCaIoVYtOV2kVLjGbyMfGYig' },
  ],

  // RSS Feeds — hardcoded comprehensive list
  feeds: [
    // National / General (high WB content chance)
    { url: 'https://www.ndtv.com/rss/top-stories', label: 'NDTV' },
    { url: 'https://feeds.feedburner.com/ndtvnews-india-news', label: 'NDTV India' },
    { url: 'https://thewire.in/rss', label: 'The Wire' },
    { url: 'https://scroll.in/rss', label: 'Scroll.in' },
    { url: 'https://theprint.in/feed', label: 'The Print' },
    { url: 'https://www.indiatoday.in/rss/home', label: 'India Today' },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', label: 'TOI Kolkata' },
    { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', label: 'Hindustan Times' },
    { url: 'https://www.news18.com/rss/india.xml', label: 'News18' },
    { url: 'https://indianexpress.com/feed/', label: 'Indian Express' },
    // Kolkata / Bengal focused
    { url: 'https://www.telegraphindia.com/rss', label: 'The Telegraph' },
    // Business / Finance
    { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', label: 'Economic Times' },
    { url: 'https://www.business-standard.com/rss/latest.rss', label: 'Business Standard' },
    { url: 'https://www.livemint.com/rss/news', label: 'Mint' },
    // Tech
    { url: 'https://inc42.com/feed/', label: 'Inc42' },
    { url: 'https://yourstory.com/feed', label: 'YourStory' },
    // Legal
    { url: 'https://livelaw.in/feed', label: 'LiveLaw' },
    // Govt
    { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3', label: 'PIB Kolkata' },
    // Health
    { url: 'https://health.economictimes.indiatimes.com/rss/topstories', label: 'ET Health' },
    // Sports
    { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', label: 'ESPNcricinfo' },
  ],
};

// --- CATEGORIES ---
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

// --- KEYWORD MAPS ---
const CAT_KEYWORDS = {
  crime: ['crime','murder','robbery','arrested','seized','police','fir ','killed','dead body','blast','explosion','rape','theft','dacoity','shootout','kidnap','attack','encounter','custod'],
  fire: ['fire','blaze','inferno','burn','arson','fire brigade','gutted','engulf'],
  politics: ['mamata','tmc','bjp','cpim','left front','congress','election','assembly','governor','cabinet','panchayat','municipality','aitc','trinamool','bengal government','wb govt','isf','suci','modi bengal','amit shah bengal','chief minister','cm bengal','political','mla ','mp ','lok sabha','rajya sabha','by-election','political rally'],
  business: ['investment','factory','plant','industry','jobs','employment','mou','crore','manufacturing','export','import','trade','bengal business','wb industry','startup','company','corporate'],
  finance: ['sensex','nifty','market','stock','share','ipo','rbi','banking','budget','fiscal','revenue','gdp','inflation','rupee','forex'],
  realestate: ['flat','apartment','property','housing','real estate','sqft','bungalow','plot','land','kolkata property','rajarhat','hidco','wb housing'],
  tech: ['startup','funding','series a','series b','it park','software','tech','nasscom','sector v','salt lake it','app','saas','fintech','edtech','ai ','artificial intelligence'],
  logistics: ['kolkata port','haldia port','freight','logistics','transport','highway','rail','airport','netaji subhas','metro','infrastructure','bridge','road'],
  lifestyle: ['food','restaurant','festival','culture','cinema','theatre','music','art','durga puja','kiff','kolkata film','lifestyle','park street','entertainment','tourism'],
  sports: ['mohun bagan','east bengal','atk','isl','i-league','eden gardens','cricket','bengal tigers','kolkata knight riders','kkr','football','cab ','bcci','olympic'],
  health: ['dengue','malaria','hospital','sskm','health department','disease','outbreak','vaccination','health alert','medical','doctor','patient','pandemic','covid','virus'],
  weather: ['cyclone','flood','alert','warning','rain','drought','aqi','pollution','weather','imd','storm','heat wave','cold wave','nor\'wester'],
  govt: ['government','ministry','scheme','wb govt','state govt','central govt','notification','gazette','policy','department','cabinet meeting'],
};

// --- CRITICAL ALERT KEYWORDS ---
const CRITICAL_KEYWORDS = ['killed','dead','blast','explosion','cyclone','flood','earthquake','tsunami','bomb','shooting','massacre','collapse','derail','crash','emergency','disaster','critical alert','attack','riot'];

// --- WB DISTRICTS ---
const WB_DISTRICTS = [
  'Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur',
  'Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong',
  'Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas',
  'Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur',
  'Purulia','South 24 Parganas','Uttar Dinajpur',
];

// --- AREA → DISTRICT ---
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
  'kharagpur':'Paschim Medinipur','midnapore':'Paschim Medinipur','ghatal':'Paschim Medinipur',
  'tamluk':'Purba Medinipur','contai':'Purba Medinipur','haldia':'Purba Medinipur','digha':'Purba Medinipur',
  'english bazar':'Malda','malda town':'Malda',
  'berhampore':'Murshidabad','jiaganj':'Murshidabad','lalbag':'Murshidabad',
  'raiganj':'Uttar Dinajpur','islampur':'Uttar Dinajpur',
  'balurghat':'Dakshin Dinajpur','gangarampur':'Dakshin Dinajpur',
  'howrah':'Howrah','shibpur':'Howrah','uluberia':'Howrah',
  'park street':'Kolkata','esplanade':'Kolkata','college street':'Kolkata','eden gardens':'Kolkata',
  'bankura town':'Bankura','bishnupur':'Bankura',
  'purulia town':'Purulia','jhargram town':'Jhargram',
};

// --- WB KEYWORD WHITELIST ---
const WB_KEYWORDS = [
  'bengal','kolkata','howrah','siliguri','darjeeling','burdwan','murshidabad','birbhum',
  'midnapore','hooghly','nadia','haldia','durgapur','asansol','barrackpore','barasat',
  'krishnanagar','cooch behar','jalpaiguri','raiganj','balurghat','purulia','bankura',
  'bishnupur','tamluk','contai','kharagpur','jhargram','alipurduar','kalimpong',
  'rampurhat','bolpur','malda','kalyani','habra','naihati','parganas','west bengal',
  'wb ','তৃণমূল','বিজেপি','কলকাতা','বাংলা','bardhaman','medinipur','dinajpur',
  'sundarbans','diamond harbour','basirhat','ranaghat','santiniketan','salt lake',
  'rajarhat','new town','sector v','eden gardens','howrah bridge','maidan',
  'mamata','trinamool','tmc','bangla','nabanna','writers building',
];

// --- HELPERS ---
function windDirection(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function istTime12(date) {
  return (date || new Date()).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function istDate(date) {
  return (date || new Date()).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function istTimeShort(date) {
  return (date || new Date()).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
}
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (isNaN(diff) || diff < 0) return '';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

async function safeFetch(url, label) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(`[WBIntel] Fetch failed: ${label}`, e.message);
    return null;
  }
}

function detectDistrict(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const d of WB_DISTRICTS) { if (lower.includes(d.toLowerCase())) return d; }
  for (const [area, district] of Object.entries(AREA_TO_DISTRICT)) { if (lower.includes(area)) return district; }
  return null;
}

function classifyItem(title, desc, cats) {
  const text = ((title||'') + ' ' + (desc||'') + ' ' + (cats||'')).toLowerCase();
  for (const [cat, keywords] of Object.entries(CAT_KEYWORDS)) {
    for (const kw of keywords) { if (text.includes(kw)) return cat; }
  }
  return 'hyperlocal';
}

function isWBRelevant(text) {
  const lower = (text || '').toLowerCase();
  for (const kw of WB_KEYWORDS) { if (lower.includes(kw.toLowerCase())) return true; }
  return false;
}

function getUrgency(text) {
  const lower = (text || '').toLowerCase();
  for (const kw of CRITICAL_KEYWORDS) { if (lower.includes(kw)) return 'critical'; }
  const alertWords = ['protest','strike','bandh','shutdown','curfew','clash','tension','violence','evacuate'];
  for (const kw of alertWords) { if (lower.includes(kw)) return 'alert'; }
  return 'normal';
}

function esc(str) { if (!str) return ''; const el = document.createElement('div'); el.textContent = str; return el.innerHTML; }
function truncate(str, max) { if (!str) return ''; return str.length > max ? str.substring(0, max) + '…' : str; }

// --- SOUND ENGINE (Web Audio API — no external files) ---
const Sound = (() => {
  let _enabled = true;
  let _ctx = null;

  function getCtx() {
    if (!_ctx) {
      try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    return _ctx;
  }

  function ping() {
    if (!_enabled) return;
    const ctx = getCtx(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
  }

  function alert() {
    if (!_enabled) return;
    const ctx = getCtx(); if (!ctx) return;
    // Two-tone alarm
    [440, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'square';
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  }

  function mapPing() {
    if (!_enabled) return;
    const ctx = getCtx(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 1200; osc.type = 'sine';
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
  }

  function setEnabled(v) { _enabled = v; }
  function isEnabled() { return _enabled; }

  return { ping, alert, mapPing, setEnabled, isEnabled };
})();
