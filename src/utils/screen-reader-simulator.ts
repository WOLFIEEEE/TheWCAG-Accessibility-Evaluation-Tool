// ============================================
// TheWCAG Evaluation Extension - Screen Reader Simulator
// Generate screen reader-like output for accessibility preview
// ============================================

import { AccessibleNode, ScreenReaderOutput, ScreenReaderNodeType } from '../types';
import { buildAccessibilityTree, flattenTree, filterByRole } from './accessibility-tree';

// ============================================
// Role to Type Mapping
// ============================================

const roleToType: Record<string, ScreenReaderNodeType> = {
  // Landmarks
  banner: 'landmark',
  complementary: 'landmark',
  contentinfo: 'landmark',
  form: 'landmark',
  main: 'landmark',
  navigation: 'navigation',
  region: 'region',
  search: 'landmark',

  // Headings
  heading: 'heading',

  // Links and buttons
  link: 'link',
  button: 'button',

  // Form controls
  textbox: 'form',
  checkbox: 'form',
  radio: 'form',
  combobox: 'form',
  listbox: 'form',
  slider: 'form',
  spinbutton: 'form',
  switch: 'form',
  searchbox: 'form',

  // Lists
  list: 'list',
  listitem: 'list',

  // Tables
  table: 'table',
  row: 'table',
  cell: 'table',
  columnheader: 'table',
  rowheader: 'table',

  // Images
  img: 'image',
  figure: 'image',

  // Text
  paragraph: 'text',
  generic: 'text',
  document: 'text',
};

// ============================================
// Announcement Generation
// ============================================

/**
 * Format a role for announcement
 */
function formatRole(role: string): string {
  const roleNames: Record<string, string> = {
    banner: 'banner',
    complementary: 'complementary',
    contentinfo: 'content info',
    main: 'main',
    navigation: 'navigation',
    region: 'region',
    search: 'search',
    heading: 'heading',
    link: 'link',
    button: 'button',
    textbox: 'edit text',
    checkbox: 'checkbox',
    radio: 'radio button',
    combobox: 'combo box',
    listbox: 'list box',
    slider: 'slider',
    spinbutton: 'spin button',
    switch: 'switch',
    searchbox: 'search',
    list: 'list',
    listitem: 'list item',
    table: 'table',
    img: 'image',
    figure: 'figure',
    menu: 'menu',
    menuitem: 'menu item',
    menubar: 'menu bar',
    tab: 'tab',
    tabpanel: 'tab panel',
    tablist: 'tab list',
    tree: 'tree',
    treeitem: 'tree item',
    dialog: 'dialog',
    alert: 'alert',
    alertdialog: 'alert dialog',
    progressbar: 'progress bar',
    status: 'status',
    tooltip: 'tooltip',
    article: 'article',
    group: 'group',
  };

  return roleNames[role] || role;
}

/**
 * Format states for announcement
 */
function formatStates(states: string[]): string {
  const stateTexts: string[] = [];

  for (const state of states) {
    switch (state) {
      case 'checked':
        stateTexts.push('checked');
        break;
      case 'disabled':
        stateTexts.push('dimmed');
        break;
      case 'expanded':
        stateTexts.push('expanded');
        break;
      case 'collapsed':
        stateTexts.push('collapsed');
        break;
      case 'selected':
        stateTexts.push('selected');
        break;
      case 'pressed':
        stateTexts.push('pressed');
        break;
      case 'current':
        stateTexts.push('current');
        break;
      case 'required':
        stateTexts.push('required');
        break;
      case 'invalid':
        stateTexts.push('invalid entry');
        break;
      case 'readonly':
        stateTexts.push('read only');
        break;
      case 'busy':
        stateTexts.push('busy');
        break;
    }
  }

  return stateTexts.join(', ');
}

/**
 * Format properties for announcement
 */
function formatProperties(properties: Record<string, string>, role: string): string {
  const parts: string[] = [];

  // Heading level
  if (role === 'heading' && properties['level']) {
    parts.push(`level ${properties['level']}`);
  }

  // List position
  if (properties['posinset'] && properties['setsize']) {
    parts.push(`${properties['posinset']} of ${properties['setsize']}`);
  }

  // Slider/progress values
  if (properties['valuenow']) {
    if (properties['valuetext']) {
      parts.push(properties['valuetext']);
    } else if (properties['valuemin'] && properties['valuemax']) {
      parts.push(`${properties['valuenow']}, min ${properties['valuemin']}, max ${properties['valuemax']}`);
    } else {
      parts.push(properties['valuenow']);
    }
  }

  // Table position
  if (properties['rowindex'] && properties['colindex']) {
    parts.push(`row ${properties['rowindex']}, column ${properties['colindex']}`);
  }

  // Sort order
  if (properties['sort']) {
    parts.push(`sorted ${properties['sort']}`);
  }

  return parts.join(', ');
}

/**
 * Generate announcement for a single node
 */
export function formatAnnouncement(node: AccessibleNode): string {
  const parts: string[] = [];
  const role = node.role;

  // Different announcement patterns based on role
  switch (role) {
    case 'heading':
      parts.push(node.name || 'empty heading');
      parts.push(`heading level ${node.level || node.properties['level'] || '?'}`);
      break;

    case 'link':
      parts.push(node.name || 'link');
      parts.push('link');
      if (node.states.includes('visited')) {
        parts.push('visited');
      }
      break;

    case 'button':
      parts.push(node.name || 'button');
      parts.push('button');
      break;

    case 'checkbox':
      parts.push(node.name || 'checkbox');
      parts.push('checkbox');
      parts.push(node.states.includes('checked') ? 'checked' : 'not checked');
      break;

    case 'radio':
      parts.push(node.name || 'radio button');
      parts.push('radio button');
      parts.push(node.states.includes('checked') ? 'selected' : 'not selected');
      break;

    case 'textbox':
    case 'searchbox':
      parts.push(node.name || 'edit');
      if (node.value) {
        parts.push(`contains: ${node.value}`);
      }
      parts.push(role === 'searchbox' ? 'search field' : 'edit');
      break;

    case 'combobox':
      parts.push(node.name || 'combo box');
      if (node.value) {
        parts.push(node.value);
      }
      parts.push('combo box');
      parts.push(node.states.includes('expanded') ? 'expanded' : 'collapsed');
      break;

    case 'img':
      if (node.name) {
        parts.push(node.name);
        parts.push('image');
      } else {
        parts.push('image without description');
      }
      break;

    case 'list':
      parts.push(node.name || 'list');
      const itemCount = node.children.filter(c => c.role === 'listitem').length;
      parts.push(`list with ${itemCount} items`);
      break;

    case 'listitem':
      parts.push(node.name || '');
      const posInSet = node.properties['posinset'];
      const setSize = node.properties['setsize'];
      if (posInSet && setSize) {
        parts.push(`${posInSet} of ${setSize}`);
      }
      break;

    case 'table':
      parts.push(node.name || 'table');
      const rowCount = node.properties['rowcount'] || '?';
      const colCount = node.properties['colcount'] || '?';
      parts.push(`table with ${rowCount} rows and ${colCount} columns`);
      break;

    case 'navigation':
    case 'main':
    case 'banner':
    case 'contentinfo':
    case 'complementary':
    case 'search':
    case 'region':
      parts.push(node.name || formatRole(role));
      parts.push(formatRole(role));
      break;

    case 'alert':
      parts.push('alert');
      parts.push(node.name || node.children.map(c => c.name).join(' '));
      break;

    case 'dialog':
      parts.push(node.name || 'dialog');
      parts.push('dialog');
      if (node.states.includes('modal')) {
        parts.push('modal');
      }
      break;

    case 'tab':
      parts.push(node.name || 'tab');
      parts.push('tab');
      if (node.states.includes('selected')) {
        parts.push('selected');
      }
      break;

    case 'slider':
      parts.push(node.name || 'slider');
      if (node.value) {
        parts.push(node.value);
      }
      parts.push('slider');
      break;

    case 'switch':
      parts.push(node.name || 'switch');
      parts.push('switch');
      parts.push(node.states.includes('checked') ? 'on' : 'off');
      break;

    case 'progressbar':
      parts.push(node.name || 'progress');
      const percent = node.properties['valuenow'];
      if (percent) {
        parts.push(`${percent}%`);
      }
      parts.push('progress bar');
      break;

    default:
      if (node.name) {
        parts.push(node.name);
      }
      if (role !== 'generic' && role !== 'presentation') {
        parts.push(formatRole(role));
      }
  }

  // Add states
  const statesText = formatStates(node.states);
  if (statesText && !parts.includes(statesText)) {
    parts.push(statesText);
  }

  // Add description if present
  if (node.description) {
    parts.push(node.description);
  }

  return parts.filter(Boolean).join(', ');
}

// ============================================
// Preview Generation
// ============================================

/**
 * Generate screen reader preview from accessibility tree
 */
export function generateScreenReaderPreview(
  tree: AccessibleNode,
  depth = 0
): ScreenReaderOutput[] {
  const outputs: ScreenReaderOutput[] = [];

  // Skip generic/presentation roles unless they have important content
  const skipRoles = ['generic', 'presentation', 'none'];
  if (!skipRoles.includes(tree.role) || tree.name || tree.issues.length > 0) {
    const type = roleToType[tree.role] || 'text';
    const announcement = formatAnnouncement(tree);

    if (announcement) {
      outputs.push({
        type,
        content: tree.name || tree.role,
        announcement,
        selector: tree.selector,
        depth,
        hasIssue: tree.issues.length > 0,
        issueMessage: tree.issues.length > 0 ? tree.issues.join('; ') : undefined,
      });
    }
  }

  // Process children
  for (const child of tree.children) {
    outputs.push(...generateScreenReaderPreview(child, depth + 1));
  }

  return outputs;
}

/**
 * Filter preview by navigation mode
 */
export function filterByMode(
  outputs: ScreenReaderOutput[],
  mode: string
): ScreenReaderOutput[] {
  switch (mode) {
    case 'headings':
      return outputs.filter((o) => o.type === 'heading');

    case 'landmarks':
      return outputs.filter((o) => o.type === 'landmark' || o.type === 'navigation' || o.type === 'region');

    case 'links':
      return outputs.filter((o) => o.type === 'link');

    case 'buttons':
      return outputs.filter((o) => o.type === 'button');

    case 'forms':
      return outputs.filter((o) => o.type === 'form');

    case 'tables':
      return outputs.filter((o) => o.type === 'table');

    case 'images':
      return outputs.filter((o) => o.type === 'image');

    case 'issues':
      return outputs.filter((o) => o.hasIssue);

    case 'all':
    default:
      return outputs;
  }
}

/**
 * Get navigation mode shortcuts (like screen readers)
 */
export function getNavigationModes(): { key: string; mode: string; description: string }[] {
  return [
    { key: 'h', mode: 'headings', description: 'Navigate by headings' },
    { key: 'd', mode: 'landmarks', description: 'Navigate by landmarks' },
    { key: 'k', mode: 'links', description: 'Navigate by links' },
    { key: 'b', mode: 'buttons', description: 'Navigate by buttons' },
    { key: 'f', mode: 'forms', description: 'Navigate by form fields' },
    { key: 't', mode: 'tables', description: 'Navigate by tables' },
    { key: 'g', mode: 'images', description: 'Navigate by graphics' },
    { key: 'e', mode: 'issues', description: 'Navigate by issues' },
  ];
}

// ============================================
// Statistics
// ============================================

/**
 * Get preview statistics
 */
export function getPreviewStats(outputs: ScreenReaderOutput[]): {
  total: number;
  byType: Record<ScreenReaderNodeType, number>;
  issues: number;
} {
  const byType: Partial<Record<ScreenReaderNodeType, number>> = {};
  let issues = 0;

  for (const output of outputs) {
    byType[output.type] = (byType[output.type] || 0) + 1;
    if (output.hasIssue) issues++;
  }

  return {
    total: outputs.length,
    byType: byType as Record<ScreenReaderNodeType, number>,
    issues,
  };
}

// ============================================
// Text Export
// ============================================

/**
 * Export preview as plain text
 */
export function exportAsText(outputs: ScreenReaderOutput[]): string {
  const lines: string[] = [
    '═'.repeat(60),
    'SCREEN READER PREVIEW',
    '═'.repeat(60),
    '',
  ];

  for (const output of outputs) {
    const indent = '  '.repeat(output.depth);
    const issueMarker = output.hasIssue ? ' ⚠️' : '';

    lines.push(`${indent}${output.announcement}${issueMarker}`);

    if (output.issueMessage) {
      lines.push(`${indent}  └─ Issue: ${output.issueMessage}`);
    }
  }

  lines.push('');
  lines.push('═'.repeat(60));
  lines.push('Generated by TheWCAG Evaluation Extension');

  return lines.join('\n');
}

/**
 * Generate a full preview from the current page
 */
export function generateFullPreview(): ScreenReaderOutput[] {
  const tree = buildAccessibilityTree();
  return generateScreenReaderPreview(tree);
}

export default {
  generateScreenReaderPreview,
  filterByMode,
  formatAnnouncement,
  getNavigationModes,
  getPreviewStats,
  exportAsText,
  generateFullPreview,
};

