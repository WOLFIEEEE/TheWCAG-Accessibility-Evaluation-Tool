# TheWCAG Extension API Documentation

## Overview

TheWCAG Evaluation Extension provides a comprehensive API for accessibility evaluation. This document covers the main modules and their exported functions.

## Modules

### Contrast Utilities (`src/utils/contrast.ts`)

Functions for color parsing, contrast calculation, and WCAG compliance checking.

#### `parseColor(color: string): RgbColor | null`

Parses a color string into RGB components.

```typescript
import { parseColor } from './utils/contrast';

parseColor('#FF0000');        // { r: 255, g: 0, b: 0 }
parseColor('rgb(255, 0, 0)'); // { r: 255, g: 0, b: 0 }
parseColor('red');            // { r: 255, g: 0, b: 0 }
```

#### `getContrastRatio(fg: RgbColor, bg: RgbColor): number`

Calculates the contrast ratio between two colors per WCAG 2.1.

```typescript
import { getContrastRatio } from './utils/contrast';

const black = { r: 0, g: 0, b: 0 };
const white = { r: 255, g: 255, b: 255 };
getContrastRatio(black, white); // ~21
```

#### `meetsWCAGAA(ratio: number, isLargeText?: boolean): boolean`

Checks if a contrast ratio meets WCAG 2.1 Level AA.

```typescript
meetsWCAGAA(4.5);        // true (normal text)
meetsWCAGAA(3.0, true);  // true (large text)
```

#### `meetsWCAGAAA(ratio: number, isLargeText?: boolean): boolean`

Checks if a contrast ratio meets WCAG 2.1 Level AAA.

```typescript
meetsWCAGAAA(7.0);        // true (normal text)
meetsWCAGAAA(4.5, true);  // true (large text)
```

#### `suggestColorFixes(fg: RgbColor, bg: RgbColor): ColorSuggestion[]`

Suggests alternative colors with improved contrast.

---

### Sanitization Utilities (`src/utils/sanitize.ts`)

Security utilities for safe HTML/data handling.

#### `escapeHtml(text: string): string`

Escapes HTML special characters to prevent XSS.

```typescript
escapeHtml('<script>alert("XSS")</script>');
// '&lt;script&gt;alert("XSS")&lt;/script&gt;'
```

#### `sanitizeSelector(selector: string): string`

Validates and sanitizes CSS selectors.

#### `sanitizeUrl(url: string): string`

Removes dangerous protocols from URLs.

```typescript
sanitizeUrl('javascript:alert(1)'); // ''
sanitizeUrl('https://example.com'); // 'https://example.com'
```

---

### Report Generator (`src/utils/report-generator.ts`)

Generate accessibility reports in multiple formats.

#### `generateReport(results, options): AccessibilityReport`

Creates a comprehensive accessibility report.

```typescript
const report = generateReport(evaluationResults, {
  url: 'https://example.com',
  title: 'Example Page',
  conformanceLevel: 'AA',
});
```

#### `exportToJSON(report: AccessibilityReport): string`

Exports report as JSON string.

#### `exportToCSV(report: AccessibilityReport): string`

Exports report as CSV string.

#### `exportToHTML(report: AccessibilityReport): string`

Exports report as HTML document.

#### `exportToEARL(report: AccessibilityReport): string`

Exports report in W3C EARL (Evaluation and Report Language) format.

#### `downloadJSON/CSV/HTML/EARL(report, filename?): void`

Downloads report in the specified format.

---

### Error Handler (`src/utils/error-handler.ts`)

Global error handling and logging.

#### `logError(source, error, context?): void`

Logs an error to the internal log.

```typescript
logError('sidebar', new Error('Something went wrong'), { action: 'click' });
```

#### `logWarning(source, message, context?): void`

Logs a warning.

#### `safeExecute<T>(fn, source, fallback?): T | null`

Safely executes a function, catching errors.

```typescript
const result = safeExecute(() => riskyOperation(), 'analyzer', null);
```

#### `retryAsync<T>(fn, options?): Promise<T>`

Retries an async operation with exponential backoff.

```typescript
const result = await retryAsync(
  () => fetchData(),
  { maxRetries: 3, delay: 100 }
);
```

---

### Cleanup Manager (`src/utils/cleanup-manager.ts`)

Memory management and resource cleanup.

#### `cleanupManager`

Singleton instance for managing resources.

```typescript
import { cleanupManager } from './utils/cleanup-manager';

// Register an element for cleanup
cleanupManager.registerElement(myElement);

// Register an event listener
cleanupManager.registerListener(element, 'click', handler);

// Create a managed interval
const id = cleanupManager.setInterval(callback, 1000);

// Cleanup all resources
cleanupManager.cleanup();
```

---

### i18n Utilities (`src/utils/i18n.ts`)

Internationalization support.

#### `getMessage(messageName, substitutions?): string`

Gets a localized message from Chrome i18n.

```typescript
getMessage('extensionName'); // 'TheWCAG Evaluation Extension'
```

#### `translateDocument(root?): void`

Applies translations to DOM elements with `data-i18n` attributes.

```html
<span data-i18n="loading">Loading...</span>
```

```typescript
translateDocument(); // Updates all data-i18n elements
```

#### `formatNumber(value, options?): string`

Formats a number according to user's locale.

#### `formatDate(date, options?): string`

Formats a date according to user's locale.

---

### Worker Manager (`src/utils/worker-manager.ts`)

Web worker management for background processing.

#### `getEvaluationWorker(): WorkerManager | null`

Gets the evaluation worker instance.

```typescript
const worker = getEvaluationWorker();
if (worker) {
  const results = await worker.computeContrastBatch(colorPairs);
}
```

---

## Types

### Core Types

```typescript
interface RgbColor {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
}

interface HslColor {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

type RuleCategory = 'error' | 'alert' | 'feature' | 'structure' | 'aria' | 'contrast';

type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor' | 'none';

type WcagLevel = 'A' | 'AA' | 'AAA';

interface RuleResult {
  ruleId: string;
  category: RuleCategory;
  element: Element;
  selector: string;
  xpath: string;
  message: string;
  impact: ImpactLevel;
  data?: Record<string, any>;
}

interface EvaluationResults {
  success: boolean;
  timestamp: number;
  url: string;
  title: string;
  categories: {
    error: RuleResult[];
    alert: RuleResult[];
    feature: RuleResult[];
    structure: RuleResult[];
    aria: RuleResult[];
    contrast: RuleResult[];
  };
  summary: EvaluationSummary;
  aimScore: number;
}
```

---

## Message Actions

The extension uses message passing for communication between components:

| Action | Description |
|--------|-------------|
| `runWCAG` | Start accessibility evaluation |
| `resetEvaluation` | Reset current evaluation |
| `evaluationResults` | Evaluation complete with results |
| `outlineData` | Page structure data |
| `navigationData` | Tab order data |
| `contrastData` | Contrast analysis data |
| `highlightElement` | Highlight element on page |
| `inspectElement` | Open element in DevTools |
| `toggleStyles` | Toggle page styles |
| `getOutline` | Request page outline |
| `desaturatePage` | Toggle page desaturation |

---

## Events

Custom events for analyzer communication:

```typescript
// Dispatch from content script
document.dispatchEvent(new CustomEvent('wcag:action', {
  detail: { action: 'evaluationResults', data: results }
}));

// Listen in analyzer
document.addEventListener('wcag:action', (event) => {
  const { action, data } = event.detail;
});
```

---

## Browser APIs Used

- `chrome.runtime` - Extension messaging
- `chrome.tabs` - Tab management
- `chrome.action` - Extension icon
- `chrome.scripting` - Script injection
- `chrome.storage` - Data persistence
- `chrome.i18n` - Internationalization
- `chrome.contextMenus` - Right-click menu
- `chrome.commands` - Keyboard shortcuts

