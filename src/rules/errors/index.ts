// ============================================
// TheWCAG Evaluation Extension - Error Rules
// Complete accessibility error detection rules
// ============================================

import { AccessibilityRule, RuleResult, EvaluationContext } from '../../types';
import { 
  getSelector, 
  getXPath, 
  getAccessibleName,
  getAssociatedLabel,
  getTextContent,
  hasValidLanguage,
  isElementVisible,
} from '../../utils/dom-utils';
import { createRule } from '../index';

// ============================================
// Alt Text Error Rules
// ============================================

const altMissing: AccessibilityRule = createRule('alt_missing', 'Missing alt text', 'error', {
  description: 'Image is missing alternative text',
  impact: 'critical',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    if (img.getAttribute('aria-hidden') === 'true') return null;
    if (img.closest('a[href]')) return null; // Handled by alt_link_missing
    
    if (!img.hasAttribute('alt')) {
      return {
        ruleId: 'alt_missing',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image is missing alt attribute',
        impact: 'critical',
        data: { src: img.src },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An image does not have an alt attribute.',
    purpose: 'Screen reader users will not know the content or function of the image.',
    actions: ['Add an alt attribute with appropriate alternative text.', 'If decorative, use alt="" (empty alt).'],
    algorithm: 'An img element does not have an alt attribute.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altLinkMissing: AccessibilityRule = createRule('alt_link_missing', 'Linked image missing alt', 'error', {
  description: 'A linked image is missing alternative text',
  impact: 'critical',
  wcagCriteria: ['1.1.1', '2.4.4'],
  wcagLevel: 'A',
  tags: ['images', 'links', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const link = img.closest('a[href]') as HTMLAnchorElement | null;
    if (!link) return null;
    
    const linkText = getTextContent(link).replace(getTextContent(img), '').trim();
    if (linkText) return null;
    
    if (!img.hasAttribute('alt') || img.alt === '') {
      return {
        ruleId: 'alt_link_missing',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Linked image is missing alt text',
        impact: 'critical',
        data: { src: img.src, href: link.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An image within a link does not have alternative text.',
    purpose: 'Screen reader users will not know the destination or function of the link.',
    actions: ['Add alt text to the image that describes the link destination.'],
    algorithm: 'An img within a link has no alt attribute or empty alt, and the link has no other text.',
    guidelines: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' },
      { id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' },
    ],
  },
});

const altInputMissing: AccessibilityRule = createRule('alt_input_missing', 'Image button missing alt', 'error', {
  description: 'An image input (button) is missing alternative text',
  impact: 'critical',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'forms', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'input') return null;
    
    const input = element as HTMLInputElement;
    if (input.type.toLowerCase() !== 'image') return null;
    
    if (!input.hasAttribute('alt') || input.alt === '') {
      return {
        ruleId: 'alt_input_missing',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image button is missing alt text',
        impact: 'critical',
        data: { src: input.src },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An input type="image" does not have alternative text.',
    purpose: 'Screen reader users will not know the function of the image button.',
    actions: ['Add an alt attribute that describes the button action.'],
    algorithm: 'An input type="image" has no alt attribute or empty alt.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altAreaMissing: AccessibilityRule = createRule('alt_area_missing', 'Image map area missing alt', 'error', {
  description: 'An image map area is missing alternative text',
  impact: 'critical',
  wcagCriteria: ['1.1.1', '2.4.4'],
  wcagLevel: 'A',
  tags: ['images', 'alt', 'imagemap'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'area') return null;
    
    const area = element as HTMLAreaElement;
    if (!area.hasAttribute('href')) return null;
    
    if (!area.hasAttribute('alt') || area.alt === '') {
      return {
        ruleId: 'alt_area_missing',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image map area is missing alt text',
        impact: 'critical',
        data: { href: area.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An area element within an image map does not have alt text.',
    purpose: 'Screen reader users will not understand the image map hotspot.',
    actions: ['Add alt text to the area element describing the link destination.'],
    algorithm: 'An area element with href has no alt attribute or empty alt.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altMapMissing: AccessibilityRule = createRule('alt_map_missing', 'Image with map missing alt', 'error', {
  description: 'An image that uses an image map is missing alternative text',
  impact: 'critical',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt', 'imagemap'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    if (!img.hasAttribute('usemap')) return null;
    
    if (!img.hasAttribute('alt')) {
      return {
        ruleId: 'alt_map_missing',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image with image map is missing alt text',
        impact: 'critical',
        data: { src: img.src, usemap: img.useMap },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An image that uses an image map does not have alt text.',
    purpose: 'The image needs alternative text to provide context for the image map.',
    actions: ['Add alt text describing the overall image map purpose.'],
    algorithm: 'An img with usemap attribute has no alt attribute.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altSpacerMissing: AccessibilityRule = createRule('alt_spacer_missing', 'Spacer image missing alt', 'error', {
  description: 'A spacer image is missing null/empty alt text',
  impact: 'moderate',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    
    // Detect spacer images
    const isSpacerImage = (img.width <= 3 && img.height <= 3) ||
      /spacer|blank|clear|pixel|trans|1x1/i.test(img.src) ||
      /spacer|blank|clear|pixel/i.test(img.alt || '');
    
    if (!isSpacerImage) return null;
    
    if (!img.hasAttribute('alt')) {
      return {
        ruleId: 'alt_spacer_missing',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Spacer image is missing alt="" (null alt)',
        impact: 'moderate',
        data: { src: img.src },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A spacer or decorative image does not have empty alt text.',
    purpose: 'Spacer images should have alt="" to be ignored by screen readers.',
    actions: ['Add alt="" to the spacer image.'],
    algorithm: 'A small or spacer-named image has no alt attribute.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

// ============================================
// Form Label Error Rules
// ============================================

const labelMissing: AccessibilityRule = createRule('label_missing', 'Missing form label', 'error', {
  description: 'A form control does not have a corresponding label',
  impact: 'critical',
  wcagCriteria: ['1.3.1', '4.1.2'],
  wcagLevel: 'A',
  tags: ['forms', 'labels'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    if (!['input', 'select', 'textarea'].includes(tagName)) return null;
    
    const input = element as HTMLInputElement;
    const skipTypes = ['hidden', 'submit', 'reset', 'button', 'image'];
    if (tagName === 'input' && skipTypes.includes(input.type.toLowerCase())) return null;
    
    const accessibleName = getAccessibleName(element);
    if (accessibleName) return null;
    
    const label = getAssociatedLabel(input);
    if (label) return null;
    
    return {
      ruleId: 'label_missing',
      category: 'error',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Form control is missing a label',
      impact: 'critical',
      data: { type: input.type, name: input.name },
    };
  },
  documentation: {
    summary: 'A form control does not have a corresponding label.',
    purpose: 'Screen reader users will not know the purpose of the form control.',
    actions: ['Add a <label> element with for attribute.', 'Or add aria-label or aria-labelledby.'],
    algorithm: 'A form control has no associated label or ARIA label.',
    guidelines: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' },
    ],
  },
});

const labelEmpty: AccessibilityRule = createRule('label_empty', 'Empty form label', 'error', {
  description: 'A form label is present but empty',
  impact: 'critical',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['forms', 'labels'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'label') return null;
    
    const label = element as HTMLLabelElement;
    const text = getTextContent(label);
    
    if (!text || text.trim() === '') {
      return {
        ruleId: 'label_empty',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Label element is empty',
        impact: 'critical',
        data: { for: label.htmlFor },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A label element is present but contains no text.',
    purpose: 'Screen reader users will hear an empty label.',
    actions: ['Add descriptive text to the label.'],
    algorithm: 'A label element has no text content.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const labelMultiple: AccessibilityRule = createRule('label_multiple', 'Multiple labels', 'error', {
  description: 'A form control has multiple labels',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['forms', 'labels'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    if (!['input', 'select', 'textarea'].includes(tagName)) return null;
    
    const input = element as HTMLInputElement;
    if (!input.id) return null;
    
    const labels = context.document.querySelectorAll(`label[for="${CSS.escape(input.id)}"]`);
    
    if (labels.length > 1) {
      return {
        ruleId: 'label_multiple',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Form control has ${labels.length} labels`,
        impact: 'moderate',
        data: { labelCount: labels.length },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A form control has multiple labels associated with it.',
    purpose: 'Multiple labels can cause confusion and unpredictable behavior.',
    actions: ['Remove duplicate labels.', 'Combine label text into a single label.'],
    algorithm: 'Multiple label elements have the same for attribute value.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const selectMissingLabel: AccessibilityRule = createRule('select_missing_label', 'Select missing label', 'error', {
  description: 'A select element does not have a label',
  impact: 'critical',
  wcagCriteria: ['1.3.1', '4.1.2'],
  wcagLevel: 'A',
  tags: ['forms', 'labels'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'select') return null;
    
    const select = element as HTMLSelectElement;
    const accessibleName = getAccessibleName(element);
    if (accessibleName) return null;
    
    const label = getAssociatedLabel(select);
    if (label) return null;
    
    return {
      ruleId: 'select_missing_label',
      category: 'error',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Select element is missing a label',
      impact: 'critical',
      data: { name: select.name },
    };
  },
  documentation: {
    summary: 'A select element does not have an associated label.',
    purpose: 'Screen reader users will not know the purpose of the select.',
    actions: ['Add a <label> element associated with the select.'],
    algorithm: 'A select element has no associated label or ARIA label.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const fieldsetMissing: AccessibilityRule = createRule('fieldset_missing', 'Missing fieldset', 'error', {
  description: 'Radio buttons or checkboxes are not grouped in a fieldset',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['forms'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'input') return null;
    
    const input = element as HTMLInputElement;
    if (!['radio', 'checkbox'].includes(input.type.toLowerCase())) return null;
    
    // Check if there are multiple inputs with same name
    if (!input.name) return null;
    
    const siblings = document.querySelectorAll(`input[name="${CSS.escape(input.name)}"]`);
    if (siblings.length < 2) return null;
    
    // Check if inside fieldset
    if (input.closest('fieldset')) return null;
    
    // Only report on the first one to avoid duplicates
    if (input !== siblings[0]) return null;
    
    return {
      ruleId: 'fieldset_missing',
      category: 'error',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Related form controls are not grouped with fieldset',
      impact: 'moderate',
      data: { name: input.name, count: siblings.length },
    };
  },
  documentation: {
    summary: 'Related radio buttons or checkboxes are not grouped in a fieldset.',
    purpose: 'Fieldsets with legends help users understand related form controls.',
    actions: ['Wrap related inputs in a fieldset with a descriptive legend.'],
    algorithm: 'Multiple radio/checkbox inputs with same name are not in a fieldset.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const legendMissing: AccessibilityRule = createRule('legend_missing', 'Fieldset missing legend', 'error', {
  description: 'A fieldset does not have a legend',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['forms'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'fieldset') return null;
    
    const legend = element.querySelector('legend');
    
    if (!legend || !getTextContent(legend)) {
      return {
        ruleId: 'legend_missing',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Fieldset is missing a legend',
        impact: 'moderate',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A fieldset does not have a legend.',
    purpose: 'The legend provides context for the grouped form controls.',
    actions: ['Add a legend element inside the fieldset with descriptive text.'],
    algorithm: 'A fieldset element has no legend or empty legend.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Link Error Rules
// ============================================

const linkEmpty: AccessibilityRule = createRule('link_empty', 'Empty link', 'error', {
  description: 'A link contains no text',
  impact: 'critical',
  wcagCriteria: ['2.4.4'],
  wcagLevel: 'A',
  tags: ['links'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    if (!link.hasAttribute('href')) return null;
    
    const accessibleName = getAccessibleName(link);
    
    if (!accessibleName || accessibleName.trim() === '') {
      return {
        ruleId: 'link_empty',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Link has no text or accessible name',
        impact: 'critical',
        data: { href: link.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A link contains no text.',
    purpose: 'Screen reader users will not know the destination of the link.',
    actions: ['Add text to the link.', 'Add aria-label to the link.'],
    algorithm: 'An anchor with href has no text or accessible name.',
    guidelines: [{ id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' }],
  },
});

const linkSkipBroken: AccessibilityRule = createRule('link_skip_broken', 'Broken skip link', 'error', {
  description: 'A skip navigation link has a broken target',
  impact: 'serious',
  wcagCriteria: ['2.4.1'],
  wcagLevel: 'A',
  tags: ['links', 'navigation'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return null;
    
    const text = getAccessibleName(link).toLowerCase();
    const skipPatterns = ['skip', 'jump', 'main content'];
    
    if (!skipPatterns.some(p => text.includes(p))) return null;
    
    const targetId = href.slice(1);
    if (!targetId) return null;
    
    const target = context.document.getElementById(targetId);
    
    if (!target) {
      return {
        ruleId: 'link_skip_broken',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Skip link target "${targetId}" does not exist`,
        impact: 'serious',
        data: { href, targetId },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A skip navigation link points to an ID that does not exist.',
    purpose: 'The skip link will not work for keyboard users.',
    actions: ['Add the missing target element with the correct ID.', 'Correct the href in the skip link.'],
    algorithm: 'A skip link href references a non-existent ID.',
    guidelines: [{ id: '2.4.1', name: 'Bypass Blocks', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html' }],
  },
});

const linkInternalBroken: AccessibilityRule = createRule('link_internal_broken', 'Broken same-page link', 'error', {
  description: 'A same-page link has a broken target',
  impact: 'moderate',
  wcagCriteria: ['2.4.1'],
  wcagLevel: 'A',
  tags: ['links'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#') || href === '#') return null;
    
    // Skip skip links (handled separately)
    const text = getAccessibleName(link).toLowerCase();
    if (['skip', 'jump', 'main content'].some(p => text.includes(p))) return null;
    
    const targetId = href.slice(1);
    const target = context.document.getElementById(targetId);
    
    if (!target) {
      return {
        ruleId: 'link_internal_broken',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Same-page link target "${targetId}" does not exist`,
        impact: 'moderate',
        data: { href, targetId },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A same-page/anchor link points to an ID that does not exist.',
    purpose: 'The link will not navigate to the intended location.',
    actions: ['Add the missing target element.', 'Correct the href value.'],
    algorithm: 'An internal link href references a non-existent ID.',
    guidelines: [{ id: '2.4.1', name: 'Bypass Blocks', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html' }],
  },
});

// ============================================
// Button Error Rules
// ============================================

const buttonEmpty: AccessibilityRule = createRule('button_empty', 'Empty button', 'error', {
  description: 'A button contains no text',
  impact: 'critical',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['buttons'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const isButton = tagName === 'button' || 
                     (tagName === 'input' && ['button', 'submit', 'reset'].includes((element as HTMLInputElement).type)) ||
                     element.getAttribute('role') === 'button';
    
    if (!isButton) return null;
    
    const accessibleName = getAccessibleName(element);
    
    if (!accessibleName || accessibleName.trim() === '') {
      return {
        ruleId: 'button_empty',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Button has no text or accessible name',
        impact: 'critical',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A button contains no text.',
    purpose: 'Screen reader users will not know the purpose of the button.',
    actions: ['Add text to the button.', 'Add aria-label or value attribute.'],
    algorithm: 'A button has no text or accessible name.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

// ============================================
// Heading Error Rules
// ============================================

const headingEmpty: AccessibilityRule = createRule('heading_empty', 'Empty heading', 'error', {
  description: 'A heading element contains no text',
  impact: 'serious',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const isHeading = /^h[1-6]$/.test(tagName) || element.getAttribute('role') === 'heading';
    
    if (!isHeading) return null;
    
    const text = getTextContent(element);
    
    if (!text || text.trim() === '') {
      return {
        ruleId: 'heading_empty',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Heading element is empty',
        impact: 'serious',
        data: { level: tagName.replace('h', '') },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A heading element contains no text.',
    purpose: 'Empty headings provide no structure or navigation value.',
    actions: ['Add text to the heading.', 'Remove the empty heading.'],
    algorithm: 'A heading element has no text content.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Table Error Rules
// ============================================

const thEmpty: AccessibilityRule = createRule('th_empty', 'Empty table header', 'error', {
  description: 'A table header cell contains no text',
  impact: 'serious',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'th') return null;
    
    const text = getTextContent(element);
    
    if (!text || text.trim() === '') {
      return {
        ruleId: 'th_empty',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Table header cell is empty',
        impact: 'serious',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A table header cell contains no text.',
    purpose: 'Empty table headers provide no context for data cells.',
    actions: ['Add text to the table header.', 'Use td instead if the cell should be empty.'],
    algorithm: 'A th element has no text content.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const tableLayoutError: AccessibilityRule = createRule('table_layout_error', 'Layout table with headers', 'error', {
  description: 'A layout table contains header cells',
  impact: 'serious',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'table') return null;
    
    const table = element as HTMLTableElement;
    
    // Check if marked as layout table
    if (table.getAttribute('role') === 'presentation' || table.getAttribute('role') === 'none') {
      // Check if it has th elements
      const headers = table.querySelectorAll('th');
      if (headers.length > 0) {
        return {
          ruleId: 'table_layout_error',
          category: 'error',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Layout table contains table header cells',
          impact: 'serious',
          data: { headerCount: headers.length },
        };
      }
    }
    return null;
  },
  documentation: {
    summary: 'A table marked as presentational contains header cells.',
    purpose: 'Tables with role=presentation should not have structural elements.',
    actions: ['Remove the presentation role if it is a data table.', 'Remove th elements if it is a layout table.'],
    algorithm: 'A table with role=presentation or role=none contains th elements.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Language Error Rules
// ============================================

const languageMissing: AccessibilityRule = createRule('language_missing', 'Page language missing', 'error', {
  description: 'The page language is not identified',
  impact: 'serious',
  wcagCriteria: ['3.1.1'],
  wcagLevel: 'A',
  tags: ['language'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'html') return null;
    
    if (!hasValidLanguage(element)) {
      return {
        ruleId: 'language_missing',
        category: 'error',
        element,
        selector: 'html',
        xpath: '/html',
        message: 'Page language is not identified',
        impact: 'serious',
      };
    }
    return null;
  },
  documentation: {
    summary: 'The page does not have a lang attribute.',
    purpose: 'Screen readers need the page language to use correct pronunciation.',
    actions: ['Add a lang attribute to the <html> element.'],
    algorithm: 'The html element does not have a valid lang attribute.',
    guidelines: [{ id: '3.1.1', name: 'Language of Page', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html' }],
  },
});

// ============================================
// Document Error Rules
// ============================================

const titleInvalid: AccessibilityRule = createRule('title_invalid', 'Missing or invalid page title', 'error', {
  description: 'The page title is missing or invalid',
  impact: 'serious',
  wcagCriteria: ['2.4.2'],
  wcagLevel: 'A',
  tags: ['document'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'html') return null;
    
    const title = context.document.title;
    
    if (!title || title.trim() === '') {
      return {
        ruleId: 'title_invalid',
        category: 'error',
        element,
        selector: 'html',
        xpath: '/html',
        message: 'Page title is missing',
        impact: 'serious',
      };
    }
    return null;
  },
  documentation: {
    summary: 'The page does not have a title.',
    purpose: 'Page titles help users identify and navigate between pages.',
    actions: ['Add a descriptive <title> element in the <head>.'],
    algorithm: 'The document has no title or an empty title.',
    guidelines: [{ id: '2.4.2', name: 'Page Titled', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html' }],
  },
});

// ============================================
// Animation/Movement Error Rules
// ============================================

const blink: AccessibilityRule = createRule('blink', 'Blink element', 'error', {
  description: 'A blink element is present',
  impact: 'serious',
  wcagCriteria: ['2.2.2'],
  wcagLevel: 'A',
  tags: ['animation'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'blink') return null;
    
    return {
      ruleId: 'blink',
      category: 'error',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Blink element is present',
      impact: 'serious',
    };
  },
  documentation: {
    summary: 'A <blink> element is present.',
    purpose: 'Blinking content cannot be paused and may cause seizures.',
    actions: ['Remove the blink element.', 'Use CSS animations with controls instead.'],
    algorithm: 'A blink element is present.',
    guidelines: [{ id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html' }],
  },
});

const marquee: AccessibilityRule = createRule('marquee', 'Marquee element', 'error', {
  description: 'A marquee element is present',
  impact: 'serious',
  wcagCriteria: ['2.2.2'],
  wcagLevel: 'A',
  tags: ['animation'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'marquee') return null;
    
    return {
      ruleId: 'marquee',
      category: 'error',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Marquee element is present',
      impact: 'serious',
    };
  },
  documentation: {
    summary: 'A <marquee> element is present.',
    purpose: 'Moving content is difficult to read and cannot be paused.',
    actions: ['Remove the marquee element.', 'Present the content statically.'],
    algorithm: 'A marquee element is present.',
    guidelines: [{ id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html' }],
  },
});

const metaRefresh: AccessibilityRule = createRule('meta_refresh', 'Meta refresh', 'error', {
  description: 'The page has a meta refresh or redirect',
  impact: 'serious',
  wcagCriteria: ['2.2.1', '2.2.4'],
  wcagLevel: 'A',
  tags: ['document'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'meta') return null;
    
    const meta = element as HTMLMetaElement;
    const httpEquiv = meta.getAttribute('http-equiv')?.toLowerCase();
    
    if (httpEquiv !== 'refresh') return null;
    
    const content = meta.getAttribute('content') || '';
    
    // Check if it redirects (has URL) or just refreshes (time only)
    const hasUrl = content.toLowerCase().includes('url=');
    const time = parseInt(content, 10);
    
    if (time > 0) {
      return {
        ruleId: 'meta_refresh',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: hasUrl ? `Page will redirect in ${time} seconds` : `Page will refresh in ${time} seconds`,
        impact: 'serious',
        data: { time, hasUrl },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A meta refresh or redirect is present.',
    purpose: 'Automatic redirects can disorient users and cause content to be missed.',
    actions: ['Use server-side redirects instead.', 'Provide a link for users to navigate manually.'],
    algorithm: 'A meta http-equiv="refresh" with time > 0 is present.',
    guidelines: [
      { id: '2.2.1', name: 'Timing Adjustable', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable.html' },
      { id: '2.2.4', name: 'Interruptions', level: 'AAA', url: 'https://www.w3.org/WAI/WCAG21/Understanding/interruptions.html' },
    ],
  },
});

// ============================================
// ARIA Error Rules
// ============================================

const ariaReferenceBroken: AccessibilityRule = createRule('aria_reference_broken', 'Broken ARIA reference', 'error', {
  description: 'An ARIA attribute references an element that does not exist',
  impact: 'critical',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    const refAttributes = ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'aria-flowto'];
    
    for (const attr of refAttributes) {
      const value = element.getAttribute(attr);
      if (!value) continue;
      
      const ids = value.split(/\s+/);
      for (const id of ids) {
        if (!context.document.getElementById(id)) {
          return {
            ruleId: 'aria_reference_broken',
            category: 'error',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `${attr} references non-existent element: #${id}`,
            impact: 'critical',
            data: { attribute: attr, reference: id },
          };
        }
      }
    }
    return null;
  },
  documentation: {
    summary: 'An ARIA attribute references an ID that does not exist.',
    purpose: 'Broken ARIA references result in inaccessible content.',
    actions: ['Ensure the referenced element exists.', 'Remove the ARIA attribute if not needed.'],
    algorithm: 'An ARIA reference attribute points to a non-existent ID.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

const ariaMenuBroken: AccessibilityRule = createRule('aria_menu_broken', 'Broken ARIA menu', 'error', {
  description: 'An ARIA menu is not properly structured',
  impact: 'serious',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['aria'],
  evaluate: (element: Element): RuleResult | null => {
    const role = element.getAttribute('role');
    if (role !== 'menu' && role !== 'menubar') return null;
    
    const menuItems = element.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');
    
    if (menuItems.length === 0) {
      return {
        ruleId: 'aria_menu_broken',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'ARIA menu has no menu items',
        impact: 'serious',
      };
    }
    return null;
  },
  documentation: {
    summary: 'An ARIA menu does not contain menu items.',
    purpose: 'ARIA menus must contain proper menu item roles.',
    actions: ['Add menuitem, menuitemcheckbox, or menuitemradio roles to menu items.'],
    algorithm: 'An element with role=menu or menubar has no menu item children.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

// ============================================
// Region Error Rules
// ============================================

const regionMissing: AccessibilityRule = createRule('region_missing', 'Content outside landmark', 'error', {
  description: 'Page content is not contained within a landmark',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['landmarks'],
  evaluate: (element: Element): RuleResult | null => {
    // Only check body element, and only once
    if (element.tagName.toLowerCase() !== 'body') return null;
    
    const body = element as HTMLBodyElement;
    
    // Check if main landmark exists
    const hasMain = body.querySelector('main, [role="main"]');
    
    if (!hasMain) {
      return {
        ruleId: 'region_missing',
        category: 'error',
        element,
        selector: 'body',
        xpath: '/html/body',
        message: 'Page has no main landmark',
        impact: 'moderate',
      };
    }
    return null;
  },
  documentation: {
    summary: 'The page does not have a main landmark.',
    purpose: 'Landmarks help screen reader users navigate the page.',
    actions: ['Add a <main> element or role="main" to the main content area.'],
    algorithm: 'The page has no main element or role=main.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Export all error rules
// ============================================
export const errorRules: AccessibilityRule[] = [
  // Alt text
  altMissing,
  altLinkMissing,
  altInputMissing,
  altAreaMissing,
  altMapMissing,
  altSpacerMissing,
  // Labels
  labelMissing,
  labelEmpty,
  labelMultiple,
  selectMissingLabel,
  fieldsetMissing,
  legendMissing,
  // Links
  linkEmpty,
  linkSkipBroken,
  linkInternalBroken,
  // Buttons
  buttonEmpty,
  // Headings
  headingEmpty,
  // Tables
  thEmpty,
  tableLayoutError,
  // Language/Document
  languageMissing,
  titleInvalid,
  // Animation
  blink,
  marquee,
  metaRefresh,
  // ARIA
  ariaReferenceBroken,
  ariaMenuBroken,
  // Regions
  regionMissing,
];
