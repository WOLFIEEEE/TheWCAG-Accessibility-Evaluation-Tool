# TheWCAG Evaluation Extension

A comprehensive web accessibility evaluation tool that analyzes web pages against WCAG (Web Content Accessibility Guidelines) standards directly in your browser.

## Features

### Accessibility Analysis
- **100+ Accessibility Rules** covering WCAG 2.1 Level A, AA, and AAA
- **Real-time Evaluation** - analyze any webpage with one click
- **Visual Icon Indicators** - see issues directly on the page
- **Detailed Documentation** - learn about each issue and how to fix it

### Categories of Checks

| Category | Description |
|----------|-------------|
| **Errors** | Critical accessibility issues that must be fixed (missing alt text, missing labels, etc.) |
| **Alerts** | Items that may need attention (suspicious text, structure issues, etc.) |
| **Features** | Good accessibility practices detected (proper labels, landmarks, etc.) |
| **Structure** | Structural elements like headings, lists, and landmarks |
| **ARIA** | ARIA attributes and live regions |
| **Contrast** | Color contrast issues |

### Sidebar Panels

1. **Details** - Summary and categorized list of all findings
2. **Reference** - Documentation for each rule
3. **Order** - Navigation/tab order visualization
4. **Structure** - Heading outline and landmarks
5. **Contrast** - Color contrast checker tool

### Additional Features

- Keyboard shortcut: `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac)
- Context menu: Right-click → "Evaluate this page with TheWCAG"
- Toggle page styles on/off
- Desaturate page to check grayscale contrast
- AIM Score (0-10 accessibility rating)

## Installation

### Development

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode

```bash
npm run dev
```

This will watch for file changes and rebuild automatically.

## Project Structure

```
thewcag-extension/
├── src/
│   ├── background/          # Service worker
│   ├── content/             # Content script (bridge)
│   ├── inject/              # Page analyzer (injected)
│   ├── sidebar/             # Sidebar UI
│   ├── rules/               # Accessibility rules
│   │   ├── errors/          # Error rules
│   │   ├── alerts/          # Alert rules
│   │   ├── features/        # Feature detection
│   │   ├── structure/       # Structure rules
│   │   ├── aria/            # ARIA rules
│   │   └── contrast/        # Contrast rules
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript types
├── assets/                  # Icons and images
├── styles/                  # CSS files
├── manifest.json           # Extension manifest
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Build and watch for changes |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |

## Rules Overview

### Error Rules (Critical)
- Missing image alt text
- Missing form labels
- Empty links and buttons
- Missing page language
- Insufficient color contrast
- Broken ARIA references

### Alert Rules (Review)
- Suspicious alt text
- Redundant links
- Skipped heading levels
- Very small text
- Positive tabindex

### Feature Rules (Good Practices)
- Alt text present
- Form labels present
- Skip navigation links
- Page language defined

### Structure Rules
- Headings (H1-H6)
- Landmarks (header, nav, main, footer, etc.)
- Lists (ul, ol, dl)
- Data tables

### ARIA Rules
- aria-label
- aria-describedby
- aria-expanded
- Live regions

## WCAG Guidelines Covered

- 1.1.1 Non-text Content (Level A)
- 1.3.1 Info and Relationships (Level A)
- 1.4.3 Contrast (Minimum) (Level AA)
- 1.4.4 Resize Text (Level AA)
- 2.1.1 Keyboard (Level A)
- 2.4.1 Bypass Blocks (Level A)
- 2.4.2 Page Titled (Level A)
- 2.4.3 Focus Order (Level A)
- 2.4.4 Link Purpose (Level A)
- 3.1.1 Language of Page (Level A)
- 4.1.2 Name, Role, Value (Level A)
- And many more...

## Technology Stack

- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundling
- **Chrome Extension Manifest V3** - Latest extension format
- **Jest** - Testing framework

## Browser Support

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details.

## Links

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [W3C Web Accessibility Initiative](https://www.w3.org/WAI/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

