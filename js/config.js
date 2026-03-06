/* ╔══════════════════════════════════════════════════════════════╗
   ║  WBIntel · config.js — CENTRAL CONFIGURATION FILE          ║
   ║  Single source of truth. Edit THIS file to change anything.║
   ║  All other modules read from CONFIG object only.           ║
   ╚══════════════════════════════════════════════════════════════╝ */

const CONFIG = {

  // ── APP INFO ─────────────────────────────────────────────
  app: {
    name: 'WBIntel',
    fullName: "WBIntel — West Bengal's Real Time Intelligence Dashboard",
    version: '7.3',
    author: 'Konko Maji',
    license: 'MIT',
    tagline: 'Everything. Everywhere. All at Once.',
  },

  // ── API KEYS ─────────────────────────────────────────────
  // Add your keys here. Leave empty string '' if not available.
  apiKeys: {
    weatherApi:     '114c6a51c1604874a04201743260503',  // weatherapi.com (free 1M calls/month)
    newsApi:        '',   // newsapi.org (free 100 req/day) — PLACEHOLDER
    rss2json:       '',   // rss2json.com (free 10k/day, key boosts limit) — PLACEHOLDER
    alphaVantage:   '',   // alphavantage.co (free 25 req/day) — PLACEHOLDER for stock data
    openWeatherMap: '',   // openweathermap.org — FALLBACK weather — PLACEHOLDER
    gnews:          '',   // gnews.io (free 100 req/day) — PLACEHOLDER for news
    currentsApi:    '',   // currentsapi.services (free 600 req/day) — PLACEHOLDER
    mediaStack:     '',   // mediastack.com (free 500 req/month) — PLACEHOLDER
  },

  // ── RSS PROXY SERVICES (fallback chain) ──────────────────
  // Order matters — tried first to last. Add more as needed.
  rssProxies: [
    {
      name: 'rss2json',
      buildUrl: (feedUrl, apiKey) => {
        const key = apiKey ? `&api_key=${apiKey}` : '';
        return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=25${key}`;
      },
      parseResponse: (data) => (data && data.items) ? data.items : null,
      type: 'json',
    },
    {
      name: 'allorigins',
      buildUrl: (feedUrl) => `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
      parseResponse: (data) => data && data.contents ? data.contents : null,
      type: 'xml-in-json', // returns XML inside JSON .contents
    },
    {
      name: 'corsproxy',
      buildUrl: (feedUrl) => `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
      parseResponse: null, // raw text, parse as XML
      type: 'raw-xml',
    },
    // FUTURE PROXIES — uncomment when needed:
    // { name: 'cors-anywhere', buildUrl: (url) => `https://cors-anywhere.herokuapp.com/${url}`, type: 'raw-xml' },
    // { name: 'thingproxy', buildUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`, type: 'raw-xml' },
  ],

  // ── MAP GEOJSON SOURCES (fallback chain) ─────────────────
  mapSources: [
    {
      url: 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states/west-bengal.geojson',
      label: 'udit-001 CDN (jsDelivr)',
      isStateOnly: true,
    },
    {
      url: 'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/West%20Bengal.json',
      label: 'Subhash9325 GitHub',
      isStateOnly: true,
    },
    {
      url: 'https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/WEST%20BENGAL/WEST%20BENGAL_DISTRICTS.geojson',
      label: 'datta07 GitHub',
      isStateOnly: true,
    },
    {
      url: 'https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson',
      label: 'geohacker all-India (filtered)',
      isStateOnly: false,
    },
    // FUTURE: Add your own hosted GeoJSON
    // { url: 'https://yoursite.com/wb-districts.geojson', label: 'Self-hosted', isStateOnly: true },
  ],

  // ── WEATHER — WB's 4 Administrative Divisions ────────────
  weather: {
    refreshMinutes: 20,
    // WeatherAPI.com query format: city name or lat,lon
    cities: [
      { name: 'Kolkata',    division: 'Presidency Division',  query: 'Kolkata' },
      { name: 'Burdwan',    division: 'Burdwan Division',     query: 'Bardhaman' },
      { name: 'Jalpaiguri', division: 'Jalpaiguri Division',  query: 'Siliguri' },
      { name: 'Medinipur',  division: 'Medinipur Division',   query: 'Midnapore,India' },
    ],
    // Fallback: Open-Meteo (no key needed) — used if WeatherAPI key is empty
    fallbackCities: [
      { name: 'Kolkata',    division: 'Presidency',  lat: 22.5726, lon: 88.3639 },
      { name: 'Burdwan',    division: 'Burdwan',     lat: 23.2333, lon: 87.8500 },
      { name: 'Siliguri',   division: 'Jalpaiguri',  lat: 26.7271, lon: 88.3953 },
      { name: 'Medinipur',  division: 'Medinipur',   lat: 22.4250, lon: 87.3200 },
    ],
  },

  // ── RSS FEEDS — All hardcoded sources ────────────────────
  // label: Display name | url: RSS feed URL | tags: optional category hints
  feeds: [
    // ── National / General (high WB content) ──
    { url: 'https://www.ndtv.com/rss/top-stories',                        label: 'NDTV' },
    { url: 'https://feeds.feedburner.com/ndtvnews-india-news',            label: 'NDTV India' },
    { url: 'https://thewire.in/rss',                                      label: 'The Wire' },
    { url: 'https://scroll.in/rss',                                       label: 'Scroll.in' },
    { url: 'https://theprint.in/feed',                                    label: 'The Print' },
    { url: 'https://www.indiatoday.in/rss/home',                          label: 'India Today' },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',  label: 'TOI Kolkata' },
    { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', label: 'Hindustan Times' },
    { url: 'https://www.news18.com/rss/india.xml',                        label: 'News18' },
    { url: 'https://indianexpress.com/feed/',                              label: 'Indian Express' },
    // ── Bengal / Kolkata focused ──
    { url: 'https://www.telegraphindia.com/rss',                           label: 'The Telegraph' },
    // ── Business / Finance ──
    { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms',  label: 'Economic Times' },
    { url: 'https://www.business-standard.com/rss/latest.rss',            label: 'Business Standard' },
    { url: 'https://www.livemint.com/rss/news',                           label: 'Mint' },
    // ── Tech / Startups ──
    { url: 'https://inc42.com/feed/',                                      label: 'Inc42' },
    { url: 'https://yourstory.com/feed',                                   label: 'YourStory' },
    // ── Legal ──
    { url: 'https://livelaw.in/feed',                                      label: 'LiveLaw' },
    // ── Government ──
    { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',     label: 'PIB Kolkata' },
    // ── Health ──
    { url: 'https://health.economictimes.indiatimes.com/rss/topstories',   label: 'ET Health' },
    // ── Sports ──
    { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',   label: 'ESPNcricinfo' },

    // ── ADD MORE FEEDS BELOW ──
    // { url: 'https://example.com/rss', label: 'Example News' },
    // { url: 'https://bengali-paper.com/feed', label: 'Bengali Paper' },
  ],

  // ── X (TWITTER) ──────────────────────────────────────────
  x: {
    enabled: false,  // Set to true when X embed issues are resolved
    handles: [
      'WBPolice', 'mamataofficial', 'BJP4Bengal', 'AITCofficial', 'CPaborgh',
      'ABPAnandaTV', 'ZeeBangla', 'News18Bangla', 'RepublicBangla',
    ],
    keywords: [
      '#WestBengal', '#Kolkata', '#WBPolice', '#TMC4Bengal', '#BJP4Bengal',
      '#কলকাতা', '#বাংলা', 'Mamata Banerjee', 'West Bengal news',
    ],
  },

  // ── YOUTUBE LIVE TV ──────────────────────────────────────
  tv: {
    channels: [
      { name: 'ABP Ananda',      id: 'UCmI_XsaYbBDjRMYYnlqolcA' },
      { name: 'Zee 24 Ghanta',   id: 'UCmDJGMDMiP-iF3bdNfYQgag' },
      { name: 'News18 Bangla',   id: 'UCmErZfbMaO71dFMFwJDfJmA' },
      { name: 'Republic Bangla', id: 'UCaIoVYtOV2kVLjGbyMfGYig' },
      // ── ADD MORE CHANNELS ──
      // { name: 'Kolkata TV',     id: 'UCxxxxxxxxxxxxxxxx' },
      // { name: 'NDTV India',    id: 'UCt1BIb6OeSMmhOEFwNIcPIA' },
    ],
  },

  // ── TIMING / REFRESH INTERVALS (in milliseconds) ────────
  timers: {
    feedRefresh:    3 * 60 * 1000,    // 3 minutes
    weatherRefresh: 20 * 60 * 1000,   // 20 minutes
    clockTick:      1000,             // 1 second
    statusRotate:   6000,             // 6 seconds
    tickerSpeed:    4,                // seconds per item (lower = faster scroll)
    batchDelay:     400,              // ms between RSS batch requests
    batchSize:      3,                // concurrent RSS requests per batch
    alertDismiss:   15000,            // auto-dismiss breaking alert
    maxItemAge:     48,               // hours — skip RSS items older than this
  },

  // ── CRITICAL ALERT KEYWORDS ──────────────────────────────
  // Items matching these trigger the red breaking news popup + alarm sound
  alertKeywords: [
    'killed', 'dead', 'blast', 'explosion', 'cyclone', 'flood',
    'earthquake', 'tsunami', 'bomb', 'shooting', 'massacre',
    'collapse', 'derail', 'crash', 'emergency', 'disaster',
    'critical alert', 'attack', 'riot', 'curfew',
  ],

  // ── ALERT-LEVEL KEYWORDS (amber badge, no popup) ────────
  alertLevelKeywords: [
    'protest', 'strike', 'bandh', 'shutdown', 'clash', 'tension',
    'violence', 'evacuate', 'warning', 'advisory',
  ],

  // ── WB RELEVANCE FILTER KEYWORDS ─────────────────────────
  // Items must contain at least one of these to pass WB filter
  wbKeywords: [
    'bengal','kolkata','howrah','siliguri','darjeeling','burdwan','murshidabad',
    'birbhum','midnapore','hooghly','nadia','haldia','durgapur','asansol',
    'barrackpore','barasat','krishnanagar','cooch behar','jalpaiguri','raiganj',
    'balurghat','purulia','bankura','bishnupur','tamluk','contai','kharagpur',
    'jhargram','alipurduar','kalimpong','rampurhat','bolpur','malda','kalyani',
    'habra','naihati','parganas','west bengal','wb ','bardhaman','medinipur',
    'dinajpur','sundarbans','diamond harbour','basirhat','ranaghat','santiniketan',
    'salt lake','rajarhat','new town','sector v','eden gardens','howrah bridge',
    'maidan','mamata','trinamool','tmc','bangla','nabanna','writers building',
    'তৃণমূল','বিজেপি','কলকাতা','বাংলা',
  ],

  // ── VISITOR COUNTER ──────────────────────────────────────
  visitorBadge: {
    enabled: true,
    url: 'https://visitor-badge.laobi.icu/badge?page_id=wbintel-wb-dashboard&left_color=%23131527&right_color=%23ffaa00&left_text=visitors',
  },

  // ── FUTURE API PLACEHOLDERS ──────────────────────────────
  // Uncomment and configure when ready to use
  future: {
    // telegramChannels: ['KolkataPoliceUpdates', 'WBNewsLive'],  // via rsshub.app
    // rsshubBase: 'https://rsshub.app/telegram/channel/',
    // facebookPages: [],  // public page embeds
    // googleNewsRSS: 'https://news.google.com/rss/search?q=west+bengal&hl=en-IN&gl=IN&ceid=IN:en',
    // customBackend: '',  // if you ever add a backend API
  },
};

// ── FREEZE CONFIG to prevent accidental mutation ───────────
Object.freeze(CONFIG.app);
Object.freeze(CONFIG.apiKeys);
Object.freeze(CONFIG.timers);
