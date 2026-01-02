// ============================================
// TheWCAG Evaluation Extension - Keyboard Rules
// Rules for keyboard accessibility (WCAG 2.1.1, 2.1.2, 2.4.7)
// ============================================

import { AccessibilityRule, RuleResult, EvaluationContext } from '../../types';
import { getSelector, getXPath, isElementVisible, getAccessibleName } from '../../utils/dom-utils';
import { createRule } from '../index';

// ============================================
// Focus Visibility Rules
// ============================================

const focusNotVisible: AccessibilityRule = createRule('focus_not_visible', 'Focus not visible', 'error', {
  description: 'Focus indicator is not visible on interactive element',
  impact: 'serious',
  wcagCriteria: ['2.4.7'],
  wcagLevel: 'AA',
  tags: ['keyboard', 'focus'],
  evaluate: (element: Element): RuleResult | null => {
    // Only check interactive elements
    const interactiveElements = ['a', 'button', 'input', 'select', 'textarea'];
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const tabindex = element.getAttribute('tabindex');

    const isInteractive =
      interactiveElements.includes(tagName) ||
      role === 'button' ||
      role === 'link' ||
      role === 'checkbox' ||
      role === 'radio' ||
      role === 'tab' ||
      role === 'menuitem' ||
      (tabindex !== null && parseInt(tabindex, 10) >= 0);

    if (!isInteractive) return null;
    if (!isElementVisible(element)) return null;

    // Check for outline: none or outline: 0 without alternative
    const style = window.getComputedStyle(element);
    const focusStyle = window.getComputedStyle(element, ':focus');

    // Check if outline is explicitly removed
    const outlineStyle = style.outlineStyle;
    const outlineWidth = parseFloat(style.outlineWidth);

    if ((outlineStyle === 'none' || outlineWidth === 0) && !element.classList.contains('focus-visible')) {
      // Check if there's a custom focus indicator via box-shadow or border
      const boxShadow = style.boxShadow;
      const hasBoxShadowFocus = boxShadow && boxShadow !== 'none';

      if (!hasBoxShadowFocus) {
        return {
          ruleId: 'focus_not_visible',
          category: 'error',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Element may not have visible focus indicator',
          impact: 'serious',
          data: { tagName, role },
        };
      }
    }

    return null;
  },
  documentation: {
    summary: 'Interactive element may not have a visible focus indicator.',
    purpose: 'Keyboard users need to see which element has focus.',
    actions: [
      'Ensure focus styles are visible (outline, border, or shadow).',
      'Do not remove :focus styles without providing alternatives.',
      'Use :focus-visible for mouse/keyboard differentiation.',
    ],
    algorithm: 'Interactive element has outline:none without alternative focus styles.',
    guidelines: [
      {
        id: '2.4.7',
        name: 'Focus Visible',
        level: 'AA',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
      },
    ],
  },
});

// ============================================
// Keyboard Trap Rules
// ============================================

const keyboardTrap: AccessibilityRule = createRule('keyboard_trap', 'Potential keyboard trap', 'error', {
  description: 'Element may trap keyboard focus',
  impact: 'critical',
  wcagCriteria: ['2.1.2'],
  wcagLevel: 'A',
  tags: ['keyboard', 'focus'],
  evaluate: (element: Element): RuleResult | null => {
    // Check for elements that commonly trap focus
    const tagName = element.tagName.toLowerCase();

    // Check iframes
    if (tagName === 'iframe') {
      const iframe = element as HTMLIFrameElement;
      // Iframes without proper focus management can trap users
      if (!iframe.hasAttribute('tabindex') || parseInt(iframe.getAttribute('tabindex') || '0', 10) >= 0) {
        return {
          ruleId: 'keyboard_trap',
          category: 'error',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Iframe may trap keyboard focus - verify focus can exit',
          impact: 'critical',
          data: { src: iframe.src },
        };
      }
    }

    // Check for modal dialogs without proper focus management
    if (element.getAttribute('role') === 'dialog' || tagName === 'dialog') {
      const hasCloseButton = element.querySelector('[aria-label*="close" i], [aria-label*="dismiss" i], button');
      const hasEscapeHandler = element.hasAttribute('onkeydown') || element.hasAttribute('onkeyup');

      if (!hasCloseButton && !hasEscapeHandler) {
        return {
          ruleId: 'keyboard_trap',
          category: 'error',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Dialog may trap focus - add close button or Escape handler',
          impact: 'critical',
        };
      }
    }

    // Check for contenteditable elements
    if (element.getAttribute('contenteditable') === 'true') {
      return {
        ruleId: 'keyboard_trap',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Contenteditable may trap focus - verify Tab exits the element',
        impact: 'moderate',
      };
    }

    return null;
  },
  documentation: {
    summary: 'Element may trap keyboard focus, preventing users from leaving.',
    purpose: 'Users must be able to navigate away from all elements using keyboard.',
    actions: [
      'Ensure focus can move out of iframes.',
      'Add close button and Escape handler to modals.',
      'Test Tab and Shift+Tab navigation.',
    ],
    algorithm: 'Detects iframes, dialogs, and contenteditable elements that may trap focus.',
    guidelines: [
      {
        id: '2.1.2',
        name: 'No Keyboard Trap',
        level: 'A',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html',
      },
    ],
  },
});

// ============================================
// Focus Order Rules
// ============================================

const focusOrderIncorrect: AccessibilityRule = createRule(
  'focus_order_incorrect',
  'Focus order may be incorrect',
  'alert',
  {
    description: 'Visual order may not match DOM order',
    impact: 'moderate',
    wcagCriteria: ['2.4.3'],
    wcagLevel: 'A',
    tags: ['keyboard', 'focus'],
    evaluate: (element: Element): RuleResult | null => {
      // Check for CSS that might affect visual order
      if (!isElementVisible(element)) return null;

      const style = window.getComputedStyle(element);

      // Check for flexbox/grid order properties
      const order = parseInt(style.order, 10);
      if (order !== 0 && !isNaN(order)) {
        return {
          ruleId: 'focus_order_incorrect',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: `Element has CSS order: ${order} - verify focus order matches visual order`,
          impact: 'moderate',
          data: { order },
        };
      }

      // Check for flex-direction: row-reverse or column-reverse
      const flexDirection = style.flexDirection;
      if (flexDirection === 'row-reverse' || flexDirection === 'column-reverse') {
        // Only flag containers with interactive children
        const hasInteractiveChildren = element.querySelector('a, button, input, select, textarea, [tabindex]');
        if (hasInteractiveChildren) {
          return {
            ruleId: 'focus_order_incorrect',
            category: 'alert',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `Container has ${flexDirection} - verify focus order matches visual order`,
            impact: 'moderate',
            data: { flexDirection },
          };
        }
      }

      return null;
    },
    documentation: {
      summary: 'CSS may cause visual order to differ from DOM/focus order.',
      purpose: 'Focus order should match the visual presentation.',
      actions: [
        'Use DOM order instead of CSS order when possible.',
        'Test keyboard navigation to verify logical order.',
        'Consider using flexbox order for visual-only changes.',
      ],
      algorithm: 'Detects CSS order, flex-direction reverse that may affect focus order.',
      guidelines: [
        {
          id: '2.4.3',
          name: 'Focus Order',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
        },
      ],
    },
  }
);

// ============================================
// Interactive Element Accessibility
// ============================================

const clickableNotKeyboard: AccessibilityRule = createRule(
  'clickable_not_keyboard',
  'Clickable not keyboard accessible',
  'error',
  {
    description: 'Element has click handler but is not keyboard accessible',
    impact: 'critical',
    wcagCriteria: ['2.1.1'],
    wcagLevel: 'A',
    tags: ['keyboard'],
    evaluate: (element: Element): RuleResult | null => {
      const tagName = element.tagName.toLowerCase();

      // Skip naturally keyboard accessible elements
      const naturallyAccessible = ['a', 'button', 'input', 'select', 'textarea', 'summary'];
      if (naturallyAccessible.includes(tagName)) return null;

      // Check if element has click handler
      const hasOnClick = element.hasAttribute('onclick');
      const hasRole = element.hasAttribute('role');
      const hasTabindex = element.hasAttribute('tabindex');

      // Check for cursor:pointer (common indicator of clickable)
      const style = window.getComputedStyle(element);
      const hasCursorPointer = style.cursor === 'pointer';

      if ((hasOnClick || hasCursorPointer) && !hasRole && !hasTabindex) {
        return {
          ruleId: 'clickable_not_keyboard',
          category: 'error',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Clickable element is not keyboard accessible',
          impact: 'critical',
          data: { tagName, hasOnClick, hasCursorPointer },
        };
      }

      // If has role but no tabindex
      if (hasRole && !hasTabindex) {
        const role = element.getAttribute('role');
        const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem', 'option'];

        if (interactiveRoles.includes(role || '')) {
          return {
            ruleId: 'clickable_not_keyboard',
            category: 'error',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `Element with role="${role}" needs tabindex for keyboard access`,
            impact: 'critical',
            data: { tagName, role },
          };
        }
      }

      return null;
    },
    documentation: {
      summary: 'Element appears clickable but cannot be accessed via keyboard.',
      purpose: 'All interactive elements must be keyboard accessible.',
      actions: [
        'Use semantic HTML (button, a) instead of div/span.',
        'Add tabindex="0" and keyboard event handlers.',
        'Add appropriate ARIA role if using non-semantic element.',
      ],
      algorithm: 'Non-interactive element has onclick or cursor:pointer without tabindex.',
      guidelines: [
        {
          id: '2.1.1',
          name: 'Keyboard',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
        },
      ],
    },
  }
);

// ============================================
// Export all keyboard rules
// ============================================
export const keyboardRules: AccessibilityRule[] = [
  focusNotVisible,
  keyboardTrap,
  focusOrderIncorrect,
  clickableNotKeyboard,
];

