# Contributing to TheWCAG Evaluation Extension

Thank you for your interest in contributing to TheWCAG Evaluation Extension! This document provides guidelines and information for contributors.

## 🏗️ Project Structure

```
thewcag-extension/
├── src/
│   ├── background/          # Service worker (extension background script)
│   ├── content/              # Content script (injected into pages)
│   ├── inject/               # Analyzer script (page-level accessibility checks)
│   ├── sidebar/              # Sidebar UI components
│   ├── rules/                # Accessibility rules organized by category
│   │   ├── errors/           # Error rules (WCAG failures)
│   │   ├── alerts/           # Alert rules (potential issues)
│   │   ├── features/         # Feature detection rules
│   │   ├── structure/        # Structural element rules
│   │   ├── aria/             # ARIA-related rules
│   │   ├── contrast/         # Color contrast rules
│   │   ├── keyboard/         # Keyboard accessibility rules
│   │   ├── mobile/           # Touch/mobile accessibility rules
│   │   └── media/            # Media accessibility rules
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Shared utilities
│   └── workers/              # Web workers for background processing
├── tests/
│   ├── unit/                 # Unit tests
│   └── e2e/                  # End-to-end tests
├── styles/                   # CSS stylesheets
├── assets/                   # Icons and images
├── _locales/                 # Internationalization files
└── scripts/                  # Build scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/thewcag/thewcag-extension.git
   cd thewcag-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 📝 Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Build in development mode with watch |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run validate` | Run all checks (typecheck + lint + test) |

### Adding New Rules

1. Create a new file in the appropriate `src/rules/` subdirectory
2. Use the `createRule` helper function
3. Export the rule array
4. Import and add to `src/rules/index.ts`

Example rule:

```typescript
import { AccessibilityRule, RuleResult } from '../../types';
import { createRule } from '../index';

const myNewRule: AccessibilityRule = createRule(
  'rule_id',           // Unique ID
  'Rule Name',         // Display name
  'error',             // Category: error|alert|feature|structure|aria|contrast
  {
    description: 'Description of what this rule checks',
    impact: 'serious', // critical|serious|moderate|minor|none
    wcagCriteria: ['1.1.1'], // WCAG criteria IDs
    wcagLevel: 'A',    // A|AA|AAA
    tags: ['images', 'content'],
    evaluate: (element: Element, context): RuleResult | null => {
      // Your evaluation logic here
      // Return RuleResult if issue found, null otherwise
    },
    documentation: {
      summary: 'Brief explanation',
      purpose: 'Why this matters for accessibility',
      actions: ['How to fix step 1', 'How to fix step 2'],
      algorithm: 'How the rule detects issues',
      guidelines: [
        {
          id: '1.1.1',
          name: 'Non-text Content',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        },
      ],
    },
  }
);

export const myNewRules: AccessibilityRule[] = [myNewRule];
```

### Testing

Write tests in `tests/unit/` or `tests/e2e/`:

```typescript
describe('My Feature', () => {
  it('should do something', () => {
    expect(something).toBe(true);
  });
});
```

## 🎨 Code Style

- Use TypeScript for all source files
- Follow ESLint and Prettier configurations
- Use JSDoc comments for public functions
- Write descriptive commit messages

## 📦 Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run `npm run validate` to ensure all checks pass
5. Commit with a descriptive message
6. Push to your fork
7. Open a Pull Request

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated if needed
- [ ] All tests pass
- [ ] No new linting errors

## 🐛 Bug Reports

When reporting bugs, please include:

1. Browser and version
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Console errors (if any)
6. Screenshots (if applicable)

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check existing issues first
2. Describe the use case
3. Explain the expected behavior
4. Consider accessibility implications

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

