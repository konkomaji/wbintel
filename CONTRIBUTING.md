# Contributing to WBIntel

Thank you for your interest in contributing to WBIntel! Every contribution helps make this tool better for journalists, analysts, and researchers across West Bengal.

## How to Contribute

### 1. Report Issues
Found a bug? RSS feed not working? Map rendering wrong?
- Open an [Issue](https://github.com/konkomaji/wbintel/issues)
- Include your browser, screen resolution, and console errors (F12 → Console)

### 2. Suggest Features
Have an idea?
- Open an Issue with the `idea` tag
- Describe the feature, who it helps, and how it might work

### 3. Submit Code

```bash
# Fork the repo
# Clone your fork
git clone https://github.com/YOUR_USERNAME/wbintel.git
cd wbintel

# Create a branch
git checkout -b feature/your-feature-name

# Make changes
# Test by opening index.html in a browser

# Commit
git commit -m "Add: description of what you did"

# Push
git push origin feature/your-feature-name

# Open a Pull Request on GitHub
```

### 4. Add RSS Feeds
Know a Bengali news agency with RSS? Add it to `js/config.js`:
```javascript
{ url: 'https://example.com/rss', label: 'News Agency Name' },
```

### 5. Add Bengali Keywords
Help improve WB relevance filtering — add keywords to `CONFIG.wbKeywords` in `config.js`.

## Code Guidelines

- **No build tools** — must work by opening `index.html` in a browser
- **No npm/node** — pure browser JavaScript
- **All config in `config.js`** — no hardcoded values elsewhere
- **Error handling** — every fetch must have fallback or error state
- **Comments** — explain non-obvious logic

## Priority Areas

- Bengali-language RSS feed discovery
- Mobile responsive layout
- 2026 WB Election monitoring module
- Cross-browser testing
- Accessibility improvements

## Code of Conduct

Be respectful, constructive, and inclusive. We're building a tool for public good.
