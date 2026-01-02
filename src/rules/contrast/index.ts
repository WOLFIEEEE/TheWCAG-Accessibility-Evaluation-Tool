// ============================================
// TheWCAG Evaluation Extension - Contrast Rules
// Complete color contrast checking rules
// ============================================

import { AccessibilityRule, RuleResult, EvaluationContext } from '../../types';
import { 
  getSelector, 
  getXPath, 
  getTextContent,
  isElementVisible,
} from '../../utils/dom-utils';
import { 
  parseColor,
  calculateContrastRatio,
  rgbToHex,
} from '../../utils/color-utils';
import { createRule } from '../index';

// ============================================
// Helper Functions
// ============================================

/**
 * Gets the effective background color of an element, 
 * traversing up the DOM tree if transparent
 */
function getEffectiveBackgroundColor(element: Element): string | null {
  let current: Element | null = element;
  
  while (current) {
    const style = window.getComputedStyle(current);
    const bgColor = style.backgroundColor;
    
    // Check if not transparent
    if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
      return bgColor;
    }
    
    current = current.parentElement;
  }
  
  // Default to white if no background found
  return 'rgb(255, 255, 255)';
}

/**
 * Check if text is large (18pt+ or 14pt+ bold)
 */
function isLargeText(element: Element): boolean {
  const style = window.getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = style.fontWeight;
  
  // Convert px to pt (1pt = 1.333px)
  const fontSizePt = fontSize / 1.333;
  
  const isBold = fontWeight === 'bold' || parseInt(fontWeight, 10) >= 700;
  
  // Large text: 18pt+ or 14pt+ if bold
  return fontSizePt >= 18 || (fontSizePt >= 14 && isBold);
}

// ============================================
// Contrast Error Rule
// ============================================

const contrastError: AccessibilityRule = createRule('contrast', 'Low contrast', 'error', {
  description: 'Text has insufficient color contrast',
  impact: 'serious',
  wcagCriteria: ['1.4.3'],
  wcagLevel: 'AA',
  tags: ['contrast', 'color'],
  evaluate: (element: Element): RuleResult | null => {
    // Only check leaf text nodes
    if (element.children.length > 0) return null;
    
    const text = getTextContent(element);
    if (!text || text.trim().length === 0) return null;
    
    if (!isElementVisible(element)) return null;
    
    const style = window.getComputedStyle(element);
    const fgColor = style.color;
    const bgColor = getEffectiveBackgroundColor(element);
    
    if (!fgColor || !bgColor) return null;
    
    const fgRgb = parseColor(fgColor);
    const bgRgb = parseColor(bgColor);
    
    if (!fgRgb || !bgRgb) return null;
    
    const ratio = calculateContrastRatio(fgRgb, bgRgb);
    const isLarge = isLargeText(element);
    
    // WCAG AA requirements
    const requiredRatio = isLarge ? 3.0 : 4.5;
    
    if (ratio < requiredRatio) {
      return {
        ruleId: 'contrast',
        category: 'error',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Contrast ratio ${ratio.toFixed(2)}:1 (need ${requiredRatio}:1)`,
        impact: 'serious',
        data: {
          ratio: ratio.toFixed(2),
          requiredRatio,
          fgColor: rgbToHex(fgRgb),
          bgColor: rgbToHex(bgRgb),
          isLargeText: isLarge,
          text: text.substring(0, 50),
        },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Text does not have sufficient color contrast.',
    purpose: 'Low contrast text is difficult to read, especially for users with vision impairments.',
    actions: [
      'Increase the contrast between text and background colors.',
      'Use a contrast ratio of at least 4.5:1 for normal text.',
      'Use a contrast ratio of at least 3:1 for large text.',
    ],
    algorithm: 'Calculate contrast ratio and compare to WCAG requirements.',
    guidelines: [
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html' },
    ],
  },
});

// ============================================
// Contrast Alert Rule (Enhanced)
// ============================================

const contrastEnhanced: AccessibilityRule = createRule('contrast_enhanced', 'Enhanced contrast', 'alert', {
  description: 'Text does not meet enhanced contrast requirements',
  impact: 'moderate',
  wcagCriteria: ['1.4.6'],
  wcagLevel: 'AAA',
  tags: ['contrast', 'color'],
  evaluate: (element: Element): RuleResult | null => {
    // Only check leaf text nodes
    if (element.children.length > 0) return null;
    
    const text = getTextContent(element);
    if (!text || text.trim().length === 0) return null;
    
    if (!isElementVisible(element)) return null;
    
    const style = window.getComputedStyle(element);
    const fgColor = style.color;
    const bgColor = getEffectiveBackgroundColor(element);
    
    if (!fgColor || !bgColor) return null;
    
    const fgRgb = parseColor(fgColor);
    const bgRgb = parseColor(bgColor);
    
    if (!fgRgb || !bgRgb) return null;
    
    const ratio = calculateContrastRatio(fgRgb, bgRgb);
    const isLarge = isLargeText(element);
    
    // WCAG AAA requirements
    const requiredAAA = isLarge ? 4.5 : 7.0;
    const requiredAA = isLarge ? 3.0 : 4.5;
    
    // Passes AA but fails AAA
    if (ratio >= requiredAA && ratio < requiredAAA) {
      return {
        ruleId: 'contrast_enhanced',
        category: 'alert',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: `Contrast ratio ${ratio.toFixed(2)}:1 (AAA needs ${requiredAAA}:1)`,
        impact: 'moderate',
        data: {
          ratio: ratio.toFixed(2),
          requiredRatio: requiredAAA,
          fgColor: rgbToHex(fgRgb),
          bgColor: rgbToHex(bgRgb),
          isLargeText: isLarge,
        },
      };
    }
    return null;
  },
  documentation: {
    summary: 'Text passes AA but does not meet AAA contrast requirements.',
    purpose: 'Enhanced contrast provides better readability for more users.',
    actions: [
      'Consider increasing contrast to 7:1 for normal text.',
      'Consider increasing contrast to 4.5:1 for large text.',
    ],
    algorithm: 'Calculate contrast ratio and compare to AAA requirements.',
    guidelines: [
      { id: '1.4.6', name: 'Contrast (Enhanced)', level: 'AAA', url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html' },
    ],
  },
});

// ============================================
// Contrast Feature Rule (Passes)
// ============================================

const contrastPass: AccessibilityRule = createRule('contrast_pass', 'Contrast passes', 'feature', {
  description: 'Text has sufficient color contrast',
  impact: 'none',
  wcagCriteria: ['1.4.3'],
  wcagLevel: 'AA',
  tags: ['contrast', 'color'],
  evaluate: (element: Element): RuleResult | null => {
    // This is a positive indicator, typically not actively reported
    // but useful for contrast analysis views
    return null;
  },
  documentation: {
    summary: 'Text has sufficient contrast.',
    purpose: 'Confirms text meets contrast requirements.',
    actions: [],
    algorithm: 'Contrast ratio meets or exceeds requirements.',
    guidelines: [
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html' },
    ],
  },
});

// ============================================
// Export all contrast rules
// ============================================
export const contrastRules: AccessibilityRule[] = [
  contrastError,
  contrastEnhanced,
  contrastPass,
];
