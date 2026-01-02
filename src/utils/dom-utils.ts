// ============================================
// TheWCAG Evaluation Extension - DOM Utilities
// Complete set of DOM manipulation utilities
// ============================================

import { ElementInfo, BoundingRect } from '../types';

// ============================================
// Element Selection/Identification
// ============================================

/**
 * Generate a CSS selector for an element
 */
export function getSelector(element: Element): string {
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${CSS.escape(current.id)}`;
      parts.unshift(selector);
      break;
    }

    if (current.className && typeof current.className === 'string') {
      const classes = current.className
        .trim()
        .split(/\s+/)
        .filter(c => c);
      if (classes.length > 0) {
        selector += `.${classes.map(c => CSS.escape(c)).join('.')}`;
      }
    }

    // Add nth-child if needed for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const sameTagSiblings = siblings.filter(s => s.tagName === current!.tagName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

/**
 * Generate XPath for an element
 */
export function getXPath(element: Element): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const parts: string[] = [];
  let current: Node | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const el = current as Element;
    let index = 0;
    let sibling: Node | null = current.previousSibling;

    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && (sibling as Element).tagName === el.tagName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }

    const tagName = el.tagName.toLowerCase();
    const part = index > 0 ? `${tagName}[${index + 1}]` : tagName;
    parts.unshift(part);

    current = current.parentNode;
    if (current === document) {
      break;
    }
  }

  return '/' + parts.join('/');
}

// ============================================
// Accessible Name Computation
// ============================================

/**
 * Get the accessible name of an element
 * Based on accessible name computation algorithm
 */
export function getAccessibleName(element: Element): string {
  // 1. aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/);
    const texts = ids.map(id => {
      const el = document.getElementById(id);
      return el ? getTextContent(el) : '';
    });
    const result = texts.filter(t => t).join(' ');
    if (result) return result;
  }

  // 2. aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // 3. For specific elements
  const tagName = element.tagName.toLowerCase();

  // Image alt
  if (tagName === 'img') {
    const alt = (element as HTMLImageElement).alt;
    if (alt) return alt;
  }

  // Input elements
  if (tagName === 'input') {
    const input = element as HTMLInputElement;

    // Use label
    if (input.labels && input.labels.length > 0) {
      return getTextContent(input.labels[0]);
    }

    // Image input alt
    if (input.type === 'image' && input.alt) {
      return input.alt;
    }

    // Button values
    if (['submit', 'reset', 'button'].includes(input.type)) {
      if (input.value) return input.value;
    }

    // Title as fallback
    if (input.title) return input.title;

    // Placeholder as last resort
    if (input.placeholder) return input.placeholder;
  }

  // Area alt
  if (tagName === 'area') {
    const alt = (element as HTMLAreaElement).alt;
    if (alt) return alt;
  }

  // Button
  if (tagName === 'button') {
    return getTextContent(element);
  }

  // Link
  if (tagName === 'a') {
    const text = getTextContent(element);
    if (text) return text;

    // Check for title
    const title = element.getAttribute('title');
    if (title) return title;
  }

  // 4. Title attribute
  const title = element.getAttribute('title');
  if (title) return title;

  // 5. Text content for interactive elements
  const interactiveElements = ['button', 'a', 'label', 'legend', 'figcaption', 'caption'];
  if (interactiveElements.includes(tagName)) {
    return getTextContent(element);
  }

  // 6. Role-based handling
  const role = element.getAttribute('role');
  if (role) {
    const interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab'];
    if (interactiveRoles.includes(role)) {
      return getTextContent(element);
    }
  }

  return '';
}

/**
 * Get the text content of an element, excluding hidden content
 */
export function getTextContent(element: Element): string {
  // Clone to avoid modifying original
  const clone = element.cloneNode(true) as Element;

  // Remove hidden elements
  clone
    .querySelectorAll('[aria-hidden="true"], [hidden], .sr-only, .visually-hidden')
    .forEach(el => el.remove());

  return (clone.textContent || '').trim().replace(/\s+/g, ' ');
}

/**
 * Get the associated label for a form control
 */
export function getAssociatedLabel(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): HTMLLabelElement | null {
  // Check for explicit label
  if (element.id) {
    const label = document.querySelector(
      `label[for="${CSS.escape(element.id)}"]`
    ) as HTMLLabelElement;
    if (label) return label;
  }

  // Check for implicit label (ancestor)
  const parentLabel = element.closest('label') as HTMLLabelElement;
  if (parentLabel) return parentLabel;

  // Check labels property
  if ('labels' in element && element.labels && element.labels.length > 0) {
    return element.labels[0];
  }

  return null;
}

// ============================================
// Visibility/Display
// ============================================

/**
 * Check if an element is visible
 */
export function isElementVisible(element: Element): boolean {
  const style = window.getComputedStyle(element);

  // Check CSS visibility
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (style.opacity === '0') return false;

  // Check dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;

  // Check if clipped/off-screen
  if (style.position === 'absolute' || style.position === 'fixed') {
    if (parseInt(style.left) < -9999 || parseInt(style.top) < -9999) return false;
  }

  // Check hidden attribute
  if (element.hasAttribute('hidden')) return false;

  // Check aria-hidden (not truly hidden but hidden from AT)
  // We still consider it visible for contrast checks etc.

  return true;
}

/**
 * Check if an element is interactable
 */
export function isElementInteractable(element: Element): boolean {
  if (!isElementVisible(element)) return false;

  const style = window.getComputedStyle(element);
  if (style.pointerEvents === 'none') return false;

  const disabled =
    element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
  if (disabled) return false;

  return true;
}

// ============================================
// Element Information
// ============================================

/**
 * Get comprehensive information about an element
 */
export function getElementInfo(element: Element): ElementInfo {
  const attributes: Record<string, string> = {};
  for (const attr of Array.from(element.attributes)) {
    attributes[attr.name] = attr.value;
  }

  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || undefined,
    classes:
      element.className && typeof element.className === 'string'
        ? element.className.split(/\s+/).filter(c => c)
        : [],
    attributes,
    textContent: getTextContent(element),
    accessibleName: getAccessibleName(element),
    role: element.getAttribute('role') || undefined,
    isVisible: isElementVisible(element),
    isInteractive: isInteractiveElement(element),
  };
}

/**
 * Check if an element is natively interactive
 */
export function isInteractiveElement(element: Element): boolean {
  const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'details', 'summary'];
  const tagName = element.tagName.toLowerCase();

  if (interactiveTags.includes(tagName)) {
    if (tagName === 'a') {
      return element.hasAttribute('href');
    }
    if (tagName === 'input') {
      return (element as HTMLInputElement).type !== 'hidden';
    }
    return true;
  }

  // Check for interactive role
  const role = element.getAttribute('role');
  const interactiveRoles = [
    'button',
    'link',
    'checkbox',
    'radio',
    'menuitem',
    'option',
    'tab',
    'textbox',
    'slider',
    'switch',
  ];
  if (role && interactiveRoles.includes(role)) {
    return true;
  }

  // Check tabindex
  const tabindex = element.getAttribute('tabindex');
  if (tabindex !== null && parseInt(tabindex, 10) >= 0) {
    return true;
  }

  return false;
}

/**
 * Get element bounding rectangle
 */
export function getBoundingRect(element: Element): BoundingRect {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

// ============================================
// Language Utilities
// ============================================

/**
 * Check if an element has a valid language attribute
 */
export function hasValidLanguage(element: Element): boolean {
  const lang = element.getAttribute('lang') || element.getAttribute('xml:lang');

  if (!lang) return false;

  // Basic validation: should start with 2-3 letter code
  const langPattern = /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/;
  return langPattern.test(lang);
}

/**
 * Get the language of an element (inherited if not set)
 */
export function getElementLanguage(element: Element): string | null {
  let current: Element | null = element;

  while (current) {
    const lang = current.getAttribute('lang') || current.getAttribute('xml:lang');
    if (lang) return lang;
    current = current.parentElement;
  }

  return null;
}

// ============================================
// DOM Traversal
// ============================================

/**
 * Get all focusable elements in order
 */
export function getFocusableElements(root: Element = document.body): Element[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  const elements = Array.from(root.querySelectorAll(selector));

  return elements
    .filter(el => isElementVisible(el))
    .sort((a, b) => {
      const aIndex = parseInt(a.getAttribute('tabindex') || '0', 10);
      const bIndex = parseInt(b.getAttribute('tabindex') || '0', 10);

      // Positive tabindex comes first, in order
      if (aIndex > 0 && bIndex > 0) return aIndex - bIndex;
      if (aIndex > 0) return -1;
      if (bIndex > 0) return 1;

      // Natural DOM order for tabindex="0" or no tabindex
      return 0;
    });
}

/**
 * Get all headings in document order
 */
export function getHeadings(root: Element = document.body): Element[] {
  return Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]'));
}

/**
 * Get all landmarks in the document
 */
export function getLandmarks(root: Element = document.body): Element[] {
  const landmarkRoles = [
    'banner',
    'navigation',
    'main',
    'complementary',
    'contentinfo',
    'search',
    'region',
    'form',
  ];
  const landmarkElements = ['header', 'nav', 'main', 'aside', 'footer', 'search'];

  const byRole = Array.from(
    root.querySelectorAll(landmarkRoles.map(r => `[role="${r}"]`).join(', '))
  );
  const byElement = Array.from(root.querySelectorAll(landmarkElements.join(', ')));

  // Combine and deduplicate
  const all = [...byRole, ...byElement];
  return [...new Set(all)];
}

// ============================================
// Scroll/Position Utilities
// ============================================

/**
 * Scroll an element into view smoothly
 */
export function scrollToElement(element: Element, options: ScrollIntoViewOptions = {}): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
    ...options,
  });
}

/**
 * Check if an element is in the viewport
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ============================================
// Highlight Utilities
// ============================================

/**
 * Highlight an element temporarily
 */
export function highlightElement(element: Element, duration: number = 2000): void {
  const originalOutline = (element as HTMLElement).style.outline;
  const originalBackground = (element as HTMLElement).style.backgroundColor;

  (element as HTMLElement).style.outline = '3px solid #f00';
  (element as HTMLElement).style.backgroundColor = 'rgba(255, 0, 0, 0.1)';

  setTimeout(() => {
    (element as HTMLElement).style.outline = originalOutline;
    (element as HTMLElement).style.backgroundColor = originalBackground;
  }, duration);
}

/**
 * Add a persistent highlight box around an element
 */
export function addHighlightBox(element: Element, color: string = '#ff0000'): HTMLElement {
  const rect = getBoundingRect(element);
  const box = document.createElement('div');

  box.className = 'wcag-highlight-box';
  box.style.cssText = `
    position: absolute;
    top: ${rect.top + window.scrollY}px;
    left: ${rect.left + window.scrollX}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 2px solid ${color};
    pointer-events: none;
    z-index: 99999;
    box-sizing: border-box;
  `;

  document.body.appendChild(box);
  return box;
}

/**
 * Remove all highlight boxes
 */
export function removeAllHighlightBoxes(): void {
  document.querySelectorAll('.wcag-highlight-box').forEach(box => box.remove());
}

// ============================================
// Navigation Order
// ============================================

/**
 * Get the navigation (tab) order of all focusable elements
 */
export function getNavigationOrder(root: Element = document.body): {
  items: Array<{
    index: number;
    element: Element;
    tagName: string;
    type?: string;
    text: string;
    tabIndex: number;
    isNative: boolean;
  }>;
  totalCount: number;
} {
  const focusable = getFocusableElements(root);

  const items = focusable.map((element, index) => {
    const tagName = element.tagName.toLowerCase();
    let type: string | undefined;

    if (tagName === 'input') {
      type = (element as HTMLInputElement).type;
    } else if (tagName === 'button') {
      type = 'button';
    } else if (tagName === 'a') {
      type = 'link';
    }

    return {
      index: index + 1,
      element,
      tagName,
      type,
      text: getAccessibleName(element) || getTextContent(element).substring(0, 50),
      tabIndex: parseInt(element.getAttribute('tabindex') || '0', 10),
      isNative: ['a', 'button', 'input', 'select', 'textarea'].includes(tagName),
    };
  });

  return {
    items,
    totalCount: items.length,
  };
}

// ============================================
// Serialization
// ============================================

/**
 * Serialize an element for messaging (can't pass Element objects directly)
 */
export function serializeElement(element: Element): {
  tagName: string;
  id: string;
  className: string;
  selector: string;
  xpath: string;
  text: string;
  outerHTML: string;
} {
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || '',
    className: element.className && typeof element.className === 'string' ? element.className : '',
    selector: getSelector(element),
    xpath: getXPath(element),
    text: getTextContent(element).substring(0, 200),
    outerHTML: element.outerHTML.substring(0, 500),
  };
}
