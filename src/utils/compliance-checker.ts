// ============================================
// TheWCAG Evaluation Extension - Compliance Checker
// Map evaluation results to WCAG 2.2 criteria
// ============================================

import {
  WcagCriterion,
  WcagLevel,
  CriterionStatus,
  ComplianceResult,
  ComplianceReport,
  EvaluationResults,
  RuleResult,
} from '../types';
import { wcag22Criteria, getCriteriaByLevel, getCriterionById } from '../data/wcag-2.2-criteria';

// ============================================
// Status Determination
// ============================================

/**
 * Determine the status of a criterion based on evaluation results
 */
export function getCriterionStatus(
  criterion: WcagCriterion,
  results: EvaluationResults
): { status: CriterionStatus; issues: RuleResult[] } {
  // If no related rules, it requires manual testing
  if (criterion.relatedRules.length === 0) {
    return { status: 'manual', issues: [] };
  }

  // Collect all issues related to this criterion
  const relatedIssues: RuleResult[] = [];
  const allCategories = [
    ...results.categories.error,
    ...results.categories.alert,
    ...results.categories.feature,
    ...results.categories.structure,
    ...results.categories.aria,
    ...results.categories.contrast,
  ];

  for (const issue of allCategories) {
    if (criterion.relatedRules.includes(issue.ruleId)) {
      relatedIssues.push(issue);
    }
  }

  // Determine status based on issues found
  if (relatedIssues.length === 0) {
    // No issues found for related rules
    if (criterion.canAutomate === 'full') {
      return { status: 'passed', issues: [] };
    } else if (criterion.canAutomate === 'partial') {
      // Partially automatable - could be passed or needs manual check
      return { status: 'passed', issues: [] };
    } else {
      return { status: 'manual', issues: [] };
    }
  }

  // Check if any issues are errors (failures)
  const hasErrors = relatedIssues.some(
    (issue) => issue.category === 'error' || issue.category === 'contrast'
  );

  if (hasErrors) {
    return { status: 'failed', issues: relatedIssues };
  }

  // Only alerts - needs manual review
  if (criterion.canAutomate === 'partial') {
    return { status: 'manual', issues: relatedIssues };
  }

  return { status: 'passed', issues: relatedIssues };
}

/**
 * Check if a criterion is applicable to the page
 */
export function isCriterionApplicable(
  criterion: WcagCriterion,
  results: EvaluationResults
): boolean {
  // Time-based media criteria - check if page has media
  const mediaGuidelineIds = ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5', '1.2.6', '1.2.7', '1.2.8', '1.2.9'];
  if (mediaGuidelineIds.includes(criterion.id)) {
    // Would need to check if page has audio/video
    // For now, assume applicable unless we can detect otherwise
    return true;
  }

  // Form-related criteria - check if page has forms
  const formGuidelineIds = ['3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6', '3.3.7'];
  if (formGuidelineIds.includes(criterion.id)) {
    // Check if there are form-related issues, indicating forms exist
    const hasFormIssues = [
      ...results.categories.error,
      ...results.categories.alert,
    ].some((issue) => issue.ruleId.includes('label') || issue.ruleId.includes('form'));
    
    // Assume forms are present unless clearly not
    return true;
  }

  return true;
}

// ============================================
// Report Generation
// ============================================

/**
 * Generate a comprehensive compliance report
 */
export function generateComplianceReport(
  results: EvaluationResults,
  targetLevel: WcagLevel
): ComplianceReport {
  const applicableCriteria = getCriteriaByLevel(targetLevel);
  const complianceResults: ComplianceResult[] = [];

  let passed = 0;
  let failed = 0;
  let manual = 0;
  let notApplicable = 0;

  for (const criterion of applicableCriteria) {
    const isApplicable = isCriterionApplicable(criterion, results);

    if (!isApplicable) {
      complianceResults.push({
        criterion,
        status: 'not-applicable',
        issueCount: 0,
        issues: [],
      });
      notApplicable++;
      continue;
    }

    const { status, issues } = getCriterionStatus(criterion, results);

    complianceResults.push({
      criterion,
      status,
      issueCount: issues.length,
      issues,
    });

    switch (status) {
      case 'passed':
        passed++;
        break;
      case 'failed':
        failed++;
        break;
      case 'manual':
        manual++;
        break;
      case 'not-applicable':
        notApplicable++;
        break;
    }
  }

  const total = applicableCriteria.length;
  const testable = total - notApplicable - manual;
  const percentage = testable > 0 ? Math.round((passed / testable) * 100) : 100;

  return {
    wcagVersion: '2.2',
    targetLevel,
    timestamp: Date.now(),
    url: results.url,
    results: complianceResults,
    summary: {
      passed,
      failed,
      manual,
      notApplicable,
      total,
      percentage,
    },
  };
}

/**
 * Get a checklist of items requiring manual testing
 */
export function getManualTestChecklist(
  targetLevel: WcagLevel
): { criterion: WcagCriterion; testInstructions: string }[] {
  const criteria = getCriteriaByLevel(targetLevel);

  return criteria
    .filter((c) => c.canAutomate === 'manual' || c.canAutomate === 'partial')
    .map((criterion) => ({
      criterion,
      testInstructions: getManualTestInstructions(criterion),
    }));
}

/**
 * Get manual testing instructions for a criterion
 */
function getManualTestInstructions(criterion: WcagCriterion): string {
  const instructions: Record<string, string> = {
    '1.1.1': 'Verify all images have appropriate alt text that conveys meaning.',
    '1.2.1': 'Check if audio-only content has a text transcript.',
    '1.2.2': 'Verify all videos have accurate synchronized captions.',
    '1.2.3': 'Check if videos have audio descriptions or text alternatives.',
    '1.3.3': 'Ensure instructions don\'t rely solely on shape, size, or location.',
    '1.4.1': 'Verify color is not the only way to convey information.',
    '1.4.5': 'Check that essential information is not in images of text.',
    '2.1.4': 'Test if character key shortcuts can be remapped or disabled.',
    '2.2.1': 'Verify time limits can be adjusted, extended, or disabled.',
    '2.3.1': 'Check content doesn\'t flash more than 3 times per second.',
    '2.4.5': 'Verify multiple ways to find pages (sitemap, search, etc).',
    '2.5.1': 'Test that multipoint gestures have single-pointer alternatives.',
    '2.5.4': 'Check that motion-activated features have alternatives.',
    '3.1.3': 'Verify unusual words or jargon are defined.',
    '3.2.3': 'Check navigation is consistent across pages.',
    '3.2.4': 'Verify similar components are identified consistently.',
    '3.3.4': 'Check legal/financial submissions are reversible or confirmed.',
  };

  return instructions[criterion.id] || `Manually verify: ${criterion.description}`;
}

// ============================================
// Issue Mapping
// ============================================

/**
 * Get WCAG criteria related to a specific rule result
 */
export function getCriteriaForIssue(issue: RuleResult): WcagCriterion[] {
  return wcag22Criteria.filter((c) => c.relatedRules.includes(issue.ruleId));
}

/**
 * Get a summary of issues grouped by WCAG criterion
 */
export function groupIssuesByCriterion(
  results: EvaluationResults
): Map<string, { criterion: WcagCriterion; issues: RuleResult[] }> {
  const grouped = new Map<string, { criterion: WcagCriterion; issues: RuleResult[] }>();

  const allIssues = [
    ...results.categories.error,
    ...results.categories.alert,
    ...results.categories.contrast,
  ];

  for (const issue of allIssues) {
    const criteria = getCriteriaForIssue(issue);

    for (const criterion of criteria) {
      if (!grouped.has(criterion.id)) {
        grouped.set(criterion.id, { criterion, issues: [] });
      }
      grouped.get(criterion.id)!.issues.push(issue);
    }
  }

  return grouped;
}

// ============================================
// Scoring
// ============================================

/**
 * Calculate a compliance score (0-100)
 */
export function calculateComplianceScore(report: ComplianceReport): number {
  const { passed, failed, manual, notApplicable, total } = report.summary;

  // Only count testable criteria
  const testable = total - notApplicable;
  if (testable === 0) return 100;

  // Weight: passed = full, manual = half (benefit of doubt), failed = 0
  const score = ((passed + manual * 0.5) / testable) * 100;
  return Math.round(score);
}

/**
 * Get compliance level achieved
 */
export function getAchievedLevel(results: EvaluationResults): WcagLevel | null {
  // Check Level A first
  const reportA = generateComplianceReport(results, 'A');
  if (reportA.summary.failed > 0) {
    return null; // Doesn't meet Level A
  }

  // Check Level AA
  const reportAA = generateComplianceReport(results, 'AA');
  if (reportAA.summary.failed > 0) {
    return 'A'; // Meets A but not AA
  }

  // Check Level AAA
  const reportAAA = generateComplianceReport(results, 'AAA');
  if (reportAAA.summary.failed > 0) {
    return 'AA'; // Meets AA but not AAA
  }

  return 'AAA'; // Meets all levels
}

// ============================================
// Export Functions
// ============================================

/**
 * Export compliance report as formatted text
 */
export function exportComplianceAsText(report: ComplianceReport): string {
  const lines: string[] = [
    '═'.repeat(60),
    'WCAG 2.2 COMPLIANCE REPORT',
    '═'.repeat(60),
    '',
    `URL: ${report.url}`,
    `Target Level: ${report.targetLevel}`,
    `Generated: ${new Date(report.timestamp).toLocaleString()}`,
    '',
    '─'.repeat(60),
    'SUMMARY',
    '─'.repeat(60),
    `Compliance: ${report.summary.percentage}%`,
    `Passed: ${report.summary.passed}`,
    `Failed: ${report.summary.failed}`,
    `Needs Manual Testing: ${report.summary.manual}`,
    `Not Applicable: ${report.summary.notApplicable}`,
    `Total Criteria: ${report.summary.total}`,
    '',
  ];

  // Group by principle
  const principles = ['Perceivable', 'Operable', 'Understandable', 'Robust'];

  for (const principle of principles) {
    const principleResults = report.results.filter(
      (r) => r.criterion.principle === principle
    );

    if (principleResults.length === 0) continue;

    lines.push('─'.repeat(60));
    lines.push(`${principle.toUpperCase()}`);
    lines.push('─'.repeat(60));

    for (const result of principleResults) {
      const statusIcon = {
        passed: '✓',
        failed: '✗',
        manual: '?',
        'not-applicable': '-',
        'not-tested': '○',
      }[result.status];

      lines.push(
        `[${statusIcon}] ${result.criterion.id} ${result.criterion.name} (${result.criterion.level})`
      );

      if (result.issueCount > 0) {
        lines.push(`    Issues: ${result.issueCount}`);
      }
    }

    lines.push('');
  }

  lines.push('═'.repeat(60));
  lines.push('Generated by TheWCAG Evaluation Extension');

  return lines.join('\n');
}

/**
 * Export compliance report for CSV
 */
export function exportComplianceAsCsv(report: ComplianceReport): string {
  const headers = [
    'Criterion ID',
    'Name',
    'Level',
    'Principle',
    'Status',
    'Issue Count',
    'New in 2.2',
  ];

  const rows = report.results.map((r) => [
    r.criterion.id,
    `"${r.criterion.name}"`,
    r.criterion.level,
    r.criterion.principle,
    r.status,
    r.issueCount.toString(),
    r.criterion.isNew22 ? 'Yes' : 'No',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

