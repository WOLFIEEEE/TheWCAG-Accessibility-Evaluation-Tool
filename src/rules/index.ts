// ============================================
// TheWCAG Evaluation Extension - Rules Index
// Main entry point for all accessibility rules
// ============================================

import { AccessibilityRule, RuleDocumentation, EvaluationContext, RuleResult } from '../types';

// Import rule modules
import { errorRules } from './errors';
import { alertRules } from './alerts';
import { featureRules } from './features';
import { structureRules } from './structure';
import { ariaRules } from './aria';
import { contrastRules } from './contrast';
import { keyboardRules } from './keyboard';
import { mobileRules } from './mobile';
import { mediaRules } from './media';

// ============================================
// Rule Factory
// ============================================

/**
 * Creates a rule with proper defaults
 */
export function createRule(
  id: string,
  name: string,
  category: 'error' | 'alert' | 'feature' | 'structure' | 'aria' | 'contrast',
  options: {
    description: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor' | 'none';
    wcagCriteria: string[];
    wcagLevel: 'A' | 'AA' | 'AAA';
    tags: string[];
    evaluate: (element: Element, context: EvaluationContext) => RuleResult | null;
    documentation?: Partial<RuleDocumentation>;
  }
): AccessibilityRule {
  return {
    id,
    name,
    category,
    description: options.description,
    impact: options.impact,
    wcagCriteria: options.wcagCriteria,
    wcagLevel: options.wcagLevel,
    tags: options.tags,
    evaluate: options.evaluate,
    documentation: {
      summary: options.documentation?.summary || options.description,
      purpose: options.documentation?.purpose || '',
      actions: options.documentation?.actions || [],
      algorithm: options.documentation?.algorithm || '',
      guidelines: options.documentation?.guidelines || [],
    },
  };
}

// ============================================
// Combined Rules
// ============================================

/**
 * All accessibility rules organized by category
 */
export const rulesByCategory = {
  error: [...errorRules, ...keyboardRules.filter(r => r.category === 'error'), ...mobileRules.filter(r => r.category === 'error'), ...mediaRules.filter(r => r.category === 'error')],
  alert: [...alertRules, ...keyboardRules.filter(r => r.category === 'alert'), ...mobileRules.filter(r => r.category === 'alert'), ...mediaRules.filter(r => r.category === 'alert')],
  feature: featureRules,
  structure: structureRules,
  aria: ariaRules,
  contrast: contrastRules,
};

/**
 * All rules as a flat array
 */
export const allRules: AccessibilityRule[] = [
  ...errorRules,
  ...alertRules,
  ...featureRules,
  ...structureRules,
  ...ariaRules,
  ...contrastRules,
  ...keyboardRules,
  ...mobileRules,
  ...mediaRules,
];

/**
 * Rule lookup by ID
 */
export const rulesById: Map<string, AccessibilityRule> = new Map(
  allRules.map(rule => [rule.id, rule])
);

/**
 * Get a rule by ID
 */
export function getRule(id: string): AccessibilityRule | undefined {
  return rulesById.get(id);
}

/**
 * Get all rules for a category
 */
export function getRulesByCategory(category: string): AccessibilityRule[] {
  return (rulesByCategory as Record<string, AccessibilityRule[]>)[category] || [];
}

/**
 * Get all rules with a specific tag
 */
export function getRulesByTag(tag: string): AccessibilityRule[] {
  return allRules.filter(rule => rule.tags.includes(tag));
}

/**
 * Get all rules for a WCAG criterion
 */
export function getRulesByWcag(criterion: string): AccessibilityRule[] {
  return allRules.filter(rule => rule.wcagCriteria.includes(criterion));
}

// ============================================
// Evaluation Engine
// ============================================

/**
 * Run all rules against a document
 */
export async function evaluateDocument(
  doc: Document,
  options: {
    categories?: string[];
    tags?: string[];
    wcagLevel?: 'A' | 'AA' | 'AAA';
  } = {}
): Promise<RuleResult[]> {
  const results: RuleResult[] = [];
  const context: EvaluationContext = { document: doc };

  // Filter rules based on options
  let rulesToRun = allRules;

  if (options.categories) {
    rulesToRun = rulesToRun.filter(rule => options.categories!.includes(rule.category));
  }

  if (options.tags) {
    rulesToRun = rulesToRun.filter(rule => rule.tags.some(tag => options.tags!.includes(tag)));
  }

  if (options.wcagLevel) {
    const levels =
      options.wcagLevel === 'AAA'
        ? ['A', 'AA', 'AAA']
        : options.wcagLevel === 'AA'
          ? ['A', 'AA']
          : ['A'];
    rulesToRun = rulesToRun.filter(rule => levels.includes(rule.wcagLevel));
  }

  // Get all elements
  const allElements = doc.querySelectorAll('*');

  // Run each rule against each element
  for (const rule of rulesToRun) {
    for (const element of allElements) {
      try {
        const result = rule.evaluate(element, context);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id} on element:`, error);
      }
    }
  }

  return results;
}

/**
 * Get statistics from evaluation results
 */
export function getResultStatistics(results: RuleResult[]): {
  errors: number;
  alerts: number;
  features: number;
  structure: number;
  aria: number;
  contrast: number;
} {
  const stats = {
    errors: 0,
    alerts: 0,
    features: 0,
    structure: 0,
    aria: 0,
    contrast: 0,
  };

  for (const result of results) {
    switch (result.category) {
      case 'error':
        stats.errors++;
        break;
      case 'alert':
        stats.alerts++;
        break;
      case 'feature':
        stats.features++;
        break;
      case 'structure':
        stats.structure++;
        break;
      case 'aria':
        stats.aria++;
        break;
      case 'contrast':
        stats.contrast++;
        break;
    }
  }

  return stats;
}

/**
 * Group results by rule ID
 */
export function groupResultsByRule(results: RuleResult[]): Map<string, RuleResult[]> {
  const grouped = new Map<string, RuleResult[]>();

  for (const result of results) {
    const existing = grouped.get(result.ruleId) || [];
    existing.push(result);
    grouped.set(result.ruleId, existing);
  }

  return grouped;
}

/**
 * Group results by category
 */
export function groupResultsByCategory(results: RuleResult[]): Map<string, RuleResult[]> {
  const grouped = new Map<string, RuleResult[]>();

  for (const result of results) {
    const existing = grouped.get(result.category) || [];
    existing.push(result);
    grouped.set(result.category, existing);
  }

  return grouped;
}

// ============================================
// Page Evaluation (legacy API compatibility)
// ============================================

/**
 * Evaluate a page and return grouped results
 * This provides a grouped results format for the evaluation
 */
export async function evaluatePage(doc: Document): Promise<{
  categories: {
    error: RuleResult[];
    alert: RuleResult[];
    feature: RuleResult[];
    structure: RuleResult[];
    aria: RuleResult[];
    contrast: RuleResult[];
  };
  statistics: {
    totalElements: number;
    pageTitle: string;
    errors: number;
    alerts: number;
    features: number;
    structure: number;
    aria: number;
    contrast: number;
  };
}> {
  const results = await evaluateDocument(doc);
  const grouped = groupResultsByCategory(results);
  const stats = getResultStatistics(results);

  return {
    categories: {
      error: grouped.get('error') || [],
      alert: grouped.get('alert') || [],
      feature: grouped.get('feature') || [],
      structure: grouped.get('structure') || [],
      aria: grouped.get('aria') || [],
      contrast: grouped.get('contrast') || [],
    },
    statistics: {
      totalElements: doc.querySelectorAll('*').length,
      pageTitle: doc.title || 'Untitled',
      errors: stats.errors,
      alerts: stats.alerts,
      features: stats.features,
      structure: stats.structure,
      aria: stats.aria,
      contrast: stats.contrast,
    },
  };
}

// Export rule arrays
export { errorRules } from './errors';
export { alertRules } from './alerts';
export { featureRules } from './features';
export { structureRules } from './structure';
export { ariaRules } from './aria';
export { contrastRules } from './contrast';
export { keyboardRules } from './keyboard';
export { mobileRules } from './mobile';
export { mediaRules } from './media';
