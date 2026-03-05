/* ============================================================
   WBIntel · utils.js — Shared constants, helpers, district data
   ============================================================ */

// --- CATEGORY DEFINITIONS ---
const CATEGORIES = {
  crime:      { label: 'Crime',       icon: '🚔', color: '#ff2d55' },
  fire:       { label: 'Fire',        icon: '🔥', color: '#ff6b00' },
  politics:   { label: 'Politics',    icon: '🏛',  color: '#ffaa00' },
  business:   { label: 'Business',    icon: '💼', color: '#3d9eff' },
  finance:    { label: 'Finance',     icon: '📈', color: '#00d4aa' },
  realestate: { label: 'Real Estate', icon: '🏗',  color: '#00c8e0' },
  tech:       { label: 'Tech',        icon: '💻', color: '#a97fff' },
  logistics:  { label: 'Logistics',   icon: '🚛', color: '#64b5f6' },
  lifestyle:  { label: 'Lifestyle',   icon: '🎭', color: '#ff4d8f' },
  sports:     { label: 'Sports',      icon: '⚽', color: '#7dff6b' },
  health:     { label: 'Health',      icon: '🏥', color: '#ff9f43' },
  govt:       { label: 'Govt',        icon: '🏛',  color: '#4fc3f7' },
  weather:    { label: 'Weather',     icon: '🌤',  color: '#80deea' },
  hyperlocal: { label: 'Hyperlocal',  icon: '📍', color: '#e0e0e0' },
};

// --- KEYWORD LISTS PER CATEGORY ---
const CAT_KEYWORDS = {
  crime: ['crime','murder','robbery','fire','accident','arrested','seized','police','fir','killed','dead body','blast','explosion','rape','theft','dacoity','shootout','kidnap','attack'],
  fire: ['fire','blaze','inferno','burn','arson','fire brigade','firefighter'],
  politics: ['mamata','tmc','bjp','cpim','left','congress','election','assembly','governor','cabinet','panchayat','municipality','aitc','trinamool','bengal government','wb govt','isf','suci','bsp bengal','modi bengal','amit shah bengal','chief minister','cm bengal','rajya sabha bengal','lok sabha bengal'],
  business: ['investment','factory','plant','industry','jobs','employment','mou','crore','manufacturing','export','import','trade','bengal business','wb industry','startup','company','corporate'],
  finance: ['sensex','nifty','market','kolkata market','haldia','wb finance','bengal fund','wb budget','stock','share','ipo','rbi','banking'],
  realestate: ['flat','apartment','property','housing','real estate','project','sqft','bungalow','plot','land','kolkata property','new town','rajarhat','hidco','wb housing','affordable housing'],
  tech: ['startup','funding','series a','series b','it park','software','tech','kolkata startup','nasscom','sector v','salt lake','app','saas','fintech','edtech','bengal tech'],
  logistics: ['kolkata port','haldia port','freight','logistics','transport','highway','nh','rail','airport','netaji subhas','metro','infrastructure','roadworks','bridge'],
  lifestyle: ['kolkata food','restaurant','festival','culture','cinema','theatre','music','art','durga puja','kiff','kolkata film','lifestyle','park street'],
  sports: ['mohun bagan','east bengal','atk','isl','i-league','eden gardens','cricket bengal','bengal tigers','kolkata knight riders','kkr','cab cricket','football bengal'],
  health: ['dengue','malaria','hospital','sskm','rnbc','nil ratan','health department wb','disease','outbreak','vaccination','health alert','medical','doctor','patient'],
  weather: ['cyclone','flood','alert','warning','rain','drought','aqi','pollution','weather bengal','imd'],
  hyperlocal: ['local','ward','block','gram panchayat','municipality','neighbourhood','mohalla','para','bazaar'],
};

// --- WB GLOBAL KEYWORD WHITELIST ---
const WB_KEYWORDS = [
  'bengal','kolkata','howrah','siliguri','darjeeling','burdwan','murshidabad','birbhum',
  'midnapore','hooghly','nadia','haldia','durgapur','asansol','barrackpore','barasat',
  'krishnanagar','cooch behar','jalpaiguri','raiganj','balurghat','purulia','bankura',
  'bishnupur','tamluk','contai','kharagpur','jhargram','alipurduar','kalimpong',
  'rampurhat','bolpur','malda','kalyani','habra','naihati','north 24 parganas',
  'south 24 parganas','west bengal','wb','তৃণমূল','বিজেপি','কলকাতা','বাংলা',
  'kolkata','bengal','parganas','medinipur','bardhaman','dinajpur','sundarbans',
  'diamond harbour','baruipur','basirhat','bongaon','ranaghat','santiniketan',
];

// --- 23 DISTRICTS OF WEST BENGAL ---
const WB_DISTRICTS = [
  'Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur',
  'Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong',
  'Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas',
  'Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur',
  'Purulia','South 24 Parganas','Uttar Dinajpur',
];

// --- LOCAL AREA → DISTRICT MAPPING ---
const AREA_TO_DISTRICT = {
  'salt lake': 'North 24 Parganas', 'bidhannagar': 'North 24 Parganas',
  'rajarhat': 'North 24 Parganas', 'new town': 'North 24 Parganas',
  'barasat': 'North 24 Parganas', 'barrackpore': 'North 24 Parganas',
  'habra': 'North 24 Parganas', 'naihati': 'North 24 Parganas',
  'basirhat': 'North 24 Parganas', 'bongaon': 'North 24 Parganas',
  'diamond harbour': 'South 24 Parganas', 'baruipur': 'South 24 Parganas',
  'sundarbans': 'South 24 Parganas', 'canning': 'South 24 Parganas',
  'singur': 'Hooghly', 'tarakeswar': 'Hooghly', 'chinsurah': 'Hooghly',
  'serampore': 'Hooghly', 'chandannagar': 'Hooghly', 'rishra': 'Hooghly',
  'bolpur': 'Birbhum', 'suri': 'Birbhum', 'rampurhat': 'Birbhum',
  'santiniketan': 'Birbhum', 'siuri': 'Birbhum',
  'durgapur': 'Paschim Bardhaman', 'asansol': 'Paschim Bardhaman',
  'burdwan': 'Purba Bardhaman', 'bardhaman': 'Purba Bardhaman',
  'kalyani': 'Nadia', 'krishnanagar': 'Nadia', 'ranaghat': 'Nadia',
  'siliguri': 'Darjeeling', 'darjeeling town': 'Darjeeling',
  'kharagpur': 'Paschim Medinipur', 'midnapore': 'Paschim Medinipur',
  'tamluk': 'Purba Medinipur', 'contai': 'Purba Medinipur',
  'haldia': 'Purba Medinipur', 'digha': 'Purba Medinipur',
  'malda town': 'Malda', 'english bazar': 'Malda',
  'berhampore': 'Murshidabad', 'jiaganj': 'Murshidabad',
  'raiganj': 'Uttar Dinajpur', 'islampur': 'Uttar Dinajpur',
  'balurghat': 'Dakshin Dinajpur', 'gangarampur': 'Dakshin Dinajpur',
  'cooch behar town': 'Cooch Behar', 'jalpaiguri town': 'Jalpaiguri',
  'bankura town': 'Bankura', 'bishnupur': 'Bankura',
  'purulia town': 'Purulia', 'jhargram town': 'Jhargram',
  'alipurduar town': 'Alipurduar', 'kalimpong town': 'Kalimpong',
  'howrah': 'Howrah', 'shibpur': 'Howrah', 'uluberia': 'Howrah',
  'park street': 'Kolkata', 'esplanade': 'Kolkata', 'college street': 'Kolkata',
  'sector v': 'North 24 Parganas', 'eden gardens': 'Kolkata',
};

// --- WMO WEATHER CODE MAP ---
const WMO_CODES = {
  0: { desc: 'Clear sky', emoji: '☀️' },
  1: { desc: 'Mainly clear', emoji: '🌤' },
  2: { desc: 'Partly cloudy', emoji: '⛅' },
  3: { desc: 'Overcast', emoji: '☁️' },
  45: { desc: 'Foggy', emoji: '🌫' },
  48: { desc: 'Rime fog', emoji: '🌫' },
  51: { desc: 'Light drizzle', emoji: '🌦' },
  53: { desc: 'Mod. drizzle', emoji: '🌦' },
  55: { desc: 'Dense drizzle', emoji: '🌧' },
  61: { desc: 'Slight rain', emoji: '🌦' },
  63: { desc: 'Moderate rain', emoji: '🌧' },
  65: { desc: 'Heavy rain', emoji: '🌧' },
  71: { desc: 'Slight snow', emoji: '🌨' },
  73: { desc: 'Moderate snow', emoji: '❄️' },
  75: { desc: 'Heavy snow', emoji: '❄️' },
  77: { desc: 'Snow grains', emoji: '🌨' },
  80: { desc: 'Slight showers', emoji: '🌦' },
  81: { desc: 'Mod. showers', emoji: '🌧' },
  82: { desc: 'Violent showers', emoji: '⛈' },
  85: { desc: 'Snow showers', emoji: '🌨' },
  86: { desc: 'Heavy snow showers', emoji: '❄️' },
  95: { desc: 'Thunderstorm', emoji: '⛈' },
  96: { desc: 'T-storm + hail', emoji: '⛈' },
  99: { desc: 'T-storm + heavy hail', emoji: '⛈' },
};

// --- WIND DIRECTION HELPER ---
function windDirection(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// --- TIME FORMATTING ---
function istTime(date) {
  return (date || new Date()).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
}
function istTimeShort(date) {
  return (date || new Date()).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (isNaN(diff) || diff < 0) return '';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// --- SAFE FETCH WRAPPER ---
async function safeFetch(url, label) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(`[WBIntel] Fetch failed for ${label}:`, e.message);
    return null;
  }
}

// --- DETECT DISTRICT FROM TEXT ---
function detectDistrict(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  // Check direct district names
  for (const d of WB_DISTRICTS) {
    if (lower.includes(d.toLowerCase())) return d;
  }
  // Check area names → parent district
  for (const [area, district] of Object.entries(AREA_TO_DISTRICT)) {
    if (lower.includes(area)) return district;
  }
  return null;
}

// --- CLASSIFY ITEM INTO CATEGORY ---
function classifyItem(title, desc, categories) {
  const text = ((title || '') + ' ' + (desc || '') + ' ' + (categories || '')).toLowerCase();
  for (const [cat, keywords] of Object.entries(CAT_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return cat;
    }
  }
  return 'hyperlocal';
}

// --- CHECK IF ITEM IS WB-RELEVANT ---
function isWBRelevant(title, desc) {
  const text = ((title || '') + ' ' + (desc || '')).toLowerCase();
  for (const kw of WB_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) return true;
  }
  return false;
}

// --- HTML ESCAPE ---
function esc(str) {
  if (!str) return '';
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

// --- TRUNCATE ---
function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '…' : str;
}
