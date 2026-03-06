<p align="center">
  <img src="https://img.shields.io/badge/WB-Intel-ffaa00?style=for-the-badge&labelColor=060710&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7wn5ShPC90ZXh0Pjwvc3ZnPg==" alt="WBIntel">
</p>

<h1 align="center">WBIntel — West Bengal's Real Time Intelligence Dashboard</h1>

<p align="center">
  <strong>Everything. Everywhere. All at Once.</strong>
</p>

<p align="center">
  <a href="https://wbintel.netlify.app/"><img src="https://img.shields.io/badge/🔴_LIVE-wbintel.netlify.app-ff2d55?style=for-the-badge&labelColor=0b0d1a" alt="Live Dashboard"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-7.3-ffaa00?style=flat-square&labelColor=131527" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-00d4aa?style=flat-square&labelColor=131527" alt="License">
  <img src="https://img.shields.io/badge/backend-ZERO-3d9eff?style=flat-square&labelColor=131527" alt="Zero Backend">
  <img src="https://img.shields.io/badge/build-none_needed-a97fff?style=flat-square&labelColor=131527" alt="No Build">
  <img src="https://img.shields.io/badge/hosting-Netlify_Free-00c8e0?style=flat-square&labelColor=131527" alt="Netlify">
  <img src="https://img.shields.io/badge/AI_Assisted-Claude_by_Anthropic-d4a574?style=flat-square&labelColor=131527" alt="Claude AI">
  <img src="https://visitor-badge.laobi.icu/badge?page_id=konkomaji.wbintel&left_color=131527&right_color=ffaa00&left_text=repo%20visitors" alt="Visitors">
</p>

---

## 🔍 What is WBIntel?

**WBIntel** is an open-source, real-time intelligence dashboard that monitors **everything happening across all 23 districts of West Bengal, India** — aggregating live news, politics, crime, business, weather, social media, and more into a single dense broadcast-style interface.

Think of it as a **war room for information** — built for anyone who needs total situational awareness of West Bengal.

> **🔴 Live at → [wbintel.netlify.app](https://wbintel.netlify.app/)**

---

## 🎯 Who Is This For?

| Audience | Use Case |
|---|---|
| 📰 **Journalists** | Monitor breaking stories across all beats and districts in real time |
| 🔬 **Political & Policy Analysts** | Track political developments, government actions, civic movements |
| 📺 **News Enthusiasts** | Stay informed about everything happening in WB, one screen |
| 🎓 **Mass Communication Students** | Study real-time news flow, media coverage patterns, regional journalism |
| 📊 **Researchers** | Aggregate and analyze information flow across categories and districts |
| 💼 **Business Intelligence** | Track industry, real estate, logistics, and market news for WB |

---

## ✨ Features

### 📡 Live RSS Aggregation
- **20+ RSS feeds** from major and regional news agencies (NDTV, The Wire, Scroll.in, TOI Kolkata, Economic Times, LiveLaw, PIB Kolkata, Inc42, and more)
- **Auto-filtered for West Bengal relevance** using 80+ location and topic keywords (English + Bengali)
- **Auto-categorized** into 14 categories: Crime, Fire, Politics, Business, Finance, Real Estate, Tech, Logistics, Lifestyle, Sports, Health, Govt, Weather, Hyperlocal
- **3 RSS proxy fallback chain** (rss2json → allorigins → corsproxy) — if one fails, the next takes over
- **Auto-refresh every 3 minutes** — always live, always current

### 🗺 Interactive WB District Map
- **D3.js-rendered SVG map** with all 23 district boundaries from real GeoJSON data
- **4 fallback GeoJSON sources** — always renders even if one CDN is down
- **Animated ping pulses** when news arrives from a district (colour-coded by category)
- **Click any district** to filter all news feeds to that district
- **Hover for tooltips** showing district name and event count

### 🌤 Live Weather (4 WB Divisions)
- **WeatherAPI.com** integration with AQI, UV index, wind, humidity
- Covers all **4 administrative divisions**: Presidency (Kolkata), Burdwan, Jalpaiguri, Medinipur
- **Auto-fallback to Open-Meteo** (no API key needed) if WeatherAPI key is missing
- Auto-refreshes every 20 minutes

### 📺 Live Bengali News TV
- **4 YouTube Live channels** — ABP Ananda, Zee 24 Ghanta, News18 Bangla, Republic Bangla
- **Click-to-load** — saves bandwidth, doesn't auto-play on page load
- Add/remove channels via Settings

### 🚨 Breaking News Alerts
- **Red flashing popup bar** + **alarm sound** when critical keywords detected (killed, blast, cyclone, flood, etc.)
- **Urgency badges** on news cards — ⚠ CRITICAL (red) and ⚡ ALERT (amber)
- Auto-dismisses after 15 seconds

### 🔊 Sound Effects
- **Web Audio API** — no external sound files needed
- Subtle ping on new items, alarm on critical alerts, click sound on map pings
- Fully toggleable in Settings

### 🔍 Quick Search
- Instant search across all fetched news items — filters in real time as you type

### 🌙 Day/Night Theme
- Dark mode (default, broadcast-style) and Day mode
- One-click toggle, remembers preference

### 📱 Mobile Warning
- Desktop-first design (1366px+) — shows friendly popup on mobile explaining the situation

### ⚙ Settings Panel
- Customize X handles, keywords, YouTube channels
- Toggle sound, alerts, map pings, WB filter
- Import/Export not needed — everything lives in `config.js`

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    config.js (CENTRAL HUB)                   │
│  API keys · RSS feeds · Map sources · TV channels · Timers  │
│  Alert keywords · WB filter words · Proxy chain · All config│
└──────────────────────┬───────────────────────────────────────┘
                       │ CONFIG object
       ┌───────────────┼───────────────────┐
       ▼               ▼                   ▼
  ┌─────────┐    ┌──────────┐       ┌───────────┐
  │ utils.js│    │settings.js│      │  resize.js │
  │Constants│    │localStorage│     │Column drag │
  │Helpers  │    │User prefs  │     │Persistence │
  │Sound API│    └─────┬──────┘     └────────────┘
  │XML Parse│          │
  └────┬────┘          │
       │    ┌──────────┴──────────────────────┐
       │    │         Module Layer             │
       │    │                                  │
       ▼    ▼                                  ▼
  ┌──────────┐  ┌──────────┐  ┌──────┐  ┌─────────┐
  │ feeds.js │  │weather.js│  │map.js│  │xfeed.js │
  │ RSS fetch│  │WeatherAPI│  │D3.js │  │X embeds │
  │ 3 proxies│  │Open-Meteo│  │GeoJSON│ │(toggle) │
  │ Classify │  │ fallback │  │4 srcs │ └─────────┘
  │ WB filter│  └──────────┘  │Pings  │
  │ Urgency  │                └───────┘
  └────┬─────┘
       │ news items
       ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ticker.js │  │alerts.js │  │  app.js   │
  │Scroll bar│  │Breaking  │  │Clock, TV │
  │Headlines │  │popup+snd │  │Init, glue│
  └──────────┘  └──────────┘  └──────────┘

  ┌────────────────────────────────────────┐
  │         index.html + style.css         │
  │  3-column grid · Panels · Modals      │
  │  Scanlines · Animations · Responsive  │
  └────────────────────────────────────────┘
```

### Data Flow

```
RSS Feeds (20+)                    WeatherAPI.com
     │                                  │
     ▼                                  ▼
rss2json.com ──fail──▶ allorigins ──fail──▶ corsproxy
     │                                  │
     ▼                                  ▼
  WB Keyword Filter               Fallback: Open-Meteo
     │
     ▼
  Category Classifier (14 cats)
     │
     ▼
  District Detector (23 districts + 60 sub-areas)
     │
     ▼
  Urgency Analyzer (critical / alert / normal)
     │
     ├──▶ Ticker Bar (scrolling headlines)
     ├──▶ Master Feed (filterable cards)
     ├──▶ Category Panels (collapsible)
     ├──▶ Politics Feed (centre column)
     ├──▶ Map Pings (animated district pulses)
     └──▶ Breaking Alert (popup + alarm sound)
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Markup** | HTML5 (semantic, single `index.html`) |
| **Styling** | CSS3 (custom properties, grid, flexbox, animations, day/night themes) |
| **Logic** | Vanilla JavaScript ES6+ (zero frameworks, zero dependencies at runtime) |
| **Maps** | [D3.js v7.8.5](https://d3js.org/) (loaded from CDN) |
| **Weather** | [WeatherAPI.com](https://www.weatherapi.com/) (primary) + [Open-Meteo](https://open-meteo.com/) (fallback) |
| **RSS Proxy** | [rss2json.com](https://rss2json.com/) + [allorigins.win](https://allorigins.win/) + [corsproxy.io](https://corsproxy.io/) |
| **Fonts** | [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) + [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) (Google Fonts) |
| **Sound** | Web Audio API (built-in, no external files) |
| **Social** | X (Twitter) embed widget (toggleable) |
| **Video** | YouTube iframe embed (click-to-load) |
| **Hosting** | [Netlify](https://www.netlify.com/) (free tier, auto-deploy from GitHub) |
| **AI Assist** | [Claude by Anthropic](https://www.anthropic.com/claude) (architecture, code generation, debugging) |

**Zero build tools. Zero npm. Zero webpack. Zero backend. Pure browser-runnable code.**

---

## 📁 File Structure

```
wbintel/
├── index.html          # Main HTML — layout, panels, modals
├── css/
│   └── style.css       # Complete stylesheet — dark/day themes, all components
└── js/
    ├── config.js       # ⭐ CENTRAL CONFIG — edit THIS file for everything
    ├── utils.js        # Categories, districts, helpers, sound engine, XML parser
    ├── settings.js     # User preferences (localStorage) — reads defaults from config
    ├── resize.js       # Draggable column dividers
    ├── weather.js      # WeatherAPI + Open-Meteo fallback
    ├── map.js          # D3.js district map + ping animations
    ├── feeds.js        # RSS aggregation with 3-proxy fallback chain
    ├── xfeed.js        # X (Twitter) embed integration
    ├── ticker.js       # Scrolling headline ticker
    ├── alerts.js       # Breaking news popup + alarm
    └── app.js          # Main init, clock, TV, theme, orchestration
```

---

## 🚀 Getting Started

### Option 1: Just Visit It
> **[wbintel.netlify.app](https://wbintel.netlify.app/)** — open on desktop/laptop, works instantly.

### Option 2: Deploy Your Own

1. **Fork** this repo
2. Go to [app.netlify.com](https://app.netlify.com/) → Import from GitHub → select `wbintel`
3. Leave build settings empty → Deploy
4. Done. Your own instance is live in 15 seconds.

### Option 3: Run Locally

```bash
git clone https://github.com/konkomaji/wbintel.git
cd wbintel
# Open index.html in any browser — that's it
# Or use a local server:
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Customizing

Open `js/config.js` — everything is there:
- Paste API keys
- Add/remove RSS feeds
- Change weather cities
- Add YouTube channels
- Enable/disable X embeds
- Adjust refresh intervals

---

## 📋 Case Study: Why WBIntel Exists

### The Problem

West Bengal is a state with **100 million people**, **23 districts**, and an incredibly active political, economic, and social landscape. For journalists, analysts, and researchers, keeping track of what's happening requires monitoring dozens of sources across multiple languages — switching between news apps, Twitter, TV, weather sites, and government portals.

There was no single tool that aggregated **all** of this into one real-time interface.

### The Approach

WBIntel was designed as a **broadcast monitoring tool** — inspired by the dense, always-on screens you'd see in a TV news control room or a financial trading floor. Maximum information density, zero fluff.

Key design decisions:
- **Zero backend** — runs entirely in the browser, deployable by anyone for free
- **Central config** — one file controls everything, no hunting through code
- **Fallback chains** — every external dependency has at least one backup
- **WB relevance filter** — 80+ keywords (including Bengali) ensure only West Bengal content surfaces
- **District-level awareness** — 23 districts + 60 sub-area mappings for geographic intelligence

### The Result

A living, breathing state monitor that:
- Aggregates 20+ RSS feeds into categorized, searchable, filterable streams
- Maps news to specific districts with animated visualization
- Provides real-time weather for all 4 WB administrative divisions
- Runs 24/7 on a free Netlify instance with zero maintenance
- Can be forked and customized for any Indian state in under an hour

### Metrics
- **20+** RSS feed sources
- **14** news categories
- **23** district-level geographic tracking
- **80+** WB relevance keywords (English + Bengali)
- **4** GeoJSON map fallback sources
- **3** RSS proxy fallback services
- **0** backend servers needed
- **0** cost to host

---

## ⚠ Known Limitations

| Issue | Status | Workaround |
|---|---|---|
| RSS feeds depend on free proxy services | Rate limits possible | 3-proxy fallback chain; add rss2json API key in config.js |
| X (Twitter) embeds unreliable on some deploys | Disabled by default | Enable via `CONFIG.x.enabled = true` |
| YouTube Live streams may show "unavailable" | Channel-dependent | Bengali news channels don't all run 24/7 live |
| Mobile layout not optimized | Desktop-first design | Popup warns mobile users; works but cramped |
| Bengali-language RSS feeds limited | Few offer RSS | Adding more as discovered |
| GeoJSON district names vary across sources | Universal parser handles most | Some obscure spellings may not match |

---

## 🔮 Roadmap & Future Plans

### 🗳 Upcoming: Election & Political Chaos Monitor
> **Dedicated sub-dashboard for the 2026 West Bengal Legislative Assembly Election**

- Constituency-level tracking (294 seats)
- Candidate database with party affiliation
- Rally and event tracker with map visualization
- Real-time sentiment analysis of political coverage
- Historical election data overlay
- Coalition and alliance tracker
- MCC (Model Code of Conduct) violation monitor
- Exit poll aggregator

### Other Planned Features
- [ ] **NewsAPI.org integration** — richer news sources with user API key
- [ ] **GNews / Currents API** — additional news aggregation
- [ ] **Telegram channel feeds** — hyperlocal news via rsshub.app
- [ ] **Google News RSS** — Bengali and English WB news
- [ ] **Finance widget** — SENSEX, NIFTY, Gold, USD/INR live ticker
- [ ] **AlphaVantage integration** — stock data for WB-based companies
- [ ] **Notification system** — browser push notifications for breaking news
- [ ] **PWA support** — installable on desktop, offline capability
- [ ] **Data export** — download filtered news as CSV/JSON
- [ ] **Multi-state support** — fork-friendly architecture for other Indian states
- [ ] **Bengali language UI** — full interface translation
- [ ] **AI-powered summarization** — Claude API for auto-summarizing news clusters
- [ ] **Historical archive** — IndexedDB-based local news archive with search

---

## 🤝 Contributing

**WBIntel is open source and welcomes contributions!**

### How to Contribute

1. **Fork** the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

### We Need Help With

| Area | What's Needed |
|---|---|
| 🗞 **RSS Feeds** | Bengali news agency RSS URLs — Anandabazar, Ei Samay, Bartaman, Sangbad Pratidin |
| 📺 **YouTube IDs** | Confirmed 24/7 live stream channel IDs for Bengali news |
| 🗺 **Map Data** | Updated GeoJSON with 2024 district boundaries (if any new districts added) |
| 🌐 **Bengali Keywords** | More Bengali-language keywords for better WB relevance filtering |
| 📱 **Mobile Layout** | Responsive design for tablet/mobile (current is desktop-only) |
| 🧪 **Testing** | Cross-browser testing (Safari, Firefox, Edge) |
| 📝 **Documentation** | Tutorials, setup guides, video walkthroughs |
| 🎨 **Design** | UI/UX improvements, accessibility, colour contrast |
| 🗳 **Election Module** | 2026 WB election data — constituency GeoJSON, candidate databases |

### Ideas Welcome!
Open an [Issue](https://github.com/konkomaji/wbintel/issues) with the tag `idea` — all suggestions are appreciated.

---

## 🙏 Credits & Acknowledgements

### Built With AI Assistance
This project was built with significant help from **[Claude](https://www.anthropic.com/claude) by [Anthropic](https://www.anthropic.com/)** — from architecture design and code generation to debugging and optimization. Claude served as a collaborative coding partner throughout the development process.

### Open Data & Public APIs
| Source | Usage | License |
|---|---|---|
| [WeatherAPI.com](https://www.weatherapi.com/) | Real-time weather data | Free tier (1M calls/month) |
| [Open-Meteo](https://open-meteo.com/) | Weather fallback | Open-source, free |
| [rss2json.com](https://rss2json.com/) | RSS-to-JSON proxy | Free tier (10k/day) |
| [allorigins.win](https://allorigins.win/) | CORS proxy fallback | Open-source |
| [D3.js](https://d3js.org/) | Map rendering | BSD License |
| [udit-001/india-maps-data](https://github.com/udit-001/india-maps-data) | WB district GeoJSON (primary) | Public |
| [Subhash9325/GeoJson-Data-of-Indian-States](https://github.com/Subhash9325/GeoJson-Data-of-Indian-States) | GeoJSON fallback | Public |
| [datta07/INDIAN-SHAPEFILES](https://github.com/datta07/INDIAN-SHAPEFILES) | GeoJSON fallback | Public |
| [geohacker/india](https://github.com/geohacker/india) | GeoJSON fallback (all-India) | Public |
| [Google Fonts](https://fonts.google.com/) | Bebas Neue, JetBrains Mono, Source Sans 3 | Open Font License |
| [visitor-badge](https://visitor-badge.laobi.icu/) | Visitor counter | Free |

### RSS Feed Sources
NDTV, The Wire, Scroll.in, The Print, India Today, Times of India (Kolkata), Hindustan Times, News18, Indian Express, The Telegraph, Economic Times, Business Standard, Mint, Inc42, YourStory, LiveLaw, PIB (Kolkata), ET Health, ESPNcricinfo — all public RSS feeds.

---

## 📄 License

**MIT License** — free to use, modify, distribute. See [LICENSE](LICENSE) for details.

---

## 👤 Author

**Konko Maji**
- GitHub: [@konkomaji](https://github.com/konkomaji)
- Project: [github.com/konkomaji/wbintel](https://github.com/konkomaji/wbintel)

---

<p align="center">
  <strong>If WBIntel helps you stay informed, consider giving it a ⭐</strong><br>
  <sub>Built in Howrah, West Bengal 🇮🇳</sub>
</p>
