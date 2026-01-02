// ============================================
// TheWCAG Evaluation Extension - Report Generator
// Generate accessibility reports in multiple formats
// ============================================

import { EvaluationResults, RuleResult, HeadingInfo, LandmarkInfo } from '../types';
import { escapeHtml } from './sanitize';

// ============================================
// Report Types
// ============================================

export interface AccessibilityReport {
  metadata: ReportMetadata;
  summary: ReportSummary;
  issues: ReportIssue[];
  pageInfo: PageInfo;
}

export interface ReportMetadata {
  url: string;
  title: string;
  timestamp: string;
  toolName: string;
  toolVersion: string;
  wcagVersion: string;
  conformanceLevel: 'A' | 'AA' | 'AAA';
}

export interface ReportSummary {
  score: number;
  totalIssues: number;
  errors: number;
  alerts: number;
  features: number;
  structure: number;
  aria: number;
  contrast: number;
  byImpact: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

export interface ReportIssue {
  id: string;
  ruleId: string;
  category: string;
  impact: string;
  message: string;
  selector: string;
  wcagCriteria: string[];
  howToFix?: string;
}

export interface PageInfo {
  title: string;
  url: string;
  language: string;
  headings: HeadingInfo[];
  landmarks: LandmarkInfo[];
  totalElements: number;
}

// ============================================
// Report Generation
// ============================================

/**
 * Generate a comprehensive accessibility report
 */
export function generateReport(
  results: EvaluationResults,
  options: {
    url: string;
    title: string;
    headings?: HeadingInfo[];
    landmarks?: LandmarkInfo[];
    conformanceLevel?: 'A' | 'AA' | 'AAA';
  }
): AccessibilityReport {
  const allIssues: ReportIssue[] = [];
  let issueIndex = 0;

  // Collect all issues from categories
  const categories = ['error', 'alert', 'feature', 'structure', 'aria'] as const;
  for (const category of categories) {
    const items = results.categories[category] || [];
    for (const item of items) {
      allIssues.push({
        id: `issue-${++issueIndex}`,
        ruleId: item.ruleId,
        category,
        impact: item.impact || 'moderate',
        message: item.message,
        selector: item.selector,
        wcagCriteria: [],
        howToFix: getHowToFix(item.ruleId),
      });
    }
  }

  // Calculate impact counts
  const byImpact = {
    critical: allIssues.filter((i) => i.impact === 'critical').length,
    serious: allIssues.filter((i) => i.impact === 'serious').length,
    moderate: allIssues.filter((i) => i.impact === 'moderate').length,
    minor: allIssues.filter((i) => i.impact === 'minor').length,
  };

  return {
    metadata: {
      url: options.url,
      title: options.title,
      timestamp: new Date().toISOString(),
      toolName: 'TheWCAG Evaluation Extension',
      toolVersion: '1.0.0',
      wcagVersion: '2.1',
      conformanceLevel: options.conformanceLevel || 'AA',
    },
    summary: {
      score: results.aimScore,
      totalIssues: allIssues.length,
      errors: results.summary.errors,
      alerts: results.summary.alerts,
      features: results.summary.features,
      structure: results.summary.structure,
      aria: results.summary.aria,
      contrast: results.summary.contrastErrors || 0,
      byImpact,
    },
    issues: allIssues,
    pageInfo: {
      title: options.title,
      url: options.url,
      language: document.documentElement.lang || 'unknown',
      headings: options.headings || [],
      landmarks: options.landmarks || [],
      totalElements: document.querySelectorAll('*').length,
    },
  };
}

/**
 * Get how-to-fix text for a rule
 */
function getHowToFix(ruleId: string): string {
  const fixes: Record<string, string> = {
    alt_missing: 'Add an alt attribute to the image with descriptive text.',
    label_missing: 'Add a label element or aria-label to the form control.',
    link_empty: 'Add descriptive text inside the link.',
    button_empty: 'Add text content or aria-label to the button.',
    heading_empty: 'Add text content to the heading element.',
    language_missing: 'Add a lang attribute to the html element.',
    title_invalid: 'Add a descriptive title element in the head.',
    focus_not_visible: 'Ensure focus styles are visible (outline, border, or box-shadow).',
    keyboard_trap: 'Ensure users can navigate away using Tab or Escape.',
    target_size_minimum: 'Increase the clickable area to at least 24x24 pixels.',
  };

  return fixes[ruleId] || 'Review the issue and apply appropriate fix.';
}

// ============================================
// JSON Export
// ============================================

/**
 * Export report as JSON string
 */
export function exportToJSON(report: AccessibilityReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Download report as JSON file
 */
export function downloadJSON(report: AccessibilityReport, filename?: string): void {
  const json = exportToJSON(report);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename || `accessibility-report-${Date.now()}.json`);
}

// ============================================
// CSV Export
// ============================================

/**
 * Export report as CSV string
 */
export function exportToCSV(report: AccessibilityReport): string {
  const headers = ['ID', 'Rule ID', 'Category', 'Impact', 'Message', 'Selector', 'How to Fix'];
  const rows = report.issues.map((issue) => [
    issue.id,
    issue.ruleId,
    issue.category,
    issue.impact,
    `"${issue.message.replace(/"/g, '""')}"`,
    `"${issue.selector.replace(/"/g, '""')}"`,
    `"${(issue.howToFix || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Download report as CSV file
 */
export function downloadCSV(report: AccessibilityReport, filename?: string): void {
  const csv = exportToCSV(report);
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, filename || `accessibility-report-${Date.now()}.csv`);
}

// ============================================
// HTML Export
// ============================================

/**
 * Export report as HTML string
 */
export function exportToHTML(report: AccessibilityReport): string {
  const impactColors: Record<string, string> = {
    critical: '#D64545',
    serious: '#E6994D',
    moderate: '#4A9D5B',
    minor: '#4A7DB5',
  };

  const categoryLabels: Record<string, string> = {
    error: 'Errors',
    alert: 'Alerts',
    feature: 'Features',
    structure: 'Structure',
    aria: 'ARIA',
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${escapeHtml(report.pageInfo.title)}</title>
  <style>
    :root {
      --primary: #A85A3B;
      --bg: #F9F7F4;
      --text: #1A1A1A;
      --border: rgba(168, 90, 59, 0.15);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1, h2, h3 { color: var(--primary); margin-bottom: 1rem; }
    h1 { font-size: 2rem; border-bottom: 3px solid var(--primary); padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; }
    .metadata {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border: 1px solid var(--border);
    }
    .metadata p { margin: 0.25rem 0; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--border);
    }
    .summary-card .value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
    }
    .summary-card .label {
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
    }
    .score-card {
      background: linear-gradient(135deg, var(--primary), #C06A4A);
      color: white;
    }
    .score-card .value { color: white; }
    .score-card .label { color: rgba(255,255,255,0.8); }
    .issues-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    .issues-table th, .issues-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .issues-table th {
      background: var(--primary);
      color: white;
      font-weight: 600;
    }
    .issues-table tr:hover { background: #f5f5f5; }
    .impact-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
    }
    .category-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      background: #e0e0e0;
    }
    .selector { font-family: monospace; font-size: 0.875rem; color: #666; }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
      text-align: center;
      color: #666;
      font-size: 0.875rem;
    }
    @media print {
      body { padding: 0; }
      .issues-table { font-size: 0.875rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Accessibility Report</h1>
    
    <div class="metadata">
      <p><strong>URL:</strong> ${escapeHtml(report.metadata.url)}</p>
      <p><strong>Page Title:</strong> ${escapeHtml(report.metadata.title)}</p>
      <p><strong>Generated:</strong> ${new Date(report.metadata.timestamp).toLocaleString()}</p>
      <p><strong>WCAG Version:</strong> ${report.metadata.wcagVersion} Level ${report.metadata.conformanceLevel}</p>
    </div>

    <h2>📊 Summary</h2>
    <div class="summary">
      <div class="summary-card score-card">
        <div class="value">${report.summary.score.toFixed(1)}</div>
        <div class="label">AIM Score (out of 10)</div>
      </div>
      <div class="summary-card">
        <div class="value">${report.summary.totalIssues}</div>
        <div class="label">Total Issues</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: #D64545">${report.summary.errors}</div>
        <div class="label">Errors</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: #E6994D">${report.summary.alerts}</div>
        <div class="label">Alerts</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: #4A9D5B">${report.summary.features}</div>
        <div class="label">Features</div>
      </div>
    </div>

    <h2>🚨 Issues by Impact</h2>
    <div class="summary">
      <div class="summary-card">
        <div class="value" style="color: ${impactColors.critical}">${report.summary.byImpact.critical}</div>
        <div class="label">Critical</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: ${impactColors.serious}">${report.summary.byImpact.serious}</div>
        <div class="label">Serious</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: ${impactColors.moderate}">${report.summary.byImpact.moderate}</div>
        <div class="label">Moderate</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: ${impactColors.minor}">${report.summary.byImpact.minor}</div>
        <div class="label">Minor</div>
      </div>
    </div>

    <h2>📋 Issue Details</h2>
    ${
      report.issues.length > 0
        ? `
    <table class="issues-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Category</th>
          <th>Impact</th>
          <th>Issue</th>
          <th>How to Fix</th>
        </tr>
      </thead>
      <tbody>
        ${report.issues
          .map(
            (issue, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><span class="category-badge">${categoryLabels[issue.category] || issue.category}</span></td>
          <td><span class="impact-badge" style="background: ${impactColors[issue.impact] || '#666'}">${issue.impact}</span></td>
          <td>
            <strong>${escapeHtml(issue.ruleId.replace(/_/g, ' '))}</strong><br>
            ${escapeHtml(issue.message)}<br>
            <span class="selector">${escapeHtml(issue.selector)}</span>
          </td>
          <td>${escapeHtml(issue.howToFix || '')}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : '<p>No issues found! 🎉</p>'
    }

    <div class="footer">
      <p>Generated by ${report.metadata.toolName} v${report.metadata.toolVersion}</p>
      <p>Learn more at <a href="https://thewcag.com">thewcag.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Download report as HTML file
 */
export function downloadHTML(report: AccessibilityReport, filename?: string): void {
  const html = exportToHTML(report);
  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, filename || `accessibility-report-${Date.now()}.html`);
}

// ============================================
// EARL (W3C Format) Export
// ============================================

/**
 * Export report as EARL (Evaluation and Report Language) JSON-LD
 */
export function exportToEARL(report: AccessibilityReport): string {
  const earl = {
    '@context': 'http://www.w3.org/ns/earl#',
    '@type': 'Assertion',
    assertedBy: {
      '@type': 'Software',
      name: report.metadata.toolName,
      version: report.metadata.toolVersion,
    },
    subject: {
      '@type': 'TestSubject',
      source: report.metadata.url,
      title: report.metadata.title,
    },
    test: {
      '@type': 'TestCriterion',
      title: `WCAG ${report.metadata.wcagVersion} Level ${report.metadata.conformanceLevel}`,
    },
    result: {
      '@type': 'TestResult',
      date: report.metadata.timestamp,
      outcome: report.summary.errors === 0 ? 'earl:passed' : 'earl:failed',
    },
    assertions: report.issues.map((issue) => ({
      '@type': 'Assertion',
      test: issue.ruleId,
      result: {
        '@type': 'TestResult',
        outcome: issue.category === 'error' ? 'earl:failed' : 'earl:cantTell',
        description: issue.message,
        pointer: issue.selector,
      },
    })),
  };

  return JSON.stringify(earl, null, 2);
}

/**
 * Download report as EARL file
 */
export function downloadEARL(report: AccessibilityReport, filename?: string): void {
  const earl = exportToEARL(report);
  const blob = new Blob([earl], { type: 'application/ld+json' });
  downloadBlob(blob, filename || `accessibility-report-${Date.now()}.earl.json`);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy report to clipboard
 */
export async function copyReportToClipboard(report: AccessibilityReport): Promise<boolean> {
  try {
    const text = formatReportAsText(report);
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format report as plain text
 */
export function formatReportAsText(report: AccessibilityReport): string {
  const lines: string[] = [
    '='.repeat(60),
    'ACCESSIBILITY REPORT',
    '='.repeat(60),
    '',
    `URL: ${report.metadata.url}`,
    `Title: ${report.metadata.title}`,
    `Generated: ${new Date(report.metadata.timestamp).toLocaleString()}`,
    `WCAG: ${report.metadata.wcagVersion} Level ${report.metadata.conformanceLevel}`,
    '',
    '-'.repeat(60),
    'SUMMARY',
    '-'.repeat(60),
    `AIM Score: ${report.summary.score.toFixed(1)}/10`,
    `Total Issues: ${report.summary.totalIssues}`,
    `  Errors: ${report.summary.errors}`,
    `  Alerts: ${report.summary.alerts}`,
    `  Features: ${report.summary.features}`,
    '',
    'By Impact:',
    `  Critical: ${report.summary.byImpact.critical}`,
    `  Serious: ${report.summary.byImpact.serious}`,
    `  Moderate: ${report.summary.byImpact.moderate}`,
    `  Minor: ${report.summary.byImpact.minor}`,
    '',
  ];

  if (report.issues.length > 0) {
    lines.push('-'.repeat(60));
    lines.push('ISSUES');
    lines.push('-'.repeat(60));
    lines.push('');

    report.issues.forEach((issue, index) => {
      lines.push(`${index + 1}. [${issue.impact.toUpperCase()}] ${issue.ruleId.replace(/_/g, ' ')}`);
      lines.push(`   Category: ${issue.category}`);
      lines.push(`   Message: ${issue.message}`);
      lines.push(`   Selector: ${issue.selector}`);
      if (issue.howToFix) {
        lines.push(`   Fix: ${issue.howToFix}`);
      }
      lines.push('');
    });
  }

  lines.push('='.repeat(60));
  lines.push(`Generated by ${report.metadata.toolName} v${report.metadata.toolVersion}`);

  return lines.join('\n');
}

