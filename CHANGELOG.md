# Changelog

All notable changes to WBIntel are documented here.

## [7.3] — 2026-03-06

### Added
- **Central `config.js`** — single source of truth for all APIs, feeds, keys, sources, timers
- Future API placeholders (GNews, MediaStack, Currents, AlphaVantage, Google News RSS, Telegram)
- CONFIG object is frozen to prevent accidental mutation

### Changed
- All modules now read exclusively from `CONFIG` object
- Script load order: `config.js` loads first, everything depends on it

## [7.2] — 2026-03-06

### Fixed
- **District map**: Universal property name detection (checks 20+ GeoJSON property patterns)
- **Map**: State-level feature filter — removes "West Bengal" boundary polygon, keeps only districts
- **Map**: Validation gate — requires 10+ features before accepting a source

## [7.1] — 2026-03-06

### Fixed
- **RSS feeds**: Added 3-proxy fallback chain (rss2json → allorigins → corsproxy)
- **RSS feeds**: Added XML parser for fallback proxies returning raw RSS
- **RSS feeds**: Batched requests (3 at a time) with delays to avoid rate limiting
- **RSS feeds**: 48-hour filter — skips stale items
- **Ticker**: Fixed scroll animation (inline style instead of class toggle)
- **X embeds**: Temporarily disabled (controlled by `CONFIG.x.enabled`)

### Added
- Loading states ("Fetching feeds… 10-15 sec…") in all panels
- Console debug logging for feed success/failure counts

## [7.0] — 2026-03-06

### Added
- Breaking news alert popup with red flashing bar + alarm sound
- Sound effects via Web Audio API (ping, alert, map ping)
- News urgency badges (CRITICAL / ALERT) on cards
- Quick search bar across all news items
- Day/Night theme toggle with localStorage persistence
- Mobile warning popup for screens under 1024px
- Visitor counter badge (visitor-badge.laobi.icu)
- District activity strip below map
- 12-hour clock with AM/PM + current date display
- WeatherAPI.com integration with AQI for WB's 4 divisions

### Changed
- All text colours brightened for better readability
- Politics panel moved to top of centre column
- Config panel replaced with simple Settings panel
- X (Twitter) renamed throughout the interface
- RSS feeds, API keys, channels all hardcoded (not user-configurable)

## [6.0] — 2026-03-05

### Initial Release
- 3-column grid dashboard with draggable dividers
- RSS feed aggregation with WB keyword filtering
- D3.js district map with 23 districts
- Open-Meteo weather for 4 WB cities
- Twitter/X embed widget (profile + keyword feeds)
- YouTube Live TV (click-to-load)
- Full config panel with localStorage persistence
- Category-coded news cards (14 categories)
- Scrolling ticker bar
- Deploy guide modal
- MIT License
