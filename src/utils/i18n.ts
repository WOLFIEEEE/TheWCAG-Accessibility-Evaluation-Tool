// ============================================
// TheWCAG Evaluation Extension - Internationalization
// i18n utilities for multi-language support
// ============================================

/**
 * Get a localized message from the _locales folder
 * @param messageName - The name of the message as defined in messages.json
 * @param substitutions - Optional array of substitution strings
 * @returns The localized message or the messageName if not found
 */
export function getMessage(messageName: string, substitutions?: string | string[]): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
      const message = chrome.i18n.getMessage(messageName, substitutions);
      return message || messageName;
    }
  } catch {
    // Fall through to return messageName
  }
  return messageName;
}

/**
 * Get the UI language
 */
export function getUILanguage(): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
      return chrome.i18n.getUILanguage();
    }
  } catch {
    // Fall through
  }
  return navigator.language || 'en';
}

/**
 * Get all available accept languages in order of preference
 */
export async function getAcceptLanguages(): Promise<string[]> {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getAcceptLanguages) {
      return await chrome.i18n.getAcceptLanguages();
    }
  } catch {
    // Fall through
  }
  return [navigator.language || 'en'];
}

/**
 * Check if a language is RTL (right-to-left)
 */
export function isRTL(languageCode?: string): boolean {
  const lang = languageCode || getUILanguage();
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'ps', 'sd'];
  return rtlLanguages.some((rtl) => lang.startsWith(rtl));
}

/**
 * Format a number according to the user's locale
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  const locale = getUILanguage();
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a date according to the user's locale
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const locale = getUILanguage();
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const locale = getUILanguage();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffDay > 0) return rtf.format(-diffDay, 'day');
  if (diffHr > 0) return rtf.format(-diffHr, 'hour');
  if (diffMin > 0) return rtf.format(-diffMin, 'minute');
  return rtf.format(-diffSec, 'second');
}

/**
 * Pluralize a message based on count
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  zero?: string
): string {
  if (count === 0 && zero) return zero;
  return count === 1 ? singular : plural;
}

/**
 * Common messages with fallbacks
 */
export const messages = {
  // Tab labels
  tabDetails: () => getMessage('tabDetails') || 'Details',
  tabReference: () => getMessage('tabReference') || 'Reference',
  tabOrder: () => getMessage('tabOrder') || 'Order',
  tabStructure: () => getMessage('tabStructure') || 'Structure',
  tabContrast: () => getMessage('tabContrast') || 'Contrast',

  // Category labels
  categoryErrors: () => getMessage('categoryErrors') || 'Errors',
  categoryAlerts: () => getMessage('categoryAlerts') || 'Alerts',
  categoryFeatures: () => getMessage('categoryFeatures') || 'Features',
  categoryStructure: () => getMessage('categoryStructure') || 'Structure',
  categoryAria: () => getMessage('categoryAria') || 'ARIA',
  categoryContrast: () => getMessage('categoryContrast') || 'Contrast',

  // Status messages
  loading: () => getMessage('loading') || 'Evaluating page accessibility...',
  noErrors: () => getMessage('noErrors') || 'Congratulations! No errors were detected!',
  manualTestingNote: () =>
    getMessage('manualTestingNote') || 'Manual testing is still necessary for full compliance.',

  // AIM Score
  aimScore: () => getMessage('aimScore') || 'AIM Score',
  outOf10: () => getMessage('outOf10') || 'out of 10',

  // Actions
  searchPlaceholder: () => getMessage('searchPlaceholder') || 'Search issues...',
  viewDocumentation: () => getMessage('viewDocumentation') || 'View documentation',
  inspectElement: () => getMessage('inspectElement') || 'Inspect in DevTools',

  // Export
  exportJSON: () => getMessage('exportJSON') || 'JSON',
  exportCSV: () => getMessage('exportCSV') || 'CSV',
  exportHTML: () => getMessage('exportHTML') || 'HTML',
  exportCopy: () => getMessage('exportCopy') || 'Copy',

  // Results
  pass: () => getMessage('pass') || 'Pass',
  fail: () => getMessage('fail') || 'Fail',

  // Toasts
  reportGenerated: () => getMessage('reportGenerated') || 'Report generated successfully!',
  reportCopied: () => getMessage('reportCopied') || 'Report copied to clipboard!',
  exportFailed: () => getMessage('exportFailed') || 'Export failed. Please try again.',
};

/**
 * Apply translations to DOM elements with data-i18n attribute
 */
export function translateDocument(root: Document | Element = document): void {
  const elements = root.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const message = getMessage(key);
      if (message !== key) {
        element.textContent = message;
      }
    }
  });

  // Handle placeholders
  const inputs = root.querySelectorAll('[data-i18n-placeholder]');
  inputs.forEach((input) => {
    const key = input.getAttribute('data-i18n-placeholder');
    if (key) {
      const message = getMessage(key);
      if (message !== key) {
        (input as HTMLInputElement).placeholder = message;
      }
    }
  });

  // Handle titles/tooltips
  const titled = root.querySelectorAll('[data-i18n-title]');
  titled.forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      const message = getMessage(key);
      if (message !== key) {
        element.setAttribute('title', message);
      }
    }
  });

  // Handle aria-labels
  const ariaLabeled = root.querySelectorAll('[data-i18n-aria-label]');
  ariaLabeled.forEach((element) => {
    const key = element.getAttribute('data-i18n-aria-label');
    if (key) {
      const message = getMessage(key);
      if (message !== key) {
        element.setAttribute('aria-label', message);
      }
    }
  });
}

/**
 * Set document direction based on language
 */
export function setDocumentDirection(doc: Document = document): void {
  if (isRTL()) {
    doc.documentElement.setAttribute('dir', 'rtl');
  } else {
    doc.documentElement.setAttribute('dir', 'ltr');
  }
}

export default {
  getMessage,
  getUILanguage,
  getAcceptLanguages,
  isRTL,
  formatNumber,
  formatDate,
  formatRelativeTime,
  pluralize,
  messages,
  translateDocument,
  setDocumentDirection,
};

