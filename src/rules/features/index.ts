// ============================================
// TheWCAG Evaluation Extension - Feature Rules
// Complete accessibility feature detection rules
// ============================================

import { AccessibilityRule, RuleResult, EvaluationContext } from '../../types';
import { 
  getSelector, 
  getXPath, 
  getAccessibleName,
  getTextContent,
} from '../../utils/dom-utils';
import { createRule } from '../index';

// ============================================
// Alt Text Feature Rules
// ============================================

const alt: AccessibilityRule = createRule('alt', 'Alt text present', 'feature', {
  description: 'Image has alternative text',
  impact: 'none',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const alt = img.alt;
    
    // Skip if inside link (handled by alt_link)
    if (img.closest('a[href]')) return null;
    
    // Skip if no alt or suspicious alt
    if (alt === undefined) return null;
    if (alt === '') return null; // null alt is handled separately
    if (alt.trim() === '') return null;
    
    return {
      ruleId: 'alt',
      category: 'feature',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Image has alt text',
      impact: 'none',
      data: { alt, src: img.src },
    };
  },
  documentation: {
    summary: 'An image has appropriate alternative text.',
    purpose: 'Alternative text provides image content to screen reader users.',
    actions: [],
    algorithm: 'An image has a non-empty alt attribute.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altNull: AccessibilityRule = createRule('alt_null', 'Null alt text', 'feature', {
  description: 'Decorative image is hidden from screen readers',
  impact: 'none',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    
    if (img.hasAttribute('alt') && img.alt === '') {
      return {
        ruleId: 'alt_null',
        category: 'feature',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Decorative image has null alt',
        impact: 'none',
        data: { src: img.src },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A decorative image has empty alt text (alt="").',
    purpose: 'Empty alt hides decorative images from screen readers.',
    actions: [],
    algorithm: 'An image has alt="".',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altLink: AccessibilityRule = createRule('alt_link', 'Linked image alt', 'feature', {
  description: 'Linked image has alt text',
  impact: 'none',
  wcagCriteria: ['1.1.1', '2.4.4'],
  wcagLevel: 'A',
  tags: ['images', 'links', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const link = img.closest('a[href]') as HTMLAnchorElement | null;
    
    if (!link) return null;
    if (!img.alt || img.alt.trim() === '') return null;
    
    return {
      ruleId: 'alt_link',
      category: 'feature',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Linked image has alt text',
      impact: 'none',
      data: { alt: img.alt, href: link.href },
    };
  },
  documentation: {
    summary: 'An image within a link has alt text.',
    purpose: 'Alt text describes the link destination for screen readers.',
    actions: [],
    algorithm: 'An image inside a link has non-empty alt.',
    guidelines: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' },
      { id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' },
    ],
  },
});

const altInput: AccessibilityRule = createRule('alt_input', 'Image button alt', 'feature', {
  description: 'Image button has alt text',
  impact: 'none',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'forms', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'input') return null;
    
    const input = element as HTMLInputElement;
    if (input.type.toLowerCase() !== 'image') return null;
    
    if (input.alt && input.alt.trim() !== '') {
      return {
        ruleId: 'alt_input',
        category: 'feature',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image button has alt text',
        impact: 'none',
        data: { alt: input.alt },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An image input button has alt text.',
    purpose: 'Alt text describes the button function.',
    actions: [],
    algorithm: 'An input type="image" has non-empty alt.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altArea: AccessibilityRule = createRule('alt_area', 'Image map area alt', 'feature', {
  description: 'Image map area has alt text',
  impact: 'none',
  wcagCriteria: ['1.1.1', '2.4.4'],
  wcagLevel: 'A',
  tags: ['images', 'alt', 'imagemap'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'area') return null;
    
    const area = element as HTMLAreaElement;
    if (!area.hasAttribute('href')) return null;
    
    if (area.alt && area.alt.trim() !== '') {
      return {
        ruleId: 'alt_area',
        category: 'feature',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image map area has alt text',
        impact: 'none',
        data: { alt: area.alt, href: area.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An area element has alt text.',
    purpose: 'Alt text describes the image map hotspot.',
    actions: [],
    algorithm: 'An area element has non-empty alt.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altMap: AccessibilityRule = createRule('alt_map', 'Image map alt', 'feature', {
  description: 'Image with image map has alt text',
  impact: 'none',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt', 'imagemap'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    if (!img.hasAttribute('usemap')) return null;
    
    if (img.alt && img.alt.trim() !== '') {
      return {
        ruleId: 'alt_map',
        category: 'feature',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image with image map has alt text',
        impact: 'none',
        data: { alt: img.alt, usemap: img.useMap },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An image with an image map has alt text.',
    purpose: 'Alt text provides context for the image map.',
    actions: [],
    algorithm: 'An image with usemap has non-empty alt.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altSpacer: AccessibilityRule = createRule('alt_spacer', 'Spacer image alt', 'feature', {
  description: 'Spacer image has null alt text',
  impact: 'none',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    
    // Detect spacer images
    const isSpacerImage = (img.width <= 3 && img.height <= 3) ||
      /spacer|blank|clear|pixel|trans|1x1/i.test(img.src);
    
    if (!isSpacerImage) return null;
    
    if (img.hasAttribute('alt') && img.alt === '') {
      return {
        ruleId: 'alt_spacer',
        category: 'feature',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Spacer image has null alt',
        impact: 'none',
        data: { src: img.src },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A spacer image has empty alt text.',
    purpose: 'Empty alt hides spacer images from screen readers.',
    actions: [],
    algorithm: 'A spacer image has alt="".',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

// ============================================
// Form Feature Rules
// ============================================

const label: AccessibilityRule = createRule('label', 'Form label', 'feature', {
  description: 'Form control has a label',
  impact: 'none',
  wcagCriteria: ['1.3.1', '4.1.2'],
  wcagLevel: 'A',
  tags: ['forms', 'labels'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'label') return null;
    
    const label = element as HTMLLabelElement;
    const text = getTextContent(label);
    
    if (text && text.trim() !== '') {
      const forAttr = label.htmlFor;
      
      // Check if label has for attribute or wraps an input
      if (forAttr) {
        const target = document.getElementById(forAttr);
        if (target && ['input', 'select', 'textarea'].includes(target.tagName.toLowerCase())) {
          return {
            ruleId: 'label',
            category: 'feature',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: 'Label is associated with form control',
            impact: 'none',
            data: { text, for: forAttr },
          };
        }
      }
      
      // Check for wrapped input
      const wrappedInput = label.querySelector('input, select, textarea');
      if (wrappedInput) {
        return {
          ruleId: 'label',
          category: 'feature',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Label wraps form control',
          impact: 'none',
          data: { text },
        };
      }
    }
    return null;
  },
  documentation: {
    summary: 'A form control has an associated label.',
    purpose: 'Labels describe form controls for screen reader users.',
    actions: [],
    algorithm: 'A label is associated with a form control.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const fieldset: AccessibilityRule = createRule('fieldset', 'Fieldset with legend', 'feature', {
  description: 'Fieldset groups related form controls with a legend',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['forms'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'fieldset') return null;
    
    const legend = element.querySelector('legend');
    
    if (legend && getTextContent(legend).trim()) {
      return {
        ruleId: 'fieldset',
        category: 'feature',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Fieldset has a legend',
        impact: 'none',
        data: { legend: getTextContent(legend) },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A fieldset groups form controls with a legend.',
    purpose: 'Fieldsets with legends provide context for form control groups.',
    actions: [],
    algorithm: 'A fieldset has a non-empty legend.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Link Feature Rules
// ============================================

const linkSkip: AccessibilityRule = createRule('link_skip', 'Skip link', 'feature', {
  description: 'A skip navigation link is present',
  impact: 'none',
  wcagCriteria: ['2.4.1'],
  wcagLevel: 'A',
  tags: ['links', 'navigation'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return null;
    
    const text = getAccessibleName(link).toLowerCase();
    const skipPatterns = ['skip', 'jump', 'main content', 'skip to', 'jump to'];
    
    if (skipPatterns.some(p => text.includes(p))) {
      return {
        ruleId: 'link_skip',
        category: 'feature',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Skip link is present',
        impact: 'none',
        data: { text, href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A skip navigation link is present.',
    purpose: 'Skip links allow keyboard users to bypass repeated content.',
    actions: [],
    algorithm: 'A link contains "skip" and points to a page anchor.',
    guidelines: [{ id: '2.4.1', name: 'Bypass Blocks', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html' }],
  },
});

const linkSkipTarget: AccessibilityRule = createRule('link_skip_target', 'Skip link target', 'feature', {
  description: 'A skip link target element is present',
  impact: 'none',
  wcagCriteria: ['2.4.1'],
  wcagLevel: 'A',
  tags: ['links', 'navigation'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    // Check if this element is a skip link target
    const id = element.id;
    if (!id) return null;
    
    // Find skip links that point to this element
    const skipLinks = context.document.querySelectorAll('a[href^="#"]');
    for (const link of Array.from(skipLinks)) {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        const text = getAccessibleName(link).toLowerCase();
        const skipPatterns = ['skip', 'jump', 'main content'];
        if (skipPatterns.some(p => text.includes(p))) {
          return {
            ruleId: 'link_skip_target',
            category: 'feature',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: 'Skip link target',
            impact: 'none',
            data: { id },
          };
        }
      }
    }
    return null;
  },
  documentation: {
    summary: 'An element is the target of a skip link.',
    purpose: 'This element receives focus when skip link is activated.',
    actions: [],
    algorithm: 'Element ID matches a skip link href.',
    guidelines: [{ id: '2.4.1', name: 'Bypass Blocks', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html' }],
  },
});

// ============================================
// Language Feature Rules
// ============================================

const lang: AccessibilityRule = createRule('lang', 'Page language', 'feature', {
  description: 'The page language is identified',
  impact: 'none',
  wcagCriteria: ['3.1.1'],
  wcagLevel: 'A',
  tags: ['language'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'html') return null;
    
    const langAttr = element.getAttribute('lang') || element.getAttribute('xml:lang');
    
    if (langAttr && langAttr.trim() !== '') {
      return {
        ruleId: 'lang',
        category: 'feature',
        element,
        selector: 'html',
        xpath: '/html',
        message: `Page language is "${langAttr}"`,
        impact: 'none',
        data: { lang: langAttr },
      };
    }
    return null;
  },
  documentation: {
    summary: 'The page has a lang attribute.',
    purpose: 'Language identification enables correct screen reader pronunciation.',
    actions: [],
    algorithm: 'The html element has a non-empty lang attribute.',
    guidelines: [{ id: '3.1.1', name: 'Language of Page', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html' }],
  },
});

// ============================================
// Extended Description Feature Rules
// ============================================

const longdesc: AccessibilityRule = createRule('longdesc', 'Long description', 'feature', {
  description: 'Image has a long description',
  impact: 'none',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const longdesc = img.getAttribute('longdesc');
    
    if (longdesc && longdesc.trim() !== '') {
      return {
        ruleId: 'longdesc',
        category: 'feature',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image has longdesc',
        impact: 'none',
        data: { longdesc },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An image has a longdesc attribute.',
    purpose: 'Longdesc provides an extended description for complex images.',
    actions: [],
    algorithm: 'An image has a non-empty longdesc attribute.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

// ============================================
// Export all feature rules
// ============================================
export const featureRules: AccessibilityRule[] = [
  // Alt text
  alt,
  altNull,
  altLink,
  altInput,
  altArea,
  altMap,
  altSpacer,
  // Forms
  label,
  fieldset,
  // Links
  linkSkip,
  linkSkipTarget,
  // Language
  lang,
  // Extended descriptions
  longdesc,
];
