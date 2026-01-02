// ============================================
// TheWCAG Evaluation Extension - ARIA Rules
// Complete ARIA accessibility rules
// ============================================

import { AccessibilityRule, RuleResult, EvaluationContext } from '../../types';
import { 
  getSelector, 
  getXPath, 
  getAccessibleName,
} from '../../utils/dom-utils';
import { createRule } from '../index';

// ============================================
// ARIA Feature Rules
// ============================================

const aria: AccessibilityRule = createRule('aria', 'ARIA attribute', 'aria', {
  description: 'Element has ARIA attributes',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    const ariaAttributes = Array.from(element.attributes).filter(attr => 
      attr.name.startsWith('aria-') || attr.name === 'role'
    );
    
    if (ariaAttributes.length === 0) return null;
    
    // Don't report if more specific ARIA rules will handle it
    const role = element.getAttribute('role');
    const specificRoles = ['button', 'menu', 'menubar', 'menuitem'];
    if (role && specificRoles.includes(role)) return null;
    
    const hasAriaLabel = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
    if (hasAriaLabel) return null;
    
    const hasAriaDescribedby = element.hasAttribute('aria-describedby');
    if (hasAriaDescribedby) return null;
    
    const hasAriaLive = element.hasAttribute('aria-live');
    if (hasAriaLive) return null;
    
    const hasAriaExpanded = element.hasAttribute('aria-expanded');
    if (hasAriaExpanded) return null;
    
    const hasAriaHaspopup = element.hasAttribute('aria-haspopup');
    if (hasAriaHaspopup) return null;
    
    const hasAriaHidden = element.hasAttribute('aria-hidden');
    if (hasAriaHidden) return null;
    
    const attrs = ariaAttributes.map(a => a.name).join(', ');
    
    return {
      ruleId: 'aria',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `ARIA: ${attrs}`,
      impact: 'none',
      data: { attributes: attrs },
    };
  },
  documentation: {
    summary: 'An element has ARIA attributes.',
    purpose: 'ARIA provides additional accessibility information.',
    actions: [],
    algorithm: 'An element has aria-* or role attributes.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

const ariaLabel: AccessibilityRule = createRule('aria_label', 'ARIA label', 'aria', {
  description: 'Element has ARIA label',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    if (!element.hasAttribute('aria-label')) return null;
    
    const label = element.getAttribute('aria-label')?.trim();
    if (!label) return null;
    
    return {
      ruleId: 'aria_label',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `aria-label: "${label}"`,
      impact: 'none',
      data: { label },
    };
  },
  documentation: {
    summary: 'An element has an aria-label.',
    purpose: 'aria-label provides an accessible name.',
    actions: [],
    algorithm: 'An element has a non-empty aria-label.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

const ariaDescribedby: AccessibilityRule = createRule('aria_describedby', 'ARIA describedby', 'aria', {
  description: 'Element has ARIA description',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (!element.hasAttribute('aria-describedby')) return null;
    
    const ids = element.getAttribute('aria-describedby')?.split(/\s+/) || [];
    const descriptions: string[] = [];
    
    for (const id of ids) {
      const descEl = context.document.getElementById(id);
      if (descEl) {
        descriptions.push(descEl.textContent?.trim() || '');
      }
    }
    
    return {
      ruleId: 'aria_describedby',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Element has aria-describedby',
      impact: 'none',
      data: { ids: ids.join(', '), description: descriptions.join(' ') },
    };
  },
  documentation: {
    summary: 'An element has an aria-describedby.',
    purpose: 'aria-describedby provides additional description.',
    actions: [],
    algorithm: 'An element has aria-describedby attribute.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

const ariaExpanded: AccessibilityRule = createRule('aria_expanded', 'ARIA expanded', 'aria', {
  description: 'Element has ARIA expanded state',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    if (!element.hasAttribute('aria-expanded')) return null;
    
    const expanded = element.getAttribute('aria-expanded');
    
    return {
      ruleId: 'aria_expanded',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `aria-expanded="${expanded}"`,
      impact: 'none',
      data: { expanded },
    };
  },
  documentation: {
    summary: 'An element has aria-expanded.',
    purpose: 'aria-expanded indicates expandable content state.',
    actions: [],
    algorithm: 'An element has aria-expanded attribute.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

const ariaHaspopup: AccessibilityRule = createRule('aria_haspopup', 'ARIA has popup', 'aria', {
  description: 'Element indicates a popup',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    if (!element.hasAttribute('aria-haspopup')) return null;
    
    const haspopup = element.getAttribute('aria-haspopup');
    
    return {
      ruleId: 'aria_haspopup',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `aria-haspopup="${haspopup}"`,
      impact: 'none',
      data: { haspopup },
    };
  },
  documentation: {
    summary: 'An element has aria-haspopup.',
    purpose: 'aria-haspopup indicates the element opens a popup.',
    actions: [],
    algorithm: 'An element has aria-haspopup attribute.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

const ariaHidden: AccessibilityRule = createRule('aria_hidden', 'ARIA hidden', 'aria', {
  description: 'Element is hidden from assistive technology',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.getAttribute('aria-hidden') !== 'true') return null;
    
    return {
      ruleId: 'aria_hidden',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Element is aria-hidden',
      impact: 'none',
    };
  },
  documentation: {
    summary: 'An element has aria-hidden="true".',
    purpose: 'aria-hidden hides content from assistive technology.',
    actions: [],
    algorithm: 'An element has aria-hidden="true".',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

const ariaLiveRegion: AccessibilityRule = createRule('aria_live_region', 'ARIA live region', 'aria', {
  description: 'Dynamic content region',
  impact: 'none',
  wcagCriteria: ['4.1.3'],
  wcagLevel: 'AA',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    const ariaLive = element.getAttribute('aria-live');
    const role = element.getAttribute('role');
    const liveRoles = ['alert', 'status', 'log', 'marquee', 'timer'];
    
    if (!ariaLive && (!role || !liveRoles.includes(role))) return null;
    
    return {
      ruleId: 'aria_live_region',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: ariaLive ? `aria-live="${ariaLive}"` : `Live region role="${role}"`,
      impact: 'none',
      data: { ariaLive, role },
    };
  },
  documentation: {
    summary: 'A live region is present.',
    purpose: 'Live regions announce dynamic content changes.',
    actions: [],
    algorithm: 'An element has aria-live or a live region role.',
    guidelines: [{ id: '4.1.3', name: 'Status Messages', level: 'AA', url: 'https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html' }],
  },
});

const ariaButton: AccessibilityRule = createRule('aria_button', 'ARIA button', 'aria', {
  description: 'Element has button role',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.getAttribute('role') !== 'button') return null;
    if (element.tagName.toLowerCase() === 'button') return null;
    
    const name = getAccessibleName(element);
    
    return {
      ruleId: 'aria_button',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `ARIA button: "${name}"`,
      impact: 'none',
      data: { name },
    };
  },
  documentation: {
    summary: 'An element has role="button".',
    purpose: 'ARIA button roles enable custom button widgets.',
    actions: [],
    algorithm: 'A non-button element has role="button".',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

const ariaTabindex: AccessibilityRule = createRule('aria_tabindex', 'ARIA tabindex', 'aria', {
  description: 'Element has tabindex for keyboard focus',
  impact: 'none',
  wcagCriteria: ['2.1.1'],
  wcagLevel: 'A',
  tags: ['aria', 'keyboard'],
  evaluate: (element: Element): RuleResult | null => {
    const tabindexAttr = element.getAttribute('tabindex');
    if (tabindexAttr === null) return null;
    
    const tabindex = parseInt(tabindexAttr, 10);
    
    // Only report on elements with role that use tabindex meaningfully
    const role = element.getAttribute('role');
    const interactiveRoles = ['button', 'link', 'checkbox', 'menuitem', 'tab', 'option', 'slider', 'textbox'];
    
    if (role && interactiveRoles.includes(role)) {
      return {
        ruleId: 'aria_tabindex',
        category: 'aria',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `tabindex="${tabindex}" on role="${role}"`,
        impact: 'none',
        data: { tabindex, role },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An ARIA widget has tabindex.',
    purpose: 'Tabindex enables keyboard focus on custom widgets.',
    actions: [],
    algorithm: 'An element with ARIA role has tabindex.',
    guidelines: [{ id: '2.1.1', name: 'Keyboard', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html' }],
  },
});

const ariaMenu: AccessibilityRule = createRule('aria_menu', 'ARIA menu', 'aria', {
  description: 'ARIA menu widget',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    const role = element.getAttribute('role');
    if (role !== 'menu' && role !== 'menubar') return null;
    
    const menuItems = element.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');
    
    return {
      ruleId: 'aria_menu',
      category: 'aria',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `ARIA ${role} with ${menuItems.length} items`,
      impact: 'none',
      data: { role, itemCount: menuItems.length },
    };
  },
  documentation: {
    summary: 'An ARIA menu is present.',
    purpose: 'ARIA menus provide accessible navigation.',
    actions: [],
    algorithm: 'An element has role=menu or menubar.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

// ============================================
// Export all ARIA rules
// ============================================
export const ariaRules: AccessibilityRule[] = [
  aria,
  ariaLabel,
  ariaDescribedby,
  ariaExpanded,
  ariaHaspopup,
  ariaHidden,
  ariaLiveRegion,
  ariaButton,
  ariaTabindex,
  ariaMenu,
];
