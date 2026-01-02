// ============================================
// TheWCAG Evaluation Extension - Ignore Filter
// Filter evaluation results based on ignore patterns
// ============================================

import { IgnorePattern, RuleResult } from '../types';

// ============================================
// Pattern Matching Functions
// ============================================

/**
 * Check if a selector matches a pattern
 * Supports wildcards (*) and partial matches
 */
export function matchSelector(selector: string, pattern: string): boolean {
  if (!selector || !pattern) return false;

  // Exact match
  if (selector === pattern) return true;

  // Convert pattern to regex
  // Escape special regex chars except *
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  const regex = new RegExp(`^${escaped}$`, 'i');
  return regex.test(selector);
}

/**
 * Check if a URL matches a domain pattern
 * Supports wildcards and subdomains
 */
export function matchDomain(url: string, pattern: string): boolean {
  if (!url || !pattern) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const normalizedPattern = pattern.toLowerCase().trim();

    // Exact match
    if (hostname === normalizedPattern) return true;

    // Subdomain matching (*.example.com matches sub.example.com)
    if (normalizedPattern.startsWith('*.')) {
      const baseDomain = normalizedPattern.slice(2);
      return hostname === baseDomain || hostname.endsWith(`.${baseDomain}`);
    }

    // Wildcard matching
    const escaped = normalizedPattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');

    const regex = new RegExp(`^${escaped}$`, 'i');
    return regex.test(hostname);
  } catch {
    return false;
  }
}

/**
 * Check if a rule ID matches a pattern
 */
export function matchRule(ruleId: string, pattern: string): boolean {
  if (!ruleId || !pattern) return false;

  const normalizedRuleId = ruleId.toLowerCase();
  const normalizedPattern = pattern.toLowerCase().trim();

  // Exact match
  if (normalizedRuleId === normalizedPattern) return true;

  // Prefix match (e.g., "alt_*" matches "alt_missing", "alt_empty")
  if (normalizedPattern.endsWith('*')) {
    const prefix = normalizedPattern.slice(0, -1);
    return normalizedRuleId.startsWith(prefix);
  }

  // Category match (e.g., "error:*" matches all error rules)
  if (normalizedPattern.includes(':')) {
    const [category] = normalizedPattern.split(':');
    // This would need category info passed in
    return false;
  }

  return false;
}

/**
 * Check if an element matches a pattern by its attributes
 */
export function matchElement(
  element: { selector: string; tagName?: string; id?: string; classes?: string[] },
  pattern: string
): boolean {
  if (!element || !pattern) return false;

  // Match by selector
  if (matchSelector(element.selector, pattern)) return true;

  // Match by tag name
  if (element.tagName && pattern.toLowerCase() === element.tagName.toLowerCase()) {
    return true;
  }

  // Match by ID (#id)
  if (pattern.startsWith('#') && element.id) {
    return `#${element.id}` === pattern;
  }

  // Match by class (.class)
  if (pattern.startsWith('.') && element.classes) {
    const className = pattern.slice(1);
    return element.classes.includes(className);
  }

  return false;
}

// ============================================
// Main Filter Functions
// ============================================

/**
 * Check if a result should be ignored based on patterns
 */
export function shouldIgnore(
  result: RuleResult,
  patterns: IgnorePattern[],
  pageUrl?: string
): boolean {
  if (!patterns || patterns.length === 0) return false;

  for (const pattern of patterns) {
    if (!pattern.enabled) continue;

    switch (pattern.type) {
      case 'selector':
        if (matchSelector(result.selector, pattern.pattern)) {
          return true;
        }
        break;

      case 'rule':
        if (matchRule(result.ruleId, pattern.pattern)) {
          return true;
        }
        break;

      case 'domain':
        if (pageUrl && matchDomain(pageUrl, pattern.pattern)) {
          return true;
        }
        break;

      case 'element':
        if (matchElement({ selector: result.selector }, pattern.pattern)) {
          return true;
        }
        break;
    }
  }

  return false;
}

/**
 * Filter results, removing ignored ones
 */
export function filterResults(
  results: RuleResult[],
  patterns: IgnorePattern[],
  pageUrl?: string
): RuleResult[] {
  if (!patterns || patterns.length === 0) return results;

  return results.filter((result) => !shouldIgnore(result, patterns, pageUrl));
}

/**
 * Get ignored results (for showing what was filtered)
 */
export function getIgnoredResults(
  results: RuleResult[],
  patterns: IgnorePattern[],
  pageUrl?: string
): { result: RuleResult; pattern: IgnorePattern }[] {
  const ignored: { result: RuleResult; pattern: IgnorePattern }[] = [];

  for (const result of results) {
    for (const pattern of patterns) {
      if (!pattern.enabled) continue;

      let matches = false;

      switch (pattern.type) {
        case 'selector':
          matches = matchSelector(result.selector, pattern.pattern);
          break;
        case 'rule':
          matches = matchRule(result.ruleId, pattern.pattern);
          break;
        case 'domain':
          matches = pageUrl ? matchDomain(pageUrl, pattern.pattern) : false;
          break;
        case 'element':
          matches = matchElement({ selector: result.selector }, pattern.pattern);
          break;
      }

      if (matches) {
        ignored.push({ result, pattern });
        break; // Only record first matching pattern
      }
    }
  }

  return ignored;
}

// ============================================
// Pattern Validation
// ============================================

/**
 * Validate an ignore pattern
 */
export function validatePattern(pattern: Partial<IgnorePattern>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!pattern.type) {
    errors.push('Pattern type is required');
  }

  if (!pattern.pattern || pattern.pattern.trim() === '') {
    errors.push('Pattern value is required');
  }

  if (pattern.type === 'selector') {
    try {
      // Test if it's a valid CSS selector (without wildcards)
      const testPattern = pattern.pattern?.replace(/\*/g, 'div') || '';
      document.querySelector(testPattern);
    } catch {
      // Allow wildcards even if not valid CSS
      if (!pattern.pattern?.includes('*')) {
        errors.push('Invalid CSS selector pattern');
      }
    }
  }

  if (pattern.type === 'domain') {
    const domainPattern = pattern.pattern || '';
    // Basic domain validation
    if (!/^[\w.*-]+\.[\w.-]+$/.test(domainPattern) && domainPattern !== '*') {
      errors.push('Invalid domain pattern');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Suggest patterns based on a result
 */
export function suggestPatterns(result: RuleResult): IgnorePattern[] {
  const suggestions: IgnorePattern[] = [];
  const now = Date.now();

  // Suggest by rule ID
  suggestions.push({
    id: '',
    type: 'rule',
    pattern: result.ruleId,
    reason: `Ignore all ${result.ruleId.replace(/_/g, ' ')} issues`,
    createdAt: now,
    enabled: true,
  });

  // Suggest by selector
  suggestions.push({
    id: '',
    type: 'selector',
    pattern: result.selector,
    reason: `Ignore issues on this specific element`,
    createdAt: now,
    enabled: true,
  });

  // Suggest by element type if we can extract it
  const tagMatch = result.selector.match(/^(\w+)/);
  if (tagMatch) {
    suggestions.push({
      id: '',
      type: 'element',
      pattern: tagMatch[1],
      reason: `Ignore issues on all ${tagMatch[1]} elements`,
      createdAt: now,
      enabled: true,
    });
  }

  // Suggest by class if present
  const classMatch = result.selector.match(/\.[\w-]+/);
  if (classMatch) {
    suggestions.push({
      id: '',
      type: 'selector',
      pattern: `*${classMatch[0]}`,
      reason: `Ignore issues on elements with ${classMatch[0]} class`,
      createdAt: now,
      enabled: true,
    });
  }

  return suggestions;
}

// ============================================
// Statistics
// ============================================

/**
 * Get statistics about what patterns are matching
 */
export function getPatternStats(
  results: RuleResult[],
  patterns: IgnorePattern[],
  pageUrl?: string
): Map<string, number> {
  const stats = new Map<string, number>();

  for (const pattern of patterns) {
    let matchCount = 0;

    for (const result of results) {
      if (shouldIgnore(result, [pattern], pageUrl)) {
        matchCount++;
      }
    }

    stats.set(pattern.id, matchCount);
  }

  return stats;
}

