<p align="center">
  <img src="assets/icons/icon128.png" alt="TheWCAG Logo" width="120" height="120">
</p>

<h1 align="center">TheWCAG Accessibility Evaluation Tool</h1>

<p align="center">
  <strong>🔍 Professional Chrome Extension for WCAG 2.2 Accessibility Testing</strong>
</p>

<p align="center">
  <a href="https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool/releases">
    <img src="https://img.shields.io/badge/version-1.0.0-orange?style=for-the-badge" alt="Version">
  </a>
  <a href="https://www.w3.org/WAI/WCAG22/quickref/">
    <img src="https://img.shields.io/badge/WCAG-2.2-green?style=for-the-badge" alt="WCAG 2.2">
  </a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/">
    <img src="https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge" alt="Manifest V3">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-purple?style=for-the-badge" alt="License">
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-development">Development</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 📖 Overview

**TheWCAG** is a powerful Chrome extension that helps developers, designers, and accessibility professionals evaluate web pages against **WCAG 2.2 guidelines**. It provides comprehensive accessibility testing with detailed reports, visual indicators, screen reader simulation, quick fix suggestions, and a compliance checklist covering all 87 WCAG 2.2 success criteria.

<p align="center">
  <img src="https://img.shields.io/badge/Rules-113+-informational?style=flat-square" alt="113+ Rules">
  <img src="https://img.shields.io/badge/WCAG_Criteria-87-success?style=flat-square" alt="87 Criteria">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tests-Jest-red?style=flat-square" alt="Jest">
</p>

---

## ✨ Features

### 🔍 Comprehensive Accessibility Scanning

| Category | Description | Icon |
|----------|-------------|------|
| **Errors** | Critical accessibility failures that must be fixed | 🔴 |
| **Contrast** | Color contrast issues failing WCAG requirements | 🎨 |
| **Alerts** | Potential issues requiring manual review | ⚠️ |
| **Features** | Positive accessibility features detected | ✅ |
| **Structure** | Structural/semantic elements found | 📐 |
| **ARIA** | ARIA attributes and roles detected | ♿ |

### 📋 WCAG 2.2 Compliance Checklist

- **87 Success Criteria** covering all WCAG 2.2 guidelines
- Filter by level: **A**, **AA**, **AAA**
- Filter by status: **Passed**, **Failed**, **Needs Review**, **Not Tested**
- **Compliance Score** with visual progress indicator
- NEW in 2.2 badge highlighting updated criteria

### 🎧 Screen Reader Preview

Simulate how screen readers interpret your page:

| Mode | Description |
|------|-------------|
| **Full** | Complete page content as announced |
| **Headings** | Navigation by heading structure |
| **Landmarks** | Page regions and landmarks |
| **Links** | All actionable links |
| **Forms** | Form controls and labels |

### 🔧 Quick Fix Code Snippets

Get instant, contextual code suggestions to fix accessibility issues:

- **30+ Quick Fix Templates** for common issues
- Automatic placeholder replacement with actual element values
- Copy-to-clipboard functionality
- Before/After code examples

### ⚙️ Ignore List & Custom Rules

Personalize your accessibility testing:

- **Ignore Patterns** by CSS selector, domain, or rule ID
- **Custom Rules** with your own checks
- **Site Profiles** for per-site settings
- **Import/Export** settings as JSON

### 📊 Advanced Reporting

Export accessibility reports in multiple formats:

| Format | Description |
|--------|-------------|
| **JSON** | Full data for programmatic use |
| **CSV** | Spreadsheet-compatible format |
| **HTML** | Styled printable report |
| **EARL** | W3C standard RDF format |

### 🎨 Additional Features

| Feature | Description |
|---------|-------------|
| 🌓 **Dark Mode** | Automatic theme based on system preference |
| 🔍 **Element Inspector** | "Show Code" button to open DevTools on element |
| 🖼️ **Visual Indicators** | On-page icons marking accessibility issues |
| ⌨️ **Keyboard Navigation** | Full keyboard accessibility |
| 🌍 **Internationalization** | i18n-ready with locale support |
| ⚡ **Web Workers** | Background processing for performance |

---

## 📥 Installation

### Option 1: Download Release (Recommended)

1. Download `TheWCAG-Extension.zip` from [Releases](https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool/releases)
2. Extract the ZIP file
3. Open Chrome → `chrome://extensions/`
4. Enable **Developer mode** (toggle in top right)
5. Click **Load unpacked**
6. Select the extracted folder

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool.git
cd TheWCAG-Accessibility-Evaluation-Tool

# Install dependencies
npm install

# Build for production
npm run build

# Load the 'dist' folder in Chrome
```

### Verify Installation

✅ TheWCAG icon appears in Chrome toolbar  
✅ Press `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac) to activate  
✅ Right-click menu shows "Evaluate this page with TheWCAG"

---

## 🚀 Usage

### Quick Start

1. **Navigate** to any webpage
2. **Click** the TheWCAG icon or press `Ctrl+Shift+U` / `Cmd+Shift+U`
3. **Review** results in the sidebar panel

### Sidebar Tabs

| Tab | Icon | Description |
|-----|------|-------------|
| **Details** | 📋 | Issue counts, categories, AIM score |
| **Reference** | 📖 | Documentation, Quick Fixes |
| **Order** | 🔢 | Tab navigation order |
| **Structure** | 🏗️ | Headings, Landmarks, Screen Reader Preview |
| **Contrast** | 🎨 | Color contrast checker |
| **WCAG 2.2** | ✓ | Compliance checklist |
| **Settings** | ⚙️ | Ignore patterns, Custom rules |

### AIM Score (Accessibility Impact Metric)

| Score | Rating | Description |
|-------|--------|-------------|
| 8-10 | 🟢 Excellent | Highly accessible |
| 5-7 | 🟡 Good | Minor improvements needed |
| 3-4 | 🟠 Needs Work | Significant issues present |
| 0-2 | 🔴 Critical | Major accessibility barriers |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+U` / `Cmd+Shift+U` | Toggle extension |
| `Tab` / `Shift+Tab` | Navigate sidebar |
| `Enter` / `Space` | Activate buttons |
| `Escape` | Close popups |

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+
- Chrome browser

### Scripts

```bash
# Install dependencies
npm install

# Development build (with source maps)
npm run build:dev

# Production build (minified)
npm run build

# Watch mode
npm run watch

# Run tests
npm test

# Linting
npm run lint
npm run lint:fix

# Generate icons
npm run generate-icons
```

### Project Structure

```
thewcag-extension/
├── 📁 _locales/              # Internationalization
│   └── en/messages.json
├── 📁 assets/
│   └── icons/                # Extension icons (SVG & PNG)
├── 📁 dist/                  # Built extension (gitignored)
├── 📁 docs/                  # Documentation
│   └── API.md
├── 📁 src/
│   ├── 📁 background/
│   │   └── service-worker.ts       # Background service worker
│   ├── 📁 content/
│   │   └── content-script.ts       # Content script bridge
│   ├── 📁 data/
│   │   ├── quick-fixes.ts          # Quick fix templates
│   │   └── wcag-2.2-criteria.ts    # WCAG 2.2 database
│   ├── 📁 inject/
│   │   └── analyzer.ts             # Page analyzer
│   ├── 📁 rules/
│   │   ├── alerts/                 # Alert rules
│   │   ├── aria/                   # ARIA rules
│   │   ├── contrast/               # Contrast rules
│   │   ├── errors/                 # Error rules
│   │   ├── features/               # Feature rules
│   │   ├── keyboard/               # Keyboard rules
│   │   ├── media/                  # Media rules
│   │   ├── mobile/                 # Mobile rules
│   │   ├── structure/              # Structure rules
│   │   └── index.ts                # Rule engine
│   ├── 📁 sidebar/
│   │   ├── sidebar.html            # Sidebar UI
│   │   └── sidebar.ts              # Sidebar logic
│   ├── 📁 types/
│   │   └── index.ts                # TypeScript types
│   ├── 📁 utils/
│   │   ├── accessibility-tree.ts   # A11y tree builder
│   │   ├── cleanup-manager.ts      # Resource cleanup
│   │   ├── color-utils.ts          # Color utilities
│   │   ├── compliance-checker.ts   # Compliance checker
│   │   ├── contrast.ts             # Contrast calculations
│   │   ├── custom-rules.ts         # Custom rule engine
│   │   ├── dom-utils.ts            # DOM utilities
│   │   ├── error-handler.ts        # Error handling
│   │   ├── fix-generator.ts        # Fix generator
│   │   ├── i18n.ts                 # Internationalization
│   │   ├── ignore-filter.ts        # Ignore filter
│   │   ├── messaging.ts            # Messaging utilities
│   │   ├── report-generator.ts     # Report generator
│   │   ├── sanitize.ts             # XSS prevention
│   │   ├── screen-reader-simulator.ts # Screen reader sim
│   │   ├── settings-manager.ts     # Settings manager
│   │   └── worker-manager.ts       # Web worker manager
│   └── 📁 workers/
│       └── evaluation-worker.ts    # Evaluation worker
├── 📁 styles/
│   ├── features.css                # Feature styles
│   └── sidebar.css                 # Sidebar styles
├── 📁 tests/
│   ├── setup.ts                    # Test setup
│   └── unit/                       # Unit tests
├── 📄 manifest.json
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 webpack.config.js
├── 📄 jest.config.js
└── 📄 CONTRIBUTING.md
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Chrome Browser                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                        │
│  │  Service Worker │ ◄──── Manages lifecycle, routing       │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐      ┌─────────────────┐               │
│  │ Content Script  │◄────►│   Web Worker    │               │
│  └────────┬────────┘      └─────────────────┘               │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐      ┌─────────────────┐               │
│  │    Analyzer     │◄────►│    Sidebar      │               │
│  │  (Page Context) │      │    (iframe)     │               │
│  └─────────────────┘      └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Adding New Rules

```typescript
import { createRule, AccessibilityRule, RuleResult } from '../index';

const myNewRule: AccessibilityRule = createRule(
  'my_rule_id',        // Unique identifier
  'My Rule Name',      // Display name
  'error',             // Category: error|alert|feature|structure|aria|contrast
  {
    description: 'What the rule checks',
    impact: 'critical', // critical|serious|moderate|minor
    wcagCriteria: ['1.1.1', '2.4.4'],
    check: (document) => {
      const results: RuleResult[] = [];
      // Detection logic
      return results;
    },
    documentation: {
      summary: 'Brief description',
      purpose: 'Why this matters',
      actions: ['Step 1', 'Step 2'],
      algorithm: 'How it works',
      guidelines: [
        { id: '1.1.1', name: 'Non-text Content', level: 'A', url: '...' }
      ],
    },
  }
);

export { myNewRule };
```

---

## 📊 Rules Overview

### Coverage by Category

| Category | Count | Focus Area |
|----------|-------|------------|
| 🔴 **Errors** | 28 | Missing alt, empty links, form labels |
| ⚠️ **Alerts** | 37 | Suspicious alt, small text, redundant links |
| ✅ **Features** | 13 | Alt text, labels, skip links |
| 📐 **Structure** | 24 | Headings, lists, tables, regions |
| ♿ **ARIA** | 10 | Roles, states, properties |
| 🎨 **Contrast** | 3 | AA/AAA compliance |
| ⌨️ **Keyboard** | 5 | Focus, tab order |
| 📱 **Mobile** | 4 | Touch targets, viewport |
| 🎬 **Media** | 3 | Captions, audio descriptions |

### WCAG 2.2 Criteria Coverage

| Level | Criteria | Description |
|-------|----------|-------------|
| **A** | 32 | Minimum accessibility requirements |
| **AA** | 24 | Standard compliance target |
| **AAA** | 31 | Enhanced accessibility |

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| 🟠 Primary | `#A85A3B` | Headers, buttons, accents |
| 🟡 Secondary | `#D4713D` | Highlights, focus states |
| ⬜ Background | `#F9F7F4` | Light mode background |
| ⬛ Dark | `#1E1E1E` | Dark mode background |
| 📝 Text | `#1A1A1A` | Body text |

### Dark Mode

The extension automatically adapts to your system preference:

```css
@media (prefers-color-scheme: dark) {
  /* Dark theme applied automatically */
}
```

---

## 🌍 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | v88+ required |
| Edge | ✅ Full | Chromium-based |
| Brave | ✅ Full | Chromium-based |
| Opera | ✅ Full | Chromium-based |
| Firefox | ⚠️ Partial | MV3 support developing |
| Safari | ❌ No | WebKit not supported |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit: `git commit -m 'feat: Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Jest for testing
- ✅ Conventional commits
- ✅ Documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Resources

| Resource | Link |
|----------|------|
| WCAG 2.2 Guidelines | [w3.org/WAI/WCAG22](https://www.w3.org/WAI/WCAG22/quickref/) |
| W3C WAI | [w3.org/WAI](https://www.w3.org/WAI/) |
| MDN Accessibility | [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/Accessibility) |
| TheWCAG Website | [thewcag.com](https://thewcag.com) |

---

## 📝 Changelog

### v1.0.0 (January 2026)

#### ✨ New Features
- **WCAG 2.2 Compliance Checklist** - All 87 success criteria with filtering
- **Screen Reader Preview** - Simulate screen reader output
- **Quick Fix Code Snippets** - Contextual code suggestions for 30+ rules
- **Ignore List & Custom Rules** - Personalize your testing
- **Settings Management** - Import/Export configuration
- **Dark Mode** - Automatic theme switching
- **Internationalization** - i18n-ready architecture
- **Report Export** - JSON, CSV, HTML, EARL formats
- **DevTools Integration** - "Show Code" button for element inspection
- **Web Workers** - Background processing for better performance

#### 🔧 Improvements
- 113+ accessibility rules across 9 categories
- Enhanced keyboard navigation
- Toast notifications for actions
- Loading states and animations
- Print-optimized styles
- Reduced motion support
- Robust error handling
- Memory leak prevention

#### 🐛 Bug Fixes
- Fixed sidebar visibility issues
- Resolved context invalidation errors
- Fixed scrolling in panels
- Corrected icon rendering
- Improved message passing reliability

---

<p align="center">
  <br>
  <img src="assets/icons/icon48.png" alt="TheWCAG" width="32">
  <br>
  <strong>Making the web accessible for everyone</strong>
  <br>
  <br>
  Made with ❤️ by the TheWCAG Team
</p>

<p align="center">
  <a href="https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool/issues">Report Bug</a>
  •
  <a href="https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool/issues">Request Feature</a>
  •
  <a href="https://thewcag.com">Website</a>
</p>
