// ============================================
// TheWCAG Evaluation Extension - Mobile/Touch Rules
// Rules for mobile and touch accessibility (WCAG 2.1/2.2)
// ============================================

import { AccessibilityRule, RuleResult } from '../../types';
import { getSelector, getXPath, isElementVisible } from '../../utils/dom-utils';
import { createRule } from '../index';

// ============================================
// Touch Target Size Rules (WCAG 2.5.5, 2.5.8)
// ============================================

const targetSizeMinimum: AccessibilityRule = createRule(
  'target_size_minimum',
  'Touch target too small',
  'alert', // Downgraded to alert - inline links are exempt by WCAG
  {
    description: 'Interactive element is smaller than minimum touch target size (24x24px)',
    impact: 'moderate',
    wcagCriteria: ['2.5.8'],
    wcagLevel: 'AA',
    tags: ['mobile', 'touch', 'target-size'],
    evaluate: (element: Element): RuleResult | null => {
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      const tabindex = element.getAttribute('tabindex');

      // WCAG 2.5.8 EXCEPTIONS - Do not flag:
      // 1. Inline links within text (explicitly exempt)
      // 2. User agent controls (browser defaults)
      // 3. Essential small targets (can't be enlarged)
      
      // Skip inline links (text within paragraphs, sentences)
      if (tagName === 'a' || role === 'link') {
        const parent = element.parentElement;
        if (parent) {
          const parentTag = parent.tagName.toLowerCase();
          // Inline if inside text containers
          if (['p', 'span', 'li', 'td', 'th', 'label', 'div'].includes(parentTag)) {
            const parentText = parent.textContent || '';
            const linkText = element.textContent || '';
            // If link is part of larger text, it's inline
            if (parentText.length > linkText.length + 10) return null;
          }
        }
      }

      const interactiveElements = ['button', 'input', 'select', 'textarea'];
      const interactiveRoles = ['button', 'checkbox', 'radio', 'tab', 'menuitem', 'option', 'switch'];

      const isInteractive =
        interactiveElements.includes(tagName) ||
        interactiveRoles.includes(role || '') ||
        (tabindex !== null && parseInt(tabindex, 10) >= 0);

      if (!isInteractive) return null;
      if (!isElementVisible(element)) return null;

      // Skip hidden inputs, checkboxes/radios with labels (label provides target)
      if (tagName === 'input') {
        const input = element as HTMLInputElement;
        if (input.type === 'hidden') return null;
        if (['checkbox', 'radio'].includes(input.type) && input.labels && input.labels.length > 0) {
          return null; // Label provides adequate target
        }
      }

      const rect = element.getBoundingClientRect();
      const minSize = 24;

      // Only flag if BOTH dimensions are too small (WCAG allows one dimension to be small)
      if (rect.width < minSize && rect.height < minSize) {
        const hasSpacing = checkTargetSpacing(element, minSize);

        if (!hasSpacing) {
          return {
            ruleId: 'target_size_minimum',
            category: 'alert',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `Touch target is ${Math.round(rect.width)}x${Math.round(rect.height)}px (consider 24x24px minimum)`,
            impact: 'moderate',
            data: {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              tagName,
            },
          };
        }
      }

      return null;
    },
    documentation: {
      summary: 'Interactive element may be smaller than 24x24 CSS pixels.',
      purpose: 'Small targets are difficult to activate, especially for users with motor impairments.',
      actions: [
        'Increase the clickable/tappable area to at least 24x24 pixels.',
        'Add padding to increase target size without changing visual size.',
        'Note: Inline links within text are exempt from this requirement.',
      ],
      algorithm: 'Interactive element has BOTH width and height less than 24px. Inline links exempt.',
      guidelines: [
        {
          id: '2.5.8',
          name: 'Target Size (Minimum)',
          level: 'AA',
          url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html',
        },
      ],
    },
  }
);

const targetSizeEnhanced: AccessibilityRule = createRule(
  'target_size_enhanced',
  'Touch target below recommended size',
  'alert',
  {
    description: 'Interactive element is smaller than recommended touch target size (44x44px)',
    impact: 'moderate',
    wcagCriteria: ['2.5.5'],
    wcagLevel: 'AAA',
    tags: ['mobile', 'touch', 'target-size'],
    evaluate: (element: Element): RuleResult | null => {
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute('role');

      const interactiveElements = ['a', 'button', 'input', 'select', 'textarea'];
      const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem'];

      const isInteractive =
        interactiveElements.includes(tagName) || interactiveRoles.includes(role || '');

      if (!isInteractive) return null;
      if (!isElementVisible(element)) return null;

      if (tagName === 'input' && (element as HTMLInputElement).type === 'hidden') return null;

      const rect = element.getBoundingClientRect();
      const recommendedSize = 44;
      const minSize = 24;

      // Only alert if between 24 and 44
      if (rect.width >= minSize && rect.height >= minSize) {
        if (rect.width < recommendedSize || rect.height < recommendedSize) {
          return {
            ruleId: 'target_size_enhanced',
            category: 'alert',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `Touch target is ${Math.round(rect.width)}x${Math.round(rect.height)}px (recommended 44x44px)`,
            impact: 'moderate',
            data: {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          };
        }
      }

      return null;
    },
    documentation: {
      summary: 'Interactive element is smaller than recommended 44x44 CSS pixels.',
      purpose: 'Larger targets are easier to activate for all users.',
      actions: [
        'Consider increasing target size to 44x44 pixels.',
        'This is especially important for frequently used controls.',
      ],
      algorithm: 'Interactive element is between 24px and 44px.',
      guidelines: [
        {
          id: '2.5.5',
          name: 'Target Size (Enhanced)',
          level: 'AAA',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/target-size.html',
        },
      ],
    },
  }
);

// Helper function to check spacing around targets
function checkTargetSpacing(element: Element, minSize: number): boolean {
  const rect = element.getBoundingClientRect();

  // Get all nearby interactive elements
  const allInteractive = document.querySelectorAll(
    'a, button, input, select, textarea, [role="button"], [role="link"], [tabindex]'
  );

  for (const other of allInteractive) {
    if (other === element) continue;

    const otherRect = other.getBoundingClientRect();

    // Calculate distance between elements
    const horizontalGap = Math.min(
      Math.abs(rect.right - otherRect.left),
      Math.abs(otherRect.right - rect.left)
    );
    const verticalGap = Math.min(
      Math.abs(rect.bottom - otherRect.top),
      Math.abs(otherRect.bottom - rect.top)
    );

    // Check if they're close and the gap is too small
    const isClose = horizontalGap < 50 || verticalGap < 50;
    const requiredGap = minSize - Math.min(rect.width, rect.height, otherRect.width, otherRect.height);

    if (isClose && Math.min(horizontalGap, verticalGap) < requiredGap) {
      return false;
    }
  }

  return true;
}

// ============================================
// Orientation Rules (WCAG 1.3.4)
// ============================================

const orientationLock: AccessibilityRule = createRule('orientation_lock', 'Orientation may be locked', 'alert', {
  description: 'Page may restrict display orientation',
  impact: 'serious',
  wcagCriteria: ['1.3.4'],
  wcagLevel: 'AA',
  tags: ['mobile', 'orientation'],
  evaluate: (element: Element, context): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'html') return null;

    // Check for orientation lock in CSS (would need to check stylesheets)
    // This is a simplified check - full check would need CSS analysis

    // Check viewport meta tag
    const viewport = context.document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const content = viewport.getAttribute('content') || '';
      // Check for orientation restrictions (these are deprecated but still used)
      if (
        content.includes('orientation') ||
        content.includes('minimal-ui') ||
        content.includes('device-width') === false
      ) {
        return {
          ruleId: 'orientation_lock',
          category: 'alert',
          element: viewport,
          selector: 'meta[name="viewport"]',
          xpath: '//meta[@name="viewport"]',
          message: 'Viewport meta may restrict orientation - verify content works in both orientations',
          impact: 'serious',
          data: { content },
        };
      }
    }

    return null;
  },
  documentation: {
    summary: 'Page may restrict display to a particular orientation.',
    purpose: 'Users should be able to view content in their preferred orientation.',
    actions: [
      'Ensure content works in both portrait and landscape.',
      'Do not use CSS or JavaScript to lock orientation.',
      'Only restrict orientation when essential for function.',
    ],
    algorithm: 'Checks viewport meta for orientation restrictions.',
    guidelines: [
      {
        id: '1.3.4',
        name: 'Orientation',
        level: 'AA',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/orientation.html',
      },
    ],
  },
});

// ============================================
// Motion/Animation Rules (WCAG 2.3.3)
// ============================================

const motionActuation: AccessibilityRule = createRule(
  'motion_actuation',
  'Motion-activated functionality',
  'alert',
  {
    description: 'Element may use motion for activation',
    impact: 'serious',
    wcagCriteria: ['2.5.4'],
    wcagLevel: 'A',
    tags: ['mobile', 'motion'],
    evaluate: (element: Element): RuleResult | null => {
      // Check for device motion event handlers
      const motionEvents = ['ondevicemotion', 'ondeviceorientation', 'ondeviceorientationabsolute'];

      for (const event of motionEvents) {
        if (element.hasAttribute(event)) {
          return {
            ruleId: 'motion_actuation',
            category: 'alert',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `Element uses ${event} - ensure alternative input method exists`,
            impact: 'serious',
            data: { event },
          };
        }
      }

      return null;
    },
    documentation: {
      summary: 'Element may require device motion for activation.',
      purpose: 'Users who cannot move devices need alternative input methods.',
      actions: [
        'Provide alternative ways to perform motion-activated actions.',
        'Allow users to disable motion-based features.',
        'Use motion for enhancement, not as sole input method.',
      ],
      algorithm: 'Detects device motion event handlers on elements.',
      guidelines: [
        {
          id: '2.5.4',
          name: 'Motion Actuation',
          level: 'A',
          url: 'https://www.w3.org/WAI/WCAG21/Understanding/motion-actuation.html',
        },
      ],
    },
  }
);

// ============================================
// Pointer Gestures Rules (WCAG 2.5.1)
// ============================================

const pointerGestures: AccessibilityRule = createRule('pointer_gestures', 'Complex pointer gestures', 'alert', {
  description: 'Element may require complex gestures',
  impact: 'serious',
  wcagCriteria: ['2.5.1'],
  wcagLevel: 'A',
  tags: ['mobile', 'gestures'],
  evaluate: (element: Element): RuleResult | null => {
    // Check for touch gesture handlers that might indicate complex gestures
    const gestureEvents = [
      'ontouchstart',
      'ontouchmove',
      'ontouchend',
      'ongesturestart',
      'ongesturechange',
      'ongestureend',
    ];

    for (const event of gestureEvents) {
      if (element.hasAttribute(event)) {
        // Check if there's also a click handler (alternative)
        const hasClick = element.hasAttribute('onclick') || element.hasAttribute('onpointerdown');

        if (!hasClick) {
          return {
            ruleId: 'pointer_gestures',
            category: 'alert',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `Element uses ${event} - ensure single-pointer alternative exists`,
            impact: 'serious',
            data: { event },
          };
        }
      }
    }

    return null;
  },
  documentation: {
    summary: 'Element may require multipoint or path-based gestures.',
    purpose: 'Users may not be able to perform complex gestures.',
    actions: [
      'Provide single-pointer alternatives for all gestures.',
      'Ensure pinch, swipe, etc. have button alternatives.',
      'Test with keyboard and single-click interactions.',
    ],
    algorithm: 'Detects touch/gesture handlers without click alternatives.',
    guidelines: [
      {
        id: '2.5.1',
        name: 'Pointer Gestures',
        level: 'A',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/pointer-gestures.html',
      },
    ],
  },
});

// ============================================
// Export all mobile rules
// ============================================
export const mobileRules: AccessibilityRule[] = [
  targetSizeMinimum,
  targetSizeEnhanced,
  orientationLock,
  motionActuation,
  pointerGestures,
];

