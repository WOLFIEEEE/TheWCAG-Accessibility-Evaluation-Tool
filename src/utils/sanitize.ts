// ============================================
// TheWCAG Evaluation Extension - Sanitization Utilities
// Security utilities for safe HTML/data handling
// ============================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

/**
 * Sanitize HTML string - removes scripts and event handlers
 */
export function sanitizeHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;

  const content = template.content;

  // Remove all script elements
  const scripts = content.querySelectorAll('script');
  scripts.forEach((s) => s.remove());

  // Remove all style elements (potential CSS attacks)
  const styles = content.querySelectorAll('style');
  styles.forEach((s) => s.remove());

  // Remove dangerous elements
  const dangerousElements = content.querySelectorAll(
    'iframe, object, embed, applet, form, input, button, textarea, select'
  );
  dangerousElements.forEach((el) => el.remove());

  // Remove all event handlers and dangerous attributes
  const allElements = content.querySelectorAll('*');
  allElements.forEach((el) => {
    const attributesToRemove: string[] = [];

    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();

      // Remove event handlers
      if (name.startsWith('on')) {
        attributesToRemove.push(attr.name);
      }

      // Remove dangerous attributes
      if (['href', 'src', 'action', 'formaction'].includes(name)) {
        const value = attr.value.toLowerCase().trim();
        if (value.startsWith('javascript:') || value.startsWith('data:')) {
          attributesToRemove.push(attr.name);
        }
      }

      // Remove style attribute (can contain expressions)
      if (name === 'style') {
        attributesToRemove.push(attr.name);
      }
    });

    attributesToRemove.forEach((name) => el.removeAttribute(name));
  });

  return template.innerHTML;
}

/**
 * Validate and sanitize a CSS selector
 */
export function sanitizeSelector(selector: string): string {
  // Remove potentially dangerous characters
  const sanitized = selector
    .replace(/[<>'"]/g, '') // Remove HTML chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove url() functions
    .trim();

  // Validate the selector is parseable
  try {
    document.querySelector(sanitized);
    return sanitized;
  } catch {
    // If invalid, escape the entire string
    return CSS.escape(selector);
  }
}

/**
 * Validate a URL is safe
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize URL - only allow safe protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  // Check for dangerous protocols
  const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lower = trimmed.toLowerCase();

  for (const protocol of dangerous) {
    if (lower.startsWith(protocol)) {
      return '';
    }
  }

  return trimmed;
}

/**
 * Sanitize JSON data - ensure only safe types
 */
export function sanitizeJson<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return escapeHtml(data) as T;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeJson(item)) as T;
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip functions
      if (typeof value === 'function') continue;
      // Skip DOM elements
      if (value instanceof Element) continue;
      // Skip symbols
      if (typeof value === 'symbol') continue;

      result[escapeHtml(key)] = sanitizeJson(value);
    }
    return result as T;
  }

  // For other types, convert to string
  return String(data) as T;
}

/**
 * Create a safe text node (no HTML injection possible)
 */
export function createSafeTextNode(text: string): Text {
  return document.createTextNode(text);
}

/**
 * Set text content safely
 */
export function setTextContent(element: Element, text: string): void {
  element.textContent = text;
}

/**
 * Set attribute safely
 */
export function setAttributeSafe(element: Element, name: string, value: string): void {
  const safeName = name.toLowerCase();

  // Block event handlers
  if (safeName.startsWith('on')) {
    console.warn('Blocked attempt to set event handler attribute:', name);
    return;
  }

  // Sanitize URL attributes
  if (['href', 'src', 'action', 'formaction', 'poster', 'data'].includes(safeName)) {
    const safeValue = sanitizeUrl(value);
    if (safeValue) {
      element.setAttribute(name, safeValue);
    }
    return;
  }

  // Block style attribute (use classes instead)
  if (safeName === 'style') {
    console.warn('Blocked attempt to set style attribute. Use CSS classes instead.');
    return;
  }

  element.setAttribute(name, value);
}

/**
 * Create element with safe attributes
 */
export function createElementSafe(
  tagName: string,
  attributes: Record<string, string> = {},
  textContent?: string
): Element {
  const element = document.createElement(tagName);

  for (const [name, value] of Object.entries(attributes)) {
    setAttributeSafe(element, name, value);
  }

  if (textContent !== undefined) {
    setTextContent(element, textContent);
  }

  return element;
}

/**
 * Validate element selector matches expected element
 */
export function validateElement(selector: string, expectedTag?: string): Element | null {
  try {
    const safeSelector = sanitizeSelector(selector);
    const element = document.querySelector(safeSelector);

    if (!element) return null;

    if (expectedTag && element.tagName.toLowerCase() !== expectedTag.toLowerCase()) {
      return null;
    }

    return element;
  } catch {
    return null;
  }
}

