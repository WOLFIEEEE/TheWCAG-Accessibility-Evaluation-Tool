// ============================================
// TheWCAG Evaluation Extension - Accessibility Tree
// Build accessible DOM tree structure
// ============================================

import { AccessibleNode } from '../types';

// ============================================
// Role Mappings
// ============================================

const implicitRoles: Record<string, string | ((el: Element) => string)> = {
  a: (el) => (el.hasAttribute('href') ? 'link' : 'generic'),
  article: 'article',
  aside: 'complementary',
  button: 'button',
  datalist: 'listbox',
  details: 'group',
  dialog: 'dialog',
  footer: (el) => {
    const parent = el.parentElement;
    if (!parent) return 'contentinfo';
    const tag = parent.tagName.toLowerCase();
    return ['article', 'aside', 'main', 'nav', 'section'].includes(tag)
      ? 'generic'
      : 'contentinfo';
  },
  form: (el) => (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') || el.hasAttribute('name') ? 'form' : 'generic'),
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
  header: (el) => {
    const parent = el.parentElement;
    if (!parent) return 'banner';
    const tag = parent.tagName.toLowerCase();
    return ['article', 'aside', 'main', 'nav', 'section'].includes(tag)
      ? 'generic'
      : 'banner';
  },
  hr: 'separator',
  img: (el) => {
    const alt = el.getAttribute('alt');
    return alt === '' ? 'presentation' : 'img';
  },
  input: (el) => {
    const type = el.getAttribute('type')?.toLowerCase() || 'text';
    const typeRoles: Record<string, string> = {
      button: 'button',
      checkbox: 'checkbox',
      email: 'textbox',
      image: 'button',
      number: 'spinbutton',
      radio: 'radio',
      range: 'slider',
      reset: 'button',
      search: 'searchbox',
      submit: 'button',
      tel: 'textbox',
      text: 'textbox',
      url: 'textbox',
    };
    return typeRoles[type] || 'textbox';
  },
  li: (el) => {
    const parent = el.parentElement;
    if (parent?.tagName.toLowerCase() === 'menu') return 'menuitem';
    return 'listitem';
  },
  main: 'main',
  menu: 'menu',
  nav: 'navigation',
  ol: 'list',
  optgroup: 'group',
  option: 'option',
  output: 'status',
  progress: 'progressbar',
  section: (el) => 
    el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
      ? 'region'
      : 'generic',
  select: (el) => (el.hasAttribute('multiple') ? 'listbox' : 'combobox'),
  summary: 'button',
  table: 'table',
  tbody: 'rowgroup',
  td: 'cell',
  textarea: 'textbox',
  tfoot: 'rowgroup',
  th: (el) => (el.getAttribute('scope') === 'row' ? 'rowheader' : 'columnheader'),
  thead: 'rowgroup',
  tr: 'row',
  ul: 'list',
};

// ============================================
// Accessible Name Calculation
// ============================================

/**
 * Get the accessible name of an element
 * Implements accessible name computation (simplified)
 */
export function getAccessibleName(element: Element): string {
  // 1. aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/);
    const texts = ids
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean);
    if (texts.length > 0) {
      return texts.join(' ');
    }
  }

  // 2. aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel?.trim()) {
    return ariaLabel.trim();
  }

  // 3. Associated label (for form controls)
  const tagName = element.tagName.toLowerCase();
  if (['input', 'select', 'textarea'].includes(tagName)) {
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label?.textContent?.trim()) {
        return label.textContent.trim();
      }
    }

    // Check for wrapping label
    const parent = element.closest('label');
    if (parent) {
      const clone = parent.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('input, select, textarea').forEach((el) => el.remove());
      if (clone.textContent?.trim()) {
        return clone.textContent.trim();
      }
    }
  }

  // 4. alt attribute (for images)
  if (tagName === 'img') {
    const alt = element.getAttribute('alt');
    if (alt !== null) {
      return alt;
    }
  }

  // 5. title attribute
  const title = element.getAttribute('title');
  if (title?.trim()) {
    return title.trim();
  }

  // 6. placeholder (for inputs)
  if (['input', 'textarea'].includes(tagName)) {
    const placeholder = element.getAttribute('placeholder');
    if (placeholder?.trim()) {
      return placeholder.trim();
    }
  }

  // 7. Text content (for buttons, links, headings)
  if (['button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'summary'].includes(tagName)) {
    const text = element.textContent?.trim();
    if (text) {
      return text.substring(0, 100);
    }
  }

  // 8. value attribute (for input buttons)
  if (tagName === 'input') {
    const type = element.getAttribute('type')?.toLowerCase();
    if (['submit', 'reset', 'button'].includes(type || '')) {
      const value = element.getAttribute('value');
      if (value?.trim()) {
        return value.trim();
      }
      // Default values
      if (type === 'submit') return 'Submit';
      if (type === 'reset') return 'Reset';
    }
  }

  return '';
}

/**
 * Get the accessible description of an element
 */
export function getAccessibleDescription(element: Element): string {
  // aria-describedby
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const ids = describedBy.split(/\s+/);
    const texts = ids
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean);
    if (texts.length > 0) {
      return texts.join(' ');
    }
  }

  // For images, check longdesc
  if (element.tagName.toLowerCase() === 'img') {
    const longdesc = element.getAttribute('longdesc');
    if (longdesc) {
      return `Long description available: ${longdesc}`;
    }
  }

  return '';
}

// ============================================
// Role Computation
// ============================================

/**
 * Get the accessible role of an element
 */
export function getAccessibleRole(element: Element): string {
  // 1. Explicit role attribute
  const explicitRole = element.getAttribute('role');
  if (explicitRole) {
    return explicitRole.split(/\s+/)[0]; // Take first role if multiple
  }

  // 2. Implicit role from element
  const tagName = element.tagName.toLowerCase();
  const implicitRole = implicitRoles[tagName];

  if (typeof implicitRole === 'function') {
    return implicitRole(element);
  }

  if (implicitRole) {
    return implicitRole;
  }

  return 'generic';
}

// ============================================
// State/Property Computation
// ============================================

/**
 * Get ARIA states for an element
 */
export function getAriaStates(element: Element): string[] {
  const states: string[] = [];

  // Boolean states
  const booleanStates = [
    'aria-checked',
    'aria-disabled',
    'aria-expanded',
    'aria-hidden',
    'aria-invalid',
    'aria-pressed',
    'aria-selected',
    'aria-busy',
    'aria-current',
    'aria-grabbed',
    'aria-modal',
    'aria-multiselectable',
    'aria-readonly',
    'aria-required',
  ];

  for (const attr of booleanStates) {
    const value = element.getAttribute(attr);
    if (value === 'true') {
      states.push(attr.replace('aria-', ''));
    }
  }

  // Native element states
  const htmlElement = element as HTMLElement;
  if (htmlElement instanceof HTMLInputElement) {
    if (htmlElement.checked) states.push('checked');
    if (htmlElement.disabled) states.push('disabled');
    if (htmlElement.required) states.push('required');
    if (htmlElement.readOnly) states.push('readonly');
  }

  if (htmlElement instanceof HTMLSelectElement) {
    if (htmlElement.disabled) states.push('disabled');
    if (htmlElement.required) states.push('required');
  }

  if (htmlElement instanceof HTMLTextAreaElement) {
    if (htmlElement.disabled) states.push('disabled');
    if (htmlElement.required) states.push('required');
    if (htmlElement.readOnly) states.push('readonly');
  }

  if (htmlElement instanceof HTMLButtonElement) {
    if (htmlElement.disabled) states.push('disabled');
  }

  if (htmlElement instanceof HTMLAnchorElement) {
    if (htmlElement.href === document.location.href) {
      states.push('current');
    }
  }

  return states;
}

/**
 * Get ARIA properties for an element
 */
export function computeAriaProperties(element: Element): Record<string, string> {
  const properties: Record<string, string> = {};

  // Value properties
  const valueProps = [
    'aria-valuenow',
    'aria-valuemin',
    'aria-valuemax',
    'aria-valuetext',
    'aria-level',
    'aria-posinset',
    'aria-setsize',
    'aria-colcount',
    'aria-colindex',
    'aria-colspan',
    'aria-rowcount',
    'aria-rowindex',
    'aria-rowspan',
    'aria-sort',
    'aria-orientation',
    'aria-autocomplete',
    'aria-haspopup',
    'aria-live',
    'aria-relevant',
    'aria-atomic',
  ];

  for (const attr of valueProps) {
    const value = element.getAttribute(attr);
    if (value) {
      properties[attr.replace('aria-', '')] = value;
    }
  }

  // Heading level
  const role = getAccessibleRole(element);
  if (role === 'heading') {
    const tagName = element.tagName.toLowerCase();
    if (tagName.match(/^h[1-6]$/)) {
      properties['level'] = tagName.charAt(1);
    } else {
      const ariaLevel = element.getAttribute('aria-level');
      if (ariaLevel) {
        properties['level'] = ariaLevel;
      }
    }
  }

  return properties;
}

// ============================================
// Selector Generation
// ============================================

/**
 * Generate a CSS selector for an element
 */
export function getSelectorForElement(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const tagName = element.tagName.toLowerCase();
  const classes = Array.from(element.classList).slice(0, 2).join('.');
  const parent = element.parentElement;

  let selector = tagName;
  if (classes) {
    selector += `.${classes}`;
  }

  if (parent && parent !== document.body) {
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === element.tagName
    );
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1;
      selector += `:nth-of-type(${index})`;
    }
  }

  return selector;
}

// ============================================
// Tree Building
// ============================================

/**
 * Check if an element is hidden from accessibility tree
 */
function isAccessibilityHidden(element: Element): boolean {
  // aria-hidden
  if (element.getAttribute('aria-hidden') === 'true') {
    return true;
  }

  // CSS visibility/display
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return true;
  }

  // hidden attribute
  if (element.hasAttribute('hidden')) {
    return true;
  }

  return false;
}

/**
 * Check if an element is semantically relevant
 */
function isSemanticElement(element: Element): boolean {
  const role = getAccessibleRole(element);

  // Generic/presentation roles are not semantic
  if (['generic', 'presentation', 'none'].includes(role)) {
    // But check if it has text content that matters
    const hasDirectText = Array.from(element.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
    );
    return hasDirectText;
  }

  return true;
}

/**
 * Get issues for a node
 */
function getNodeIssues(element: Element, role: string, name: string): string[] {
  const issues: string[] = [];

  // Check for missing name on interactive elements
  const interactiveRoles = [
    'button', 'link', 'textbox', 'checkbox', 'radio', 'combobox',
    'listbox', 'slider', 'switch', 'tab', 'menuitem', 'menuitemcheckbox',
    'menuitemradio', 'option', 'searchbox', 'spinbutton'
  ];

  if (interactiveRoles.includes(role) && !name) {
    issues.push('Missing accessible name');
  }

  // Check for images without alt
  if (role === 'img' && !name) {
    issues.push('Image missing alt text');
  }

  // Check for landmarks without labels (when duplicates exist)
  const landmarkRoles = ['navigation', 'region', 'complementary', 'form'];
  if (landmarkRoles.includes(role) && !name) {
    const sameRoleLandmarks = document.querySelectorAll(`[role="${role}"], ${role === 'navigation' ? 'nav' : ''}`);
    if (sameRoleLandmarks.length > 1) {
      issues.push(`Multiple ${role} landmarks - should have unique labels`);
    }
  }

  return issues;
}

/**
 * Build an accessibility tree node
 */
function buildNode(element: Element, depth = 0): AccessibleNode | null {
  if (isAccessibilityHidden(element)) {
    return null;
  }

  const role = getAccessibleRole(element);
  const name = getAccessibleName(element);
  const description = getAccessibleDescription(element);
  const states = getAriaStates(element);
  const properties = computeAriaProperties(element);
  const selector = getSelectorForElement(element);
  const issues = getNodeIssues(element, role, name);

  // Get value for form controls
  let value: string | undefined;
  if (element instanceof HTMLInputElement) {
    if (['checkbox', 'radio'].includes(element.type)) {
      value = element.checked ? 'checked' : 'unchecked';
    } else if (element.type !== 'password') {
      value = element.value;
    }
  } else if (element instanceof HTMLSelectElement) {
    value = element.options[element.selectedIndex]?.text;
  } else if (element instanceof HTMLTextAreaElement) {
    value = element.value;
  }

  // Get level for headings
  let level: number | undefined;
  if (role === 'heading') {
    const tagName = element.tagName.toLowerCase();
    if (tagName.match(/^h[1-6]$/)) {
      level = parseInt(tagName.charAt(1));
    } else {
      const ariaLevel = element.getAttribute('aria-level');
      if (ariaLevel) {
        level = parseInt(ariaLevel);
      }
    }
  }

  // Build children
  const children: AccessibleNode[] = [];
  for (const child of element.children) {
    const childNode = buildNode(child, depth + 1);
    if (childNode) {
      children.push(childNode);
    }
  }

  // Filter out non-semantic nodes without children
  if (!isSemanticElement(element) && children.length === 0) {
    return null;
  }

  return {
    role,
    name,
    description,
    value,
    states,
    properties,
    level,
    children,
    selector,
    issues,
  };
}

/**
 * Build the complete accessibility tree
 */
export function buildAccessibilityTree(root: Element = document.body): AccessibleNode {
  const tree = buildNode(root, 0);

  if (!tree) {
    return {
      role: 'document',
      name: document.title || '',
      states: [],
      properties: {},
      children: [],
      selector: 'body',
      issues: [],
    };
  }

  return tree;
}

/**
 * Flatten the accessibility tree to a list
 */
export function flattenTree(node: AccessibleNode, depth = 0): { node: AccessibleNode; depth: number }[] {
  const result: { node: AccessibleNode; depth: number }[] = [{ node, depth }];

  for (const child of node.children) {
    result.push(...flattenTree(child, depth + 1));
  }

  return result;
}

/**
 * Filter tree nodes by role
 */
export function filterByRole(node: AccessibleNode, roles: string[]): AccessibleNode[] {
  const results: AccessibleNode[] = [];

  if (roles.includes(node.role)) {
    results.push(node);
  }

  for (const child of node.children) {
    results.push(...filterByRole(child, roles));
  }

  return results;
}

export default {
  buildAccessibilityTree,
  getAccessibleName,
  getAccessibleDescription,
  getAccessibleRole,
  getAriaStates,
  computeAriaProperties,
  flattenTree,
  filterByRole,
};

