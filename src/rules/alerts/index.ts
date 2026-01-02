// ============================================
// TheWCAG Evaluation Extension - Alert Rules
// Complete accessibility alert detection rules
// ============================================

import { AccessibilityRule, RuleResult, EvaluationContext } from '../../types';
import { 
  getSelector, 
  getXPath, 
  getAccessibleName,
  getTextContent,
  isElementVisible,
} from '../../utils/dom-utils';
import { createRule } from '../index';

// ============================================
// Alt Text Alert Rules
// ============================================

const altSuspicious: AccessibilityRule = createRule('alt_suspicious', 'Suspicious alt text', 'alert', {
  description: 'Alternative text may not adequately describe the image',
  impact: 'moderate',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const alt = img.alt;
    
    if (!alt) return null;
    
    const suspiciousPatterns = [
      /^image$/i,
      /^picture$/i,
      /^photo$/i,
      /^graphic$/i,
      /^icon$/i,
      /^logo$/i,
      /^banner$/i,
      /^\d+$/,
      /^img_?\d*$/i,
      /^pic_?\d*$/i,
      /^photo_?\d*$/i,
      /^dsc_?\d*$/i,
      /^img$/i,
      /^image of/i,
      /^picture of/i,
      /^photo of/i,
      /^graphic of/i,
      /^screen\s*shot/i,
      /untitled/i,
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(alt))) {
      return {
        ruleId: 'alt_suspicious',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Alt text appears suspicious',
        impact: 'moderate',
        data: { alt, src: img.src },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Alternative text may be placeholder or non-descriptive.',
    purpose: 'Alt text should meaningfully describe the image.',
    actions: ['Review and improve the alt text.', 'Ensure it describes the image content or function.'],
    algorithm: 'Alt text matches suspicious patterns like "image", "photo", "IMG_001", etc.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altRedundant: AccessibilityRule = createRule('alt_redundant', 'Redundant alt text', 'alert', {
  description: 'Alt text repeats nearby text',
  impact: 'minor',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const alt = img.alt?.toLowerCase().trim();
    
    if (!alt) return null;
    
    // Check if alt matches link text
    const link = img.closest('a');
    if (link) {
      const linkText = getTextContent(link).toLowerCase().trim();
      const imgAltLower = alt.toLowerCase();
      
      if (linkText && linkText.includes(imgAltLower)) {
        return {
          ruleId: 'alt_redundant',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Alt text is redundant with link text',
          impact: 'minor',
          data: { alt: img.alt, linkText },
        };
      }
    }
    return null;
  },
  documentation: {
    summary: 'Alt text repeats text that is nearby in the content.',
    purpose: 'Redundant alt text causes repeated content for screen reader users.',
    actions: ['Use alt="" if the image is decorative.', 'Ensure alt provides unique information.'],
    algorithm: 'Alt text matches or is contained within nearby link text.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altLong: AccessibilityRule = createRule('alt_long', 'Long alt text', 'alert', {
  description: 'Alt text is very long',
  impact: 'minor',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const alt = img.alt;
    
    if (alt && alt.length > 150) {
      return {
        ruleId: 'alt_long',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Alt text is ${alt.length} characters long`,
        impact: 'minor',
        data: { alt, length: alt.length },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Alt text is very long (over 150 characters).',
    purpose: 'Very long alt text can be difficult to listen to.',
    actions: ['Consider using a shorter alt text.', 'Use longdesc or a link to longer description.'],
    algorithm: 'Alt text is longer than 150 characters.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const altDuplicate: AccessibilityRule = createRule('alt_duplicate', 'Duplicate alt text', 'alert', {
  description: 'Multiple images have the same alt text',
  impact: 'minor',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images', 'alt'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const alt = img.alt?.trim();
    
    if (!alt || alt === '') return null;
    
    // Find all images with same alt
    const allImages = context.document.querySelectorAll('img[alt]');
    const sameAlt = Array.from(allImages).filter(i => {
      const otherAlt = (i as HTMLImageElement).alt?.trim();
      return otherAlt === alt && i !== element;
    });
    
    // Only report on first occurrence
    const firstWithAlt = Array.from(allImages).find(i => (i as HTMLImageElement).alt?.trim() === alt);
    if (element !== firstWithAlt) return null;
    
    if (sameAlt.length > 0) {
      return {
        ruleId: 'alt_duplicate',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `${sameAlt.length + 1} images have the same alt text`,
        impact: 'minor',
        data: { alt, count: sameAlt.length + 1 },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Multiple images have the same alt text.',
    purpose: 'Identical alt text on different images may indicate poor descriptions.',
    actions: ['Ensure each image has unique, descriptive alt text.'],
    algorithm: 'Multiple images have identical alt attribute values.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

// ============================================
// Heading Alert Rules
// ============================================

const headingSkipped: AccessibilityRule = createRule('heading_skipped', 'Skipped heading level', 'alert', {
  description: 'A heading level was skipped',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    if (!/^h[2-6]$/.test(tagName)) return null;
    
    const currentLevel = parseInt(tagName.charAt(1), 10);
    
    // Find all headings before this one
    const allHeadings = Array.from(context.document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const currentIndex = allHeadings.indexOf(element);
    
    if (currentIndex <= 0) return null;
    
    const prevHeading = allHeadings[currentIndex - 1];
    const prevLevel = parseInt(prevHeading.tagName.charAt(1), 10);
    
    if (currentLevel > prevLevel + 1) {
      return {
        ruleId: 'heading_skipped',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Heading level skipped from h${prevLevel} to h${currentLevel}`,
        impact: 'moderate',
        data: { currentLevel, prevLevel },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A heading level was skipped (e.g., h1 to h3).',
    purpose: 'Skipped heading levels can disorient users navigating by headings.',
    actions: ['Ensure heading levels do not skip (h1, h2, h3, not h1, h3).'],
    algorithm: 'A heading is more than one level deeper than the previous heading.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const headingPossible: AccessibilityRule = createRule('heading_possible', 'Possible heading', 'alert', {
  description: 'Text may be intended as a heading',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    if (['p', 'div', 'span'].indexOf(tagName) === -1) return null;
    
    // Skip if inside a heading or link
    if (element.closest('h1, h2, h3, h4, h5, h6, a')) return null;
    
    const style = window.getComputedStyle(element);
    const text = getTextContent(element);
    
    if (!text || text.length > 100) return null;
    
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    const isBoldish = fontWeight === 'bold' || parseInt(fontWeight, 10) >= 600;
    const isLarger = fontSize >= 18;
    
    // Check for visual heading characteristics
    if ((isBoldish && isLarger) || fontSize >= 24) {
      // Skip if element has children that look like paragraphs
      if (element.querySelector('p, div')) return null;
      
      return {
        ruleId: 'heading_possible',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Text may be a visual heading',
        impact: 'moderate',
        data: { text: text.substring(0, 50), fontSize, fontWeight },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Text appears to be styled as a heading but is not a heading element.',
    purpose: 'Visual headings should be marked up as headings for accessibility.',
    actions: ['If this is a heading, use an h1-h6 element instead.'],
    algorithm: 'Text is large/bold but not in a heading element.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const headingMissing: AccessibilityRule = createRule('heading_missing', 'Missing first level heading', 'alert', {
  description: 'The page does not start with a first-level heading',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'body') return null;
    
    const allHeadings = context.document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (allHeadings.length === 0) {
      return {
        ruleId: 'heading_missing',
        category: 'alert',
        element,
        selector: 'body',
        xpath: '/html/body',
        message: 'Page has no headings',
        impact: 'moderate',
      };
    }
    return null;
  },
  documentation: {
    summary: 'The page has no heading elements.',
    purpose: 'Headings help users understand page structure.',
    actions: ['Add heading elements to structure the page content.'],
    algorithm: 'The page contains no h1-h6 elements.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const h1Missing: AccessibilityRule = createRule('h1_missing', 'Missing h1', 'alert', {
  description: 'The page does not have an h1 element',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'body') return null;
    
    const h1 = context.document.querySelector('h1');
    
    if (!h1) {
      return {
        ruleId: 'h1_missing',
        category: 'alert',
        element,
        selector: 'body',
        xpath: '/html/body',
        message: 'Page has no h1 element',
        impact: 'moderate',
      };
    }
    return null;
  },
  documentation: {
    summary: 'The page does not have an h1 element.',
    purpose: 'An h1 typically describes the main content of the page.',
    actions: ['Add an h1 element that describes the page content.'],
    algorithm: 'The page contains no h1 element.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Link Alert Rules
// ============================================

const linkSuspicious: AccessibilityRule = createRule('link_suspicious', 'Suspicious link text', 'alert', {
  description: 'Link text may not be descriptive',
  impact: 'moderate',
  wcagCriteria: ['2.4.4'],
  wcagLevel: 'A',
  tags: ['links'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    if (!link.hasAttribute('href')) return null;
    
    const text = getAccessibleName(link).toLowerCase().trim();
    
    const suspiciousPatterns = [
      /^click$/i,
      /^click here$/i,
      /^here$/i,
      /^more$/i,
      /^read more$/i,
      /^learn more$/i,
      /^details$/i,
      /^this$/i,
      /^link$/i,
      /^info$/i,
      /^information$/i,
      /^continue$/i,
      /^go$/i,
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(text))) {
      return {
        ruleId: 'link_suspicious',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Link text may not describe destination',
        impact: 'moderate',
        data: { text, href: link.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Link text like "click here" does not describe the destination.',
    purpose: 'Link text should make sense out of context.',
    actions: ['Use descriptive link text that indicates the destination.'],
    algorithm: 'Link text matches non-descriptive patterns.',
    guidelines: [{ id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' }],
  },
});

const linkRedundant: AccessibilityRule = createRule('link_redundant', 'Redundant links', 'alert', {
  description: 'Adjacent links go to the same destination',
  impact: 'minor',
  wcagCriteria: ['2.4.4'],
  wcagLevel: 'A',
  tags: ['links'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    if (!link.hasAttribute('href')) return null;
    
    // Check next sibling or adjacent link
    const nextLink = element.nextElementSibling?.tagName.toLowerCase() === 'a' 
      ? element.nextElementSibling as HTMLAnchorElement
      : null;
    
    if (nextLink && nextLink.href === link.href) {
      return {
        ruleId: 'link_redundant',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Adjacent links go to same destination',
        impact: 'minor',
        data: { href: link.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Adjacent links point to the same URL.',
    purpose: 'Redundant links can be confusing and slow navigation.',
    actions: ['Combine adjacent links into a single link.'],
    algorithm: 'Two adjacent anchor elements have the same href.',
    guidelines: [{ id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' }],
  },
});

// Document link types
const linkDocument: AccessibilityRule = createRule('link_document', 'Link to document', 'alert', {
  description: 'Link points to a document file',
  impact: 'minor',
  wcagCriteria: ['2.4.4'],
  wcagLevel: 'A',
  tags: ['links', 'documents'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    const href = link.href?.toLowerCase() || '';
    
    // Generic document check - handled by more specific rules
    return null;
  },
  documentation: {
    summary: 'Link points to a document file.',
    purpose: 'Users should be warned when links open documents.',
    actions: ['Indicate the file type and size in the link text.'],
    algorithm: 'Link href ends with a document extension.',
    guidelines: [{ id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' }],
  },
});

const linkPdf: AccessibilityRule = createRule('link_pdf', 'Link to PDF', 'alert', {
  description: 'Link points to a PDF file',
  impact: 'minor',
  wcagCriteria: ['2.4.4'],
  wcagLevel: 'A',
  tags: ['links', 'documents'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    const href = link.href?.toLowerCase() || '';
    
    if (href.endsWith('.pdf')) {
      const text = getAccessibleName(link).toLowerCase();
      if (!text.includes('pdf')) {
        return {
          ruleId: 'link_pdf',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Link to PDF document',
          impact: 'minor',
          data: { href: link.href },
        };
      }
    }
    return null;
  },
  documentation: {
    summary: 'Link points to a PDF file.',
    purpose: 'Users should know they will be opening a PDF.',
    actions: ['Indicate "(PDF)" in the link text.'],
    algorithm: 'Link href ends with .pdf.',
    guidelines: [{ id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' }],
  },
});

const linkWord: AccessibilityRule = createRule('link_word', 'Link to Word document', 'alert', {
  description: 'Link points to a Word document',
  impact: 'minor',
  wcagCriteria: ['2.4.4'],
  wcagLevel: 'A',
  tags: ['links', 'documents'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    const href = link.href?.toLowerCase() || '';
    
    if (href.endsWith('.doc') || href.endsWith('.docx')) {
      return {
        ruleId: 'link_word',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Link to Word document',
        impact: 'minor',
        data: { href: link.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Link points to a Word document.',
    purpose: 'Users should know they will be opening a Word document.',
    actions: ['Indicate "(Word)" in the link text.'],
    algorithm: 'Link href ends with .doc or .docx.',
    guidelines: [{ id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' }],
  },
});

const linkExcel: AccessibilityRule = createRule('link_excel', 'Link to Excel document', 'alert', {
  description: 'Link points to an Excel document',
  impact: 'minor',
  wcagCriteria: ['2.4.4'],
  wcagLevel: 'A',
  tags: ['links', 'documents'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    const href = link.href?.toLowerCase() || '';
    
    if (href.endsWith('.xls') || href.endsWith('.xlsx')) {
      return {
        ruleId: 'link_excel',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Link to Excel document',
        impact: 'minor',
        data: { href: link.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Link points to an Excel spreadsheet.',
    purpose: 'Users should know they will be opening an Excel document.',
    actions: ['Indicate "(Excel)" in the link text.'],
    algorithm: 'Link href ends with .xls or .xlsx.',
    guidelines: [{ id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' }],
  },
});

const linkPowerpoint: AccessibilityRule = createRule('link_powerpoint', 'Link to PowerPoint', 'alert', {
  description: 'Link points to a PowerPoint document',
  impact: 'minor',
  wcagCriteria: ['2.4.4'],
  wcagLevel: 'A',
  tags: ['links', 'documents'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'a') return null;
    
    const link = element as HTMLAnchorElement;
    const href = link.href?.toLowerCase() || '';
    
    if (href.endsWith('.ppt') || href.endsWith('.pptx')) {
      return {
        ruleId: 'link_powerpoint',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Link to PowerPoint document',
        impact: 'minor',
        data: { href: link.href },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Link points to a PowerPoint presentation.',
    purpose: 'Users should know they will be opening a PowerPoint file.',
    actions: ['Indicate "(PowerPoint)" in the link text.'],
    algorithm: 'Link href ends with .ppt or .pptx.',
    guidelines: [{ id: '2.4.4', name: 'Link Purpose', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html' }],
  },
});

// ============================================
// Text Alert Rules
// ============================================

const textSmall: AccessibilityRule = createRule('text_small', 'Very small text', 'alert', {
  description: 'Text may be too small to read',
  impact: 'moderate',
  wcagCriteria: ['1.4.4'],
  wcagLevel: 'AA',
  tags: ['text', 'readability'],
  evaluate: (element: Element): RuleResult | null => {
    if (!isElementVisible(element)) return null;
    
    const text = getTextContent(element);
    if (!text || text.length < 2) return null;
    
    // Only check leaf text nodes
    if (element.children.length > 0) return null;
    
    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    
    if (fontSize < 10) {
      return {
        ruleId: 'text_small',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Text is only ${fontSize}px`,
        impact: 'moderate',
        data: { fontSize, text: text.substring(0, 50) },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Text is very small (less than 10 pixels).',
    purpose: 'Small text is difficult to read.',
    actions: ['Increase the font size to at least 12 pixels.'],
    algorithm: 'Computed font-size is less than 10 pixels.',
    guidelines: [{ id: '1.4.4', name: 'Resize Text', level: 'AA', url: 'https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html' }],
  },
});

const textJustified: AccessibilityRule = createRule('text_justified', 'Justified text', 'alert', {
  description: 'Text is fully justified',
  impact: 'minor',
  wcagCriteria: ['1.4.8'],
  wcagLevel: 'AAA',
  tags: ['text', 'readability'],
  evaluate: (element: Element): RuleResult | null => {
    if (!isElementVisible(element)) return null;
    
    const style = window.getComputedStyle(element);
    
    if (style.textAlign === 'justify') {
      return {
        ruleId: 'text_justified',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Text is fully justified',
        impact: 'minor',
      };
    }
    return null;
  },
  documentation: {
    summary: 'Text has full justification.',
    purpose: 'Justified text creates uneven spacing that is hard to read.',
    actions: ['Use left or right alignment instead of justify.'],
    algorithm: 'Element has text-align: justify.',
    guidelines: [{ id: '1.4.8', name: 'Visual Presentation', level: 'AAA', url: 'https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html' }],
  },
});

const underline: AccessibilityRule = createRule('underline', 'Underlined text', 'alert', {
  description: 'Underlined text that is not a link',
  impact: 'minor',
  wcagCriteria: ['1.4.1'],
  wcagLevel: 'A',
  tags: ['text', 'links'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() === 'a') return null;
    if (element.tagName.toLowerCase() === 'u') {
      return {
        ruleId: 'underline',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Underlined text that is not a link',
        impact: 'minor',
      };
    }
    
    if (!isElementVisible(element)) return null;
    
    const style = window.getComputedStyle(element);
    
    if (style.textDecoration.includes('underline') && !element.closest('a')) {
      return {
        ruleId: 'underline',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Underlined text that is not a link',
        impact: 'minor',
      };
    }
    return null;
  },
  documentation: {
    summary: 'Underlined text can be confused with links.',
    purpose: 'Underlining is typically reserved for links.',
    actions: ['Use bold, italic, or color instead of underline.'],
    algorithm: 'Non-link element is underlined.',
    guidelines: [{ id: '1.4.1', name: 'Use of Color', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html' }],
  },
});

// ============================================
// Form Alert Rules
// ============================================

const tabindex: AccessibilityRule = createRule('tabindex', 'Positive tabindex', 'alert', {
  description: 'Element has a positive tabindex',
  impact: 'moderate',
  wcagCriteria: ['2.4.3'],
  wcagLevel: 'A',
  tags: ['keyboard', 'focus'],
  evaluate: (element: Element): RuleResult | null => {
    const tabindexAttr = element.getAttribute('tabindex');
    if (!tabindexAttr) return null;
    
    const tabindex = parseInt(tabindexAttr, 10);
    
    if (tabindex > 0) {
      return {
        ruleId: 'tabindex',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Element has tabindex="${tabindex}"`,
        impact: 'moderate',
        data: { tabindex },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A positive tabindex changes the natural focus order.',
    purpose: 'Positive tabindex can create confusing focus order.',
    actions: ['Remove the tabindex or use tabindex="0".'],
    algorithm: 'Element has tabindex greater than 0.',
    guidelines: [{ id: '2.4.3', name: 'Focus Order', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html' }],
  },
});

const accesskey: AccessibilityRule = createRule('accesskey', 'Accesskey', 'alert', {
  description: 'Element has an accesskey',
  impact: 'minor',
  wcagCriteria: ['2.1.1'],
  wcagLevel: 'A',
  tags: ['keyboard'],
  evaluate: (element: Element): RuleResult | null => {
    const accesskeyAttr = element.getAttribute('accesskey');
    
    if (accesskeyAttr) {
      return {
        ruleId: 'accesskey',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Accesskey "${accesskeyAttr}" defined`,
        impact: 'minor',
        data: { accesskey: accesskeyAttr },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An accesskey attribute is present.',
    purpose: 'Accesskeys can conflict with browser/AT shortcuts.',
    actions: ['Consider removing accesskey or document it clearly.'],
    algorithm: 'Element has an accesskey attribute.',
    guidelines: [{ id: '2.1.1', name: 'Keyboard', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html' }],
  },
});

const labelOrphaned: AccessibilityRule = createRule('label_orphaned', 'Orphaned label', 'alert', {
  description: 'A label is not associated with any form control',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['forms', 'labels'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'label') return null;
    
    const label = element as HTMLLabelElement;
    
    // Check if label wraps an input
    const wrappedInput = label.querySelector('input, select, textarea');
    if (wrappedInput) return null;
    
    // Check if label has a for attribute pointing to an element
    const forAttr = label.htmlFor;
    if (forAttr) {
      const target = context.document.getElementById(forAttr);
      if (target) return null;
      
      return {
        ruleId: 'label_orphaned',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Label for="${forAttr}" references non-existent element`,
        impact: 'moderate',
        data: { for: forAttr },
      };
    }
    
    // Label has no for and no wrapped input
    return {
      ruleId: 'label_orphaned',
      category: 'alert',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Label is not associated with a form control',
      impact: 'moderate',
    };
  },
  documentation: {
    summary: 'A label is not associated with a form control.',
    purpose: 'Labels must be properly associated with their form controls.',
    actions: ['Add a for attribute that matches an input ID.', 'Or wrap the input inside the label.'],
    algorithm: 'Label has no associated form control.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const labelTitle: AccessibilityRule = createRule('label_title', 'Title used for label', 'alert', {
  description: 'A form control uses title instead of label',
  impact: 'moderate',
  wcagCriteria: ['1.3.1', '4.1.2'],
  wcagLevel: 'A',
  tags: ['forms', 'labels'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    if (!['input', 'select', 'textarea'].includes(tagName)) return null;
    
    const input = element as HTMLInputElement;
    const skipTypes = ['hidden', 'submit', 'reset', 'button', 'image'];
    if (tagName === 'input' && skipTypes.includes(input.type.toLowerCase())) return null;
    
    const hasTitle = element.hasAttribute('title');
    const hasLabel = input.labels && input.labels.length > 0;
    const hasAriaLabel = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
    
    if (hasTitle && !hasLabel && !hasAriaLabel) {
      return {
        ruleId: 'label_title',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Form control uses title attribute for label',
        impact: 'moderate',
        data: { title: element.getAttribute('title') },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A form control uses title attribute instead of a label.',
    purpose: 'Title attributes are not as accessible as proper labels.',
    actions: ['Use a <label> element instead of title.'],
    algorithm: 'Form control has title but no label or aria-label.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const eventHandler: AccessibilityRule = createRule('event_handler', 'Device-dependent event', 'alert', {
  description: 'Element has device-dependent event handler',
  impact: 'moderate',
  wcagCriteria: ['2.1.1'],
  wcagLevel: 'A',
  tags: ['keyboard', 'scripts'],
  evaluate: (element: Element): RuleResult | null => {
    const mouseEvents = ['onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'ondblclick'];
    
    for (const event of mouseEvents) {
      if (element.hasAttribute(event)) {
        // Check for corresponding keyboard event
        const keyEvent = event.replace('mouse', 'key').replace('dblclick', 'keypress');
        if (!element.hasAttribute(keyEvent) && !element.hasAttribute('onfocus') && !element.hasAttribute('onblur')) {
          return {
            ruleId: 'event_handler',
            category: 'alert',
            element,
            selector: getSelector(element),
            xpath: getXPath(element),
            message: `Has ${event} without keyboard equivalent`,
            impact: 'moderate',
            data: { event },
          };
        }
      }
    }
    return null;
  },
  documentation: {
    summary: 'Element has mouse-only event handler.',
    purpose: 'Mouse-only events are not accessible to keyboard users.',
    actions: ['Add equivalent keyboard event handlers.'],
    algorithm: 'Element has mouse event without keyboard equivalent.',
    guidelines: [{ id: '2.1.1', name: 'Keyboard', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html' }],
  },
});

const javascriptJumpmenu: AccessibilityRule = createRule('javascript_jumpmenu', 'JavaScript jump menu', 'alert', {
  description: 'A select element is used for navigation',
  impact: 'moderate',
  wcagCriteria: ['3.2.2'],
  wcagLevel: 'A',
  tags: ['scripts', 'forms'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'select') return null;
    
    const select = element as HTMLSelectElement;
    
    // Check if select has onchange that looks like navigation
    const onchange = select.getAttribute('onchange') || '';
    const hasJumpMenu = /location|href|window\.open|document\.location/i.test(onchange);
    
    if (hasJumpMenu) {
      return {
        ruleId: 'javascript_jumpmenu',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Select element used for navigation',
        impact: 'moderate',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A select element navigates on change.',
    purpose: 'Jump menus can be confusing and cause unexpected navigation.',
    actions: ['Add a Go button instead of navigating on change.'],
    algorithm: 'Select onchange contains location or navigation code.',
    guidelines: [{ id: '3.2.2', name: 'On Input', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/on-input.html' }],
  },
});

// ============================================
// Document Alert Rules
// ============================================

const titleRedundant: AccessibilityRule = createRule('title_redundant', 'Redundant title', 'alert', {
  description: 'Page title is same as URL or filename',
  impact: 'minor',
  wcagCriteria: ['2.4.2'],
  wcagLevel: 'A',
  tags: ['document'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'html') return null;
    
    const title = context.document.title?.toLowerCase().trim() || '';
    const url = context.document.location?.pathname?.toLowerCase() || '';
    const filename = url.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    
    if (title === 'untitled' || title === 'document' || title === filename) {
      return {
        ruleId: 'title_redundant',
        category: 'alert',
        element,
        selector: 'html',
        xpath: '/html',
        message: 'Page title may not be descriptive',
        impact: 'minor',
        data: { title: context.document.title },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Page title appears to be a default or filename.',
    purpose: 'Page titles should meaningfully describe the page.',
    actions: ['Update the title to be more descriptive.'],
    algorithm: 'Title matches "untitled", "document", or the filename.',
    guidelines: [{ id: '2.4.2', name: 'Page Titled', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html' }],
  },
});

const noscript: AccessibilityRule = createRule('noscript', 'Noscript element', 'alert', {
  description: 'A noscript element is present',
  impact: 'minor',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['scripts'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'noscript') return null;
    
    return {
      ruleId: 'noscript',
      category: 'alert',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Noscript element is present',
      impact: 'minor',
    };
  },
  documentation: {
    summary: 'A noscript element provides alternate content.',
    purpose: 'Ensure noscript content is accessible and equivalent.',
    actions: ['Verify the noscript content is accessible.'],
    algorithm: 'A noscript element is present.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

// ============================================
// Media Alert Rules
// ============================================

const applet: AccessibilityRule = createRule('applet', 'Java applet', 'alert', {
  description: 'A Java applet is present',
  impact: 'serious',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['media', 'plugins'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'applet') return null;
    
    return {
      ruleId: 'applet',
      category: 'alert',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Java applet is present',
      impact: 'serious',
    };
  },
  documentation: {
    summary: 'A Java applet is present.',
    purpose: 'Java applets often have accessibility issues.',
    actions: ['Provide an accessible alternative.', 'Consider replacing with HTML5.'],
    algorithm: 'An applet element is present.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const flash: AccessibilityRule = createRule('flash', 'Flash content', 'alert', {
  description: 'Flash content is present',
  impact: 'serious',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['media', 'plugins'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'object') {
      const type = element.getAttribute('type') || '';
      const data = element.getAttribute('data') || '';
      if (type.includes('flash') || data.includes('.swf')) {
        return {
          ruleId: 'flash',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Flash content is present',
          impact: 'serious',
        };
      }
    }
    
    if (tagName === 'embed') {
      const type = element.getAttribute('type') || '';
      const src = element.getAttribute('src') || '';
      if (type.includes('flash') || src.includes('.swf')) {
        return {
          ruleId: 'flash',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Flash content is present',
          impact: 'serious',
        };
      }
    }
    return null;
  },
  documentation: {
    summary: 'Flash content is present.',
    purpose: 'Flash content often has accessibility issues.',
    actions: ['Replace Flash with accessible HTML5 alternatives.'],
    algorithm: 'An object or embed references Flash content.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const plugin: AccessibilityRule = createRule('plugin', 'Plugin content', 'alert', {
  description: 'Plugin content is present',
  impact: 'moderate',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['media', 'plugins'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'object' || tagName === 'embed') {
      // Check it's not Flash (handled separately)
      const type = element.getAttribute('type') || '';
      const src = element.getAttribute('src') || element.getAttribute('data') || '';
      if (type.includes('flash') || src.includes('.swf')) return null;
      
      return {
        ruleId: 'plugin',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Plugin content is present',
        impact: 'moderate',
      };
    }
    return null;
  },
  documentation: {
    summary: 'Object or embed plugin content is present.',
    purpose: 'Plugin content may not be accessible.',
    actions: ['Ensure the content is accessible.', 'Provide accessible alternatives.'],
    algorithm: 'An object or embed element is present.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const audioVideo: AccessibilityRule = createRule('audio_video', 'Audio/Video present', 'alert', {
  description: 'Audio or video content is present',
  impact: 'moderate',
  wcagCriteria: ['1.2.1', '1.2.2', '1.2.3'],
  wcagLevel: 'A',
  tags: ['media'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'audio' || tagName === 'video') {
      return {
        ruleId: 'audio_video',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `${tagName.charAt(0).toUpperCase() + tagName.slice(1)} content present`,
        impact: 'moderate',
        data: { mediaType: tagName },
      };
    }
    return null;
  },
  documentation: {
    summary: 'HTML5 audio or video content is present.',
    purpose: 'Audio/video needs captions, transcripts, and audio descriptions.',
    actions: ['Add captions for video.', 'Provide transcripts for audio.', 'Consider audio descriptions.'],
    algorithm: 'An audio or video element is present.',
    guidelines: [
      { id: '1.2.1', name: 'Audio-only and Video-only', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html' },
      { id: '1.2.2', name: 'Captions', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded.html' },
    ],
  },
});

const html5VideoAudio: AccessibilityRule = createRule('html5_video_audio', 'HTML5 media', 'alert', {
  description: 'HTML5 video or audio element is present',
  impact: 'moderate',
  wcagCriteria: ['1.2.1'],
  wcagLevel: 'A',
  tags: ['media'],
  evaluate: (element: Element): RuleResult | null => {
    // Combined with audio_video rule
    return null;
  },
  documentation: {
    summary: 'HTML5 media element is present.',
    purpose: 'Ensure media is accessible.',
    actions: ['Provide captions and transcripts.'],
    algorithm: 'An HTML5 audio or video element is present.',
    guidelines: [{ id: '1.2.1', name: 'Audio-only and Video-only', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html' }],
  },
});

const youtubeVideo: AccessibilityRule = createRule('youtube_video', 'YouTube video', 'alert', {
  description: 'An embedded YouTube video is present',
  impact: 'moderate',
  wcagCriteria: ['1.2.1', '1.2.2'],
  wcagLevel: 'A',
  tags: ['media'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'iframe') return null;
    
    const iframe = element as HTMLIFrameElement;
    const src = iframe.src || '';
    
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      return {
        ruleId: 'youtube_video',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Embedded YouTube video',
        impact: 'moderate',
        data: { src },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An embedded YouTube video is present.',
    purpose: 'Ensure the video has captions enabled.',
    actions: ['Enable captions on the YouTube video.', 'Provide a transcript.'],
    algorithm: 'An iframe with YouTube URL is present.',
    guidelines: [
      { id: '1.2.1', name: 'Audio-only and Video-only', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html' },
      { id: '1.2.2', name: 'Captions', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded.html' },
    ],
  },
});

// ============================================
// Table Alert Rules
// ============================================

const tableCaptionPossible: AccessibilityRule = createRule('table_caption_possible', 'Possible table caption', 'alert', {
  description: 'A data table may need a caption',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'table') return null;
    
    const table = element as HTMLTableElement;
    
    // Skip layout tables
    if (table.getAttribute('role') === 'presentation' || table.getAttribute('role') === 'none') return null;
    
    // Check if has headers (data table indicator)
    const hasHeaders = table.querySelector('th') !== null;
    if (!hasHeaders) return null;
    
    // Check if has caption
    if (table.caption) return null;
    if (table.hasAttribute('aria-label') || table.hasAttribute('aria-labelledby')) return null;
    
    return {
      ruleId: 'table_caption_possible',
      category: 'alert',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Data table may need a caption',
      impact: 'moderate',
    };
  },
  documentation: {
    summary: 'A data table does not have a caption.',
    purpose: 'Captions help identify and understand tables.',
    actions: ['Add a caption element to the table.'],
    algorithm: 'A table with headers has no caption.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// List Alert Rules
// ============================================

const listPossible: AccessibilityRule = createRule('list_possible', 'Possible list', 'alert', {
  description: 'Text may be a list not marked up as such',
  impact: 'moderate',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['structure', 'lists'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    if (!['p', 'div'].includes(tagName)) return null;
    
    const text = getTextContent(element);
    
    // Check for list-like patterns
    const listPatterns = [
      /^[\*\-\•]\s/m,  // Bullet characters at start of line
      /^\d+[\.\)]\s/m,  // Numbered items
    ];
    
    if (listPatterns.some(p => p.test(text))) {
      return {
        ruleId: 'list_possible',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Text may be a list',
        impact: 'moderate',
      };
    }
    return null;
  },
  documentation: {
    summary: 'Text appears to be a list but is not marked up as one.',
    purpose: 'Proper list markup aids navigation and understanding.',
    actions: ['Use ul, ol, or dl elements for lists.'],
    algorithm: 'Text contains list-like patterns (bullets, numbers).',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Image Alert Rules
// ============================================

const imageTitle: AccessibilityRule = createRule('image_title', 'Image has title', 'alert', {
  description: 'Image has a title attribute',
  impact: 'minor',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    
    if (img.hasAttribute('title') && img.title.trim() !== '') {
      return {
        ruleId: 'image_title',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Image has title attribute',
        impact: 'minor',
        data: { title: img.title, alt: img.alt },
      };
    }
    return null;
  },
  documentation: {
    summary: 'An image has a title attribute.',
    purpose: 'Title attributes may not be accessible to all users.',
    actions: ['Use alt text instead of or in addition to title.'],
    algorithm: 'An image has a non-empty title attribute.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

const longdescInvalid: AccessibilityRule = createRule('longdesc_invalid', 'Invalid longdesc', 'alert', {
  description: 'Image has an invalid longdesc',
  impact: 'serious',
  wcagCriteria: ['1.1.1'],
  wcagLevel: 'A',
  tags: ['images'],
  evaluate: (element: Element, context: EvaluationContext): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'img') return null;
    
    const img = element as HTMLImageElement;
    const longdesc = img.getAttribute('longdesc');
    
    if (!longdesc) return null;
    
    // Check if longdesc is a fragment reference
    if (longdesc.startsWith('#')) {
      const target = context.document.getElementById(longdesc.slice(1));
      if (!target) {
        return {
          ruleId: 'longdesc_invalid',
          category: 'alert',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Longdesc references non-existent element',
          impact: 'serious',
          data: { longdesc },
        };
      }
    }
    return null;
  },
  documentation: {
    summary: 'Image has an invalid longdesc attribute.',
    purpose: 'Longdesc should point to a valid description.',
    actions: ['Fix the longdesc URL.', 'Or use aria-describedby instead.'],
    algorithm: 'Longdesc references non-existent ID.',
    guidelines: [{ id: '1.1.1', name: 'Non-text Content', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html' }],
  },
});

// ============================================
// Export all alert rules
// ============================================
export const alertRules: AccessibilityRule[] = [
  // Alt text
  altSuspicious,
  altRedundant,
  altLong,
  altDuplicate,
  // Headings
  headingSkipped,
  headingPossible,
  headingMissing,
  h1Missing,
  // Links
  linkSuspicious,
  linkRedundant,
  linkDocument,
  linkPdf,
  linkWord,
  linkExcel,
  linkPowerpoint,
  // Text
  textSmall,
  textJustified,
  underline,
  // Forms
  tabindex,
  accesskey,
  labelOrphaned,
  labelTitle,
  eventHandler,
  javascriptJumpmenu,
  // Document
  titleRedundant,
  noscript,
  // Media
  applet,
  flash,
  plugin,
  audioVideo,
  html5VideoAudio,
  youtubeVideo,
  // Tables
  tableCaptionPossible,
  // Lists
  listPossible,
  // Images
  imageTitle,
  longdescInvalid,
];
