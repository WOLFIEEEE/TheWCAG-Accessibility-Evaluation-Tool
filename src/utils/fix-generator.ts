// ============================================
// TheWCAG Evaluation Extension - Fix Generator
// Generate contextual fixes for accessibility issues
// ============================================

import { GeneratedFix, QuickFix, RuleResult, FixPlaceholder } from '../types';
import { getQuickFix } from '../data/quick-fixes';

// ============================================
// Element Information Extraction
// ============================================

/**
 * Get the outer HTML of an element with length limits
 */
export function getElementOuterHTML(element: Element, maxLength = 500): string {
  const html = element.outerHTML;
  if (html.length <= maxLength) {
    return html;
  }

  // Truncate long content
  const tagMatch = html.match(/^<[^>]+>/);
  if (!tagMatch) return html.substring(0, maxLength) + '...';

  const openTag = tagMatch[0];
  const tagName = element.tagName.toLowerCase();
  const closeTag = `</${tagName}>`;

  // Return truncated version
  const contentLength = maxLength - openTag.length - closeTag.length - 3;
  if (contentLength > 0) {
    return `${openTag}...${closeTag}`;
  }

  return html.substring(0, maxLength) + '...';
}

/**
 * Get a CSS selector for an element
 */
export function getSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const tagName = element.tagName.toLowerCase();
  const classes = Array.from(element.classList).slice(0, 3).join('.');

  let selector = tagName;
  if (classes) {
    selector += `.${classes}`;
  }

  return selector;
}

/**
 * Get an attribute value from an element
 */
export function getAttribute(element: Element, attrName: string): string {
  return element.getAttribute(attrName) || '';
}

/**
 * Get text content from an element
 */
export function getTextContent(element: Element): string {
  return (element.textContent || '').trim().substring(0, 100);
}

/**
 * Get the tag name of an element
 */
export function getTagName(element: Element): string {
  return element.tagName.toLowerCase();
}

/**
 * Generate a unique ID based on element characteristics
 */
export function generateId(element: Element): string {
  const tagName = element.tagName.toLowerCase();
  const name = element.getAttribute('name') || '';
  const type = element.getAttribute('type') || '';

  if (name) {
    return `${name}-${tagName}`;
  }
  if (type) {
    return `${type}-${tagName}`;
  }

  return `${tagName}-${Date.now().toString(36)}`;
}

/**
 * Preserve other attributes from the element
 */
export function preserveAttributes(element: Element, excludeAttrs: string[] = []): string {
  const exclude = new Set(['id', 'class', ...excludeAttrs]);
  const attrs: string[] = [];

  for (const attr of element.attributes) {
    if (!exclude.has(attr.name)) {
      attrs.push(`${attr.name}="${attr.value}"`);
    }
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

// ============================================
// Placeholder Value Generation
// ============================================

/**
 * Auto-generate a placeholder value based on the element
 */
export function autoGeneratePlaceholder(
  placeholder: FixPlaceholder,
  element: Element
): string {
  if (!placeholder.autoGenerate) {
    return placeholder.defaultValue || '';
  }

  const [method, param] = placeholder.autoGenerate.split(':');

  switch (method) {
    case 'getAttribute':
      return getAttribute(element, param);

    case 'getTextContent':
      return getTextContent(element);

    case 'getTagName':
      return getTagName(element);

    case 'getSelector':
      return getSelector(element);

    case 'generateId':
      return generateId(element);

    case 'preserveAttributes':
      return preserveAttributes(element);

    default:
      return placeholder.defaultValue || '';
  }
}

// ============================================
// Fix Generation
// ============================================

/**
 * Apply placeholder values to a template
 */
export function applyPlaceholders(
  template: string,
  values: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(pattern, value);
  }

  // Remove any remaining empty placeholders
  result = result.replace(/\{\{[^}]+\}\}/g, '');

  // Clean up empty attributes
  result = result.replace(/ (?:aria-label|class|id)=""/g, '');

  return result;
}

/**
 * Generate a fix for a rule result
 */
export function generateFix(
  ruleId: string,
  element: Element
): GeneratedFix | null {
  const quickFix = getQuickFix(ruleId);
  if (!quickFix) {
    return null;
  }

  const currentCode = getElementOuterHTML(element);
  const placeholders: Record<string, string> = {};
  let canAutocomplete = true;

  // Generate placeholder values
  for (const placeholder of quickFix.placeholders) {
    if (placeholder.type === 'auto' && placeholder.autoGenerate) {
      placeholders[placeholder.key] = autoGeneratePlaceholder(placeholder, element);
    } else if (placeholder.defaultValue) {
      placeholders[placeholder.key] = placeholder.defaultValue;
    } else {
      placeholders[placeholder.key] = '';
      canAutocomplete = false; // Needs user input
    }
  }

  const suggestedCode = applyPlaceholders(quickFix.template, placeholders);

  return {
    ruleId,
    currentCode,
    suggestedCode,
    placeholders,
    canAutocomplete,
  };
}

/**
 * Generate fixes for multiple results
 */
export function generateFixesForResults(
  results: RuleResult[]
): Map<string, GeneratedFix | null> {
  const fixes = new Map<string, GeneratedFix | null>();

  for (const result of results) {
    if (!fixes.has(result.ruleId)) {
      // We can't access the actual element here (it's been serialized)
      // This would be called from the analyzer with actual elements
      fixes.set(result.ruleId, null);
    }
  }

  return fixes;
}

// ============================================
// Fix Suggestions
// ============================================

/**
 * Get contextual suggestions for a fix
 */
export function getFixSuggestions(
  ruleId: string,
  element: Element
): string[] {
  const suggestions: string[] = [];

  switch (ruleId) {
    case 'alt_missing':
    case 'alt_empty':
      // Suggest based on image context
      const src = element.getAttribute('src') || '';
      const filename = src.split('/').pop()?.replace(/\.[^.]+$/, '') || '';

      if (filename.includes('icon')) {
        suggestions.push('This appears to be an icon. Consider: "Icon: [purpose]"');
      }
      if (filename.includes('logo')) {
        suggestions.push('This appears to be a logo. Consider: "[Company] logo"');
      }
      if (filename.includes('banner') || filename.includes('hero')) {
        suggestions.push('This appears to be a decorative banner. Consider alt="" if purely decorative.');
      }
      break;

    case 'label_missing':
      const inputType = element.getAttribute('type');
      const placeholder = element.getAttribute('placeholder');

      if (placeholder) {
        suggestions.push(`Use "${placeholder}" as the label text`);
      }
      if (inputType === 'email') {
        suggestions.push('Common labels: "Email address", "Email"');
      }
      if (inputType === 'password') {
        suggestions.push('Common labels: "Password", "Your password"');
      }
      break;

    case 'button_empty':
      const buttonClass = element.className;

      if (buttonClass.includes('close')) {
        suggestions.push('Suggested: aria-label="Close"');
      }
      if (buttonClass.includes('menu') || buttonClass.includes('hamburger')) {
        suggestions.push('Suggested: aria-label="Open menu"');
      }
      if (buttonClass.includes('search')) {
        suggestions.push('Suggested: aria-label="Search"');
      }
      break;

    case 'link_ambiguous':
      const href = element.getAttribute('href') || '';

      if (href.includes('download')) {
        suggestions.push('Describe what will be downloaded');
      }
      if (href.includes('pdf') || href.endsWith('.pdf')) {
        suggestions.push('Mention file type and size: "Download report (PDF, 2MB)"');
      }
      break;
  }

  return suggestions;
}

// ============================================
// Code Formatting
// ============================================

/**
 * Format HTML code for display
 */
export function formatHtml(html: string): string {
  // Simple HTML formatter
  let formatted = html;
  let indent = 0;
  const lines: string[] = [];

  // Split by tags
  const parts = formatted.split(/(<[^>]+>)/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('</')) {
      // Closing tag
      indent = Math.max(0, indent - 1);
      lines.push('  '.repeat(indent) + trimmed);
    } else if (trimmed.startsWith('<') && !trimmed.endsWith('/>')) {
      // Opening tag
      lines.push('  '.repeat(indent) + trimmed);
      if (!trimmed.includes('</')) {
        indent++;
      }
    } else if (trimmed.startsWith('<')) {
      // Self-closing tag
      lines.push('  '.repeat(indent) + trimmed);
    } else {
      // Text content
      lines.push('  '.repeat(indent) + trimmed);
    }
  }

  return lines.join('\n');
}

/**
 * Escape HTML for display
 */
export function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================
// Export
// ============================================

export default {
  generateFix,
  applyPlaceholders,
  getElementOuterHTML,
  getFixSuggestions,
  formatHtml,
  escapeHtml,
};

