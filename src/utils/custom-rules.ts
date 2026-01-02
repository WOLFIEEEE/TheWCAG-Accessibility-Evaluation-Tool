// ============================================
// TheWCAG Evaluation Extension - Custom Rules
// Evaluate custom user-defined accessibility rules
// ============================================

import { CustomRule, RuleResult, RuleCategory, ImpactLevel } from '../types';

// ============================================
// Condition Evaluators
// ============================================

/**
 * Check if element exists matching selector
 */
function evaluateExists(element: Element, _rule: CustomRule): boolean {
  return element !== null;
}

/**
 * Check if element does NOT exist
 */
function evaluateNotExists(element: Element, _rule: CustomRule): boolean {
  return element === null;
}

/**
 * Check if attribute equals a value
 */
function evaluateAttributeEquals(element: Element, rule: CustomRule): boolean {
  if (!rule.attribute) return false;
  const attrValue = element.getAttribute(rule.attribute);
  return attrValue === rule.conditionValue;
}

/**
 * Check if attribute contains a value
 */
function evaluateAttributeContains(element: Element, rule: CustomRule): boolean {
  if (!rule.attribute) return false;
  const attrValue = element.getAttribute(rule.attribute);
  if (!attrValue || !rule.conditionValue) return false;
  return attrValue.toLowerCase().includes(rule.conditionValue.toLowerCase());
}

/**
 * Check if attribute is missing
 */
function evaluateAttributeMissing(element: Element, rule: CustomRule): boolean {
  if (!rule.attribute) return false;
  return !element.hasAttribute(rule.attribute);
}

/**
 * Check if text content contains a value
 */
function evaluateTextContains(element: Element, rule: CustomRule): boolean {
  const textContent = element.textContent || '';
  if (!rule.conditionValue) return false;
  return textContent.toLowerCase().includes(rule.conditionValue.toLowerCase());
}

/**
 * Check if text content is empty
 */
function evaluateTextEmpty(element: Element, _rule: CustomRule): boolean {
  const textContent = (element.textContent || '').trim();
  return textContent === '';
}

// ============================================
// Main Evaluation
// ============================================

/**
 * Evaluate a single custom rule against an element
 */
export function evaluateCustomRule(
  element: Element,
  rule: CustomRule
): boolean {
  switch (rule.condition) {
    case 'exists':
      return evaluateExists(element, rule);
    case 'not-exists':
      return evaluateNotExists(element, rule);
    case 'attribute-equals':
      return evaluateAttributeEquals(element, rule);
    case 'attribute-contains':
      return evaluateAttributeContains(element, rule);
    case 'attribute-missing':
      return evaluateAttributeMissing(element, rule);
    case 'text-contains':
      return evaluateTextContains(element, rule);
    case 'text-empty':
      return evaluateTextEmpty(element, rule);
    default:
      return false;
  }
}

/**
 * Get a CSS selector for an element
 */
function getSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const tagName = element.tagName.toLowerCase();
  const classes = Array.from(element.classList).join('.');
  const parent = element.parentElement;

  let selector = tagName;
  if (classes) {
    selector += `.${classes}`;
  }

  if (parent) {
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

/**
 * Get XPath for an element
 */
function getXPath(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling: Element | null = current.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.tagName.toLowerCase();
    parts.unshift(`${tagName}[${index}]`);
    current = current.parentElement;
  }

  return '/' + parts.join('/');
}

/**
 * Run all custom rules on the document
 */
export function evaluateCustomRules(
  rules: CustomRule[],
  doc: Document = document
): RuleResult[] {
  const results: RuleResult[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    try {
      const elements = doc.querySelectorAll(rule.selector);

      for (const element of elements) {
        const conditionMet = evaluateCustomRule(element, rule);

        // For 'exists' and positive conditions, we report when condition is met
        // For 'not-exists' and 'missing' conditions, we report when condition is met (element exists but shouldn't)
        const shouldReport = shouldReportCondition(rule.condition, conditionMet);

        if (shouldReport) {
          results.push({
            ruleId: `custom_${rule.id}`,
            category: rule.category,
            element: element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: rule.message,
            impact: rule.impact,
            data: {
              customRuleId: rule.id,
              customRuleName: rule.name,
              condition: rule.condition,
            },
          });
        }
      }

      // Special case for 'not-exists': check if NO elements match
      if (rule.condition === 'not-exists' && elements.length === 0) {
        // This is actually a pass - nothing to report
      }
    } catch (error) {
      console.warn(`TheWCAG: Error evaluating custom rule "${rule.name}":`, error);
    }
  }

  return results;
}

/**
 * Determine if we should report based on condition type
 */
function shouldReportCondition(
  condition: CustomRule['condition'],
  conditionMet: boolean
): boolean {
  // For negative conditions (not-exists, attribute-missing, text-empty),
  // we report when the condition is NOT met (element exists when it shouldn't)
  const negativeConditions = ['not-exists'];

  // For attribute/text checking conditions, we report when condition IS met
  // (bad pattern found)
  const positiveConditions = [
    'attribute-equals',
    'attribute-contains',
    'attribute-missing',
    'text-contains',
    'text-empty',
  ];

  if (negativeConditions.includes(condition)) {
    return !conditionMet; // Report if element exists but shouldn't
  }

  if (positiveConditions.includes(condition)) {
    return conditionMet; // Report if pattern is found
  }

  // 'exists' - typically used to check for required elements
  // Don't report if element exists
  return false;
}

// ============================================
// Validation
// ============================================

/**
 * Validate a custom rule definition
 */
export function validateCustomRule(rule: Partial<CustomRule>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!rule.name || rule.name.trim() === '') {
    errors.push('Rule name is required');
  }

  if (!rule.selector || rule.selector.trim() === '') {
    errors.push('CSS selector is required');
  } else {
    try {
      document.querySelector(rule.selector);
    } catch {
      errors.push('Invalid CSS selector');
    }
  }

  if (!rule.condition) {
    errors.push('Condition is required');
  }

  const needsAttribute = ['attribute-equals', 'attribute-contains', 'attribute-missing'];
  if (rule.condition && needsAttribute.includes(rule.condition) && !rule.attribute) {
    errors.push('Attribute name is required for this condition');
  }

  const needsValue = ['attribute-equals', 'attribute-contains', 'text-contains'];
  if (rule.condition && needsValue.includes(rule.condition) && !rule.conditionValue) {
    errors.push('Condition value is required for this condition');
  }

  if (!rule.message || rule.message.trim() === '') {
    errors.push('Error message is required');
  }

  if (!rule.category) {
    errors.push('Category is required');
  }

  if (!rule.impact) {
    errors.push('Impact level is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// Presets
// ============================================

/**
 * Get preset custom rule templates
 */
export function getCustomRulePresets(): Partial<CustomRule>[] {
  return [
    {
      name: 'Links open in new tab without warning',
      selector: 'a[target="_blank"]:not([aria-label*="new"])',
      condition: 'attribute-missing',
      attribute: 'aria-describedby',
      message: 'Link opens in new tab but has no warning for screen reader users',
      category: 'alert' as RuleCategory,
      impact: 'moderate' as ImpactLevel,
    },
    {
      name: 'Images with suspicious alt text',
      selector: 'img[alt]',
      condition: 'attribute-contains',
      attribute: 'alt',
      conditionValue: 'image of',
      message: 'Alt text contains "image of" which is redundant',
      category: 'alert' as RuleCategory,
      impact: 'minor' as ImpactLevel,
    },
    {
      name: 'Form inputs without autocomplete',
      selector: 'input[type="email"], input[type="tel"], input[name*="name"]',
      condition: 'attribute-missing',
      attribute: 'autocomplete',
      message: 'Form input should have autocomplete attribute for better UX',
      category: 'alert' as RuleCategory,
      impact: 'minor' as ImpactLevel,
    },
    {
      name: 'Buttons with only icons',
      selector: 'button:not([aria-label]):not([title])',
      condition: 'text-empty',
      message: 'Button has no text content and no aria-label',
      category: 'error' as RuleCategory,
      impact: 'serious' as ImpactLevel,
    },
    {
      name: 'Skip link missing',
      selector: 'a[href="#main"], a[href="#content"], .skip-link',
      condition: 'not-exists',
      message: 'Page may be missing a skip navigation link',
      category: 'alert' as RuleCategory,
      impact: 'moderate' as ImpactLevel,
    },
    {
      name: 'Tables without headers',
      selector: 'table:not(:has(th))',
      condition: 'exists',
      message: 'Table has no header cells (th elements)',
      category: 'error' as RuleCategory,
      impact: 'serious' as ImpactLevel,
    },
    {
      name: 'Placeholder as only label',
      selector: 'input[placeholder]:not([aria-label]):not([id])',
      condition: 'exists',
      message: 'Input uses placeholder as only label which is not accessible',
      category: 'error' as RuleCategory,
      impact: 'serious' as ImpactLevel,
    },
    {
      name: 'Positive tabindex values',
      selector: '[tabindex]:not([tabindex="0"]):not([tabindex="-1"])',
      condition: 'exists',
      message: 'Element has positive tabindex which disrupts natural tab order',
      category: 'alert' as RuleCategory,
      impact: 'moderate' as ImpactLevel,
    },
  ];
}

// ============================================
// Export
// ============================================

export default {
  evaluateCustomRule,
  evaluateCustomRules,
  validateCustomRule,
  getCustomRulePresets,
};

