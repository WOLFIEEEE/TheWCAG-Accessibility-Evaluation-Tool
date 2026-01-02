# TheWCAG Evaluation Extension

<p align="center">
  <img src="assets/icons/icon128.png" alt="TheWCAG Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A powerful Chrome extension for evaluating web accessibility using WCAG guidelines.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a> •
  <a href="#rules">Rules</a> •
  <a href="#license">License</a>
</p>

---

## Overview

TheWCAG Evaluation Extension helps developers, designers, and accessibility professionals identify accessibility issues on web pages. It provides comprehensive WCAG 2.1 compliance checking with detailed reports, visual indicators, and actionable recommendations.

## Features

### 🔍 Comprehensive Accessibility Scanning
- **113 Accessibility Rules** covering WCAG 2.1 guidelines
- Six categories: Errors, Alerts, Features, Structure, ARIA, and Contrast
- Real-time page evaluation

### 📊 Detailed Results Panel
- **Details Tab**: Summary counts and itemized issues
- **Reference Tab**: Documentation for each rule with WCAG guidelines
- **Order Tab**: Tab/navigation order visualization
- **Structure Tab**: Heading hierarchy and landmark regions
- **Contrast Tab**: Color contrast checker with WCAG AA/AAA validation

### 🎯 Visual Indicators
- On-page icons marking accessibility issues
- Element highlighting with smooth scrolling
- Hover tooltips with quick issue summaries

### 🛠️ Developer Tools
- Style toggle to view page without CSS
- Page desaturation for color blindness simulation
- AIM Score accessibility metric (0-10 scale)

### ⌨️ Keyboard Accessible
- Full keyboard navigation support
- Keyboard shortcut: `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac)
- Context menu integration

---

## Installation

### From Chrome Web Store
*Coming soon*

### Manual Installation (Developer Mode)

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/thewcag-extension.git
   cd thewcag-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   # Development build (with source maps)
   npm run build:dev
   
   # Production build (minified)
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the `dist` folder from the project directory

5. **Verify Installation**
   - You should see the TheWCAG icon in your Chrome toolbar
   - Click the icon or press `Ctrl+Shift+U` to activate

---

## Usage

### Quick Start

1. **Navigate** to any webpage you want to evaluate
2. **Activate** the extension by:
   - Clicking the TheWCAG icon in the toolbar, OR
   - Pressing `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac), OR
   - Right-clicking and selecting "Evaluate this page with TheWCAG"
3. **Review** the results in the sidebar panel

### Understanding the Results

#### Summary Section
The top of the sidebar shows counts for each category:

| Icon | Category | Description |
|------|----------|-------------|
| 🔴 | **Errors** | Critical accessibility failures that must be fixed |
| 🔴 | **Contrast** | Color contrast issues failing WCAG requirements |
| 🟡 | **Alerts** | Potential issues requiring manual review |
| 🟢 | **Features** | Positive accessibility features detected |
| 🔵 | **Structure** | Structural/semantic elements found |
| 🟣 | **ARIA** | ARIA attributes and roles detected |

#### AIM Score
The Accessibility Impact Metric (AIM) score ranges from 0-10:
- **8-10**: Excellent accessibility
- **5-7**: Good, but needs improvement
- **3-4**: Significant issues present
- **0-2**: Critical accessibility problems

### Panel Features

#### Details Tab
- View all detected issues grouped by category
- Click any item to highlight the element on the page
- Toggle checkboxes to show/hide specific rule icons
- Click 📖 to view rule documentation

#### Reference Tab
- Detailed documentation for each rule
- **What It Means**: Description of the issue
- **Why It Matters**: Impact on users
- **What To Do**: Remediation steps
- **The Algorithm**: How the rule detects issues
- **WCAG Guidelines**: Related success criteria

#### Order Tab
- View tab navigation order
- See accessible names and roles
- Click items to highlight on page

#### Structure Tab
- Visual heading hierarchy (H1-H6)
- Landmark regions (main, nav, footer, etc.)
- Identify structural issues

#### Contrast Tab
- Manual color contrast checker
- Enter foreground/background colors
- View WCAG AA and AAA compliance
- Lightness adjustment sliders
- Desaturate page option

### Toolbar Options

- **Styles Toggle**: Enable/disable page stylesheets
- **Sidebar Toggle**: Collapse/expand the sidebar (◀/▶ button)

---

## Development

### Prerequisites

- Node.js 18+ 
- npm 9+
- Chrome browser

### Project Structure

```
thewcag-extension/
├── assets/
│   └── icons/           # Extension icons (SVG & PNG)
├── dist/                # Built extension (gitignored)
├── scripts/
│   └── generate-icons.js # PNG icon generation script
├── src/
│   ├── background/
│   │   └── service-worker.ts    # Background service worker
│   ├── content/
│   │   └── content-script.ts    # Content script (bridge)
│   ├── inject/
│   │   └── analyzer.ts          # Page analyzer & sidebar
│   ├── rules/
│   │   ├── alerts/              # Alert rules
│   │   ├── aria/                # ARIA rules
│   │   ├── contrast/            # Contrast rules
│   │   ├── errors/              # Error rules
│   │   ├── features/            # Feature rules
│   │   ├── structure/           # Structure rules
│   │   └── index.ts             # Rule engine
│   ├── sidebar/
│   │   ├── sidebar.html         # Sidebar UI
│   │   └── sidebar.ts           # Sidebar logic
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── utils/
│       ├── color-utils.ts       # Color/contrast utilities
│       ├── dom-utils.ts         # DOM utilities
│       └── messaging.ts         # Messaging utilities
├── styles/
│   └── sidebar.css              # Sidebar styles
├── manifest.json                # Extension manifest
├── package.json
├── tsconfig.json
└── webpack.config.js
```

### Available Scripts

```bash
# Install dependencies
npm install

# Development build (with source maps)
npm run build:dev

# Production build (minified)
npm run build

# Watch mode for development
npm run watch

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Generate PNG icons from SVG
npm run generate-icons
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/thewcag-extension.git
cd thewcag-extension

# Install dependencies
npm install

# Generate icons
npm run generate-icons

# Build for development
npm run build:dev

# The built extension will be in the 'dist' folder
```

### Architecture

The extension uses Chrome's Manifest V3 architecture:

1. **Service Worker** (`service-worker.ts`)
   - Manages extension lifecycle
   - Handles messaging between components
   - Controls icon state and context menus

2. **Content Script** (`content-script.ts`)
   - Bridge between service worker and page context
   - Forwards messages via custom events

3. **Analyzer** (`analyzer.ts`)
   - Injected into page context
   - Runs accessibility evaluation
   - Creates sidebar and icons
   - Handles user interactions

4. **Sidebar** (`sidebar.ts`)
   - Displays results in iframe
   - Manages tab navigation
   - Handles contrast checker

### Adding New Rules

1. Create rule in appropriate category file (e.g., `src/rules/errors/index.ts`)
2. Use the `createRule` helper:

```typescript
const myNewRule: AccessibilityRule = createRule(
  'rule_id',           // Unique identifier
  'Rule Name',         // Display name
  'error',             // Category: error|alert|feature|structure|aria|contrast
  {
    description: 'What the rule checks',
    impact: 'critical', // critical|serious|moderate|minor
    wcagCriteria: ['1.1.1', '2.4.4'],
    check: (document) => {
      const results: RuleResult[] = [];
      // Your detection logic here
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
```

3. Export the rule in the category's `index.ts`
4. The rule will automatically be included in evaluations

---

## Rules

### Error Rules (28)
Critical accessibility failures:
- Missing alt text on images
- Empty links and buttons
- Missing form labels
- Empty headings
- Missing document language
- And more...

### Alert Rules (37)
Potential issues requiring review:
- Suspicious alt text
- Redundant links
- Small text
- Justified text
- Missing first heading
- And more...

### Feature Rules (13)
Positive accessibility features:
- Alt text present
- Form labels
- Language attributes
- Skip links
- And more...

### Structure Rules (24)
Structural elements:
- Headings (H1-H6)
- Lists
- Tables
- Regions
- And more...

### ARIA Rules (10)
ARIA implementation:
- ARIA labels
- Roles
- States and properties
- And more...

### Contrast Rules (3)
Color contrast checking:
- Contrast errors
- Contrast pass
- Enhanced contrast

---

## Color Theme

TheWCAG uses a warm, professional color palette inspired by [thewcag.com](https://thewcag.com):

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Orange | `#A85A3B` | Headers, buttons, accents |
| Secondary Orange | `#D4713D` | Highlights, focus states |
| Cream | `#F9F7F4` | Backgrounds |
| White | `#FFFFFF` | Panels, cards |
| Dark Text | `#1A1A1A` | Body text |

---

## Browser Support

- ✅ Google Chrome (v88+)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave Browser
- ⚠️ Firefox (Manifest V3 support in development)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- TypeScript for all source files
- ESLint + Prettier for formatting
- Run `npm run lint` before committing

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Links

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [W3C Web Accessibility Initiative](https://www.w3.org/WAI/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [TheWCAG.com](https://thewcag.com)

---

## Changelog

### v1.0.0 (Initial Release)
- Complete WCAG evaluation engine with 113 rules
- Interactive sidebar with 5 tabs
- Visual icon overlay system
- Contrast checker with WCAG AA/AAA
- Heading and landmark structure
- Tab navigation order inspection
- TheWCAG.com branded color theme

---

<p align="center">
  Made with ❤️ for web accessibility
</p>
