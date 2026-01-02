// ============================================
// TheWCAG Evaluation Extension - Sidebar
// ============================================

import {
  EvaluationResults,
  SidebarState,
  SidebarTab,
  RuleResultGroup,
  RuleDocumentation,
  HeadingInfo,
  LandmarkInfo,
  NavigationItem,
  ComplianceReport,
  WcagLevel,
  ExtensionSettings,
  IgnorePattern,
  ScreenReaderOutput,
  QuickFix,
} from '../types';
import { generateComplianceReport } from '../utils/compliance-checker';
import {
  parseColor,
  rgbToHex,
  calculateContrastRatio,
  isLargeText,
  passesWCAG_AA,
  passesWCAG_AAA,
  formatContrastRatio,
  adjustLightness,
  rgbToHsl,
  hslToRgb,
} from '../utils/color-utils';

// ============================================
// Context Validation
// ============================================
let isContextInvalidated = false;

const isContextValid = (): boolean => {
  if (isContextInvalidated) return false;
  try {
    return !!(chrome?.runtime?.id);
  } catch {
    isContextInvalidated = true;
    return false;
  }
};

// ============================================
// State
// ============================================
const state: SidebarState = {
  activeTab: 'details',
  stylesEnabled: true,
  results: null,
  selectedIcon: null,
  contrastSettings: {
    foreground: '#000000',
    background: '#FFFFFF',
    alpha: 1,
    textSize: 'normal',
  },
  isLoading: true,
  error: null,
};

let port: chrome.runtime.Port | null = null;
let tabId: number | undefined;
let desaturated = false;

// ============================================
// Initialize
// ============================================
function init() {
  console.log('TheWCAG Sidebar: Initializing...');
  connectToServiceWorker();
  setupEventListeners();
  sendMessage('sidebarLoaded', {});
  console.log('TheWCAG Sidebar: Initialized and sent sidebarLoaded');
}

// ============================================
// Messaging
// ============================================
function connectToServiceWorker() {
  if (!isContextValid()) return;
  try {
    port = chrome.runtime.connect({ name: 'sidebarToServiceWorker' });

    port.onMessage.addListener(handleMessage);
    port.onDisconnect.addListener(() => {
      void chrome.runtime.lastError;
      port = null;
    });
  } catch (e) {
    console.error('Failed to connect to service worker:', e);
    port = null;
  }
}

function sendMessage(action: string, data: unknown) {
  if (!isContextValid()) return;
  if (port) {
    try {
      port.postMessage({ action, data });
    } catch {
      // Port disconnected
      port = null;
    }
  }
}

function handleMessage(message: { name: string; action: string; data: unknown; tabId?: number }) {
  console.log('TheWCAG Sidebar: Received message', message.name, message.action);
  
  if (!isContextValid()) {
    console.log('TheWCAG Sidebar: Context invalid, ignoring');
    return;
  }
  if (message.name !== 'serviceWorkerToSidebar') {
    console.log('TheWCAG Sidebar: Wrong message name, ignoring');
    return;
  }

  if (tabId === undefined && message.tabId !== undefined) {
    tabId = message.tabId;
  }

  if (message.tabId !== undefined && message.tabId !== tabId) {
    console.log('TheWCAG Sidebar: Tab ID mismatch, ignoring');
    return;
  }

  switch (message.action) {
    case 'setExtensionUrl':
      console.log('TheWCAG Sidebar: Extension URL received');
      break;

    case 'evaluationResults':
      console.log('TheWCAG Sidebar: Evaluation results received, data:', message.data);
      console.log('TheWCAG Sidebar: Data type:', typeof message.data);
      console.log('TheWCAG Sidebar: Has summary?', !!(message.data as any)?.summary);
      handleResults(message.data as EvaluationResults);
      break;

    case 'outlineData':
      handleOutlineData(message.data as { headings: HeadingInfo[]; landmarks: LandmarkInfo[] });
      break;

    case 'navigationData':
      console.log('TheWCAG Sidebar: Navigation data received:', message.data);
      handleNavigationData(message.data);
      break;

    case 'contrastData':
      handleContrastData(message.data as { foreground: string; background: string });
      break;

    case 'complianceData':
    case 'settingsData':
    case 'screenReaderData':
    case 'quickFixData':
      handleNewFeatureMessages(message);
      break;
  }
}

// ============================================
// Results Handling
// ============================================
function handleResults(results: EvaluationResults) {
  state.results = results;
  state.isLoading = false;

  updateSummary();
  updateIconList();
  hideLoading();

  // Request outline data
  sendMessage('getOutline', {});
}

function updateSummary() {
  if (!state.results) return;

  const { summary, aimScore } = state.results;

  // Update counts
  setCountValue('count-errors', summary.errors);
  setCountValue('count-contrast', summary.contrastErrors || 0);
  setCountValue('count-alerts', summary.alerts);
  setCountValue('count-features', summary.features);
  setCountValue('count-structure', summary.structure);
  setCountValue('count-aria', summary.aria);

  // Show congrats if no errors
  const congrats = document.getElementById('congrats');
  if (congrats) {
    const hasErrors = summary.errors > 0 || (summary.contrastErrors || 0) > 0;
    congrats.classList.toggle('hidden', hasErrors);
  }

  // Update AIM score
  const aimValue = document.getElementById('aim-value');
  const aimBar = document.getElementById('aim-bar');

  if (aimValue) aimValue.textContent = aimScore.toFixed(1);
  if (aimBar) aimBar.style.width = `${aimScore * 10}%`;
}

function setCountValue(id: string, value: number) {
  const element = document.querySelector(`#${id} .count-value`);
  if (element) element.textContent = value.toString();
}

function updateIconList() {
  if (!state.results) return;

  const iconList = document.getElementById('icon-list');
  if (!iconList) return;

  iconList.innerHTML = '';

  // Category definitions with descriptions for users
  const categories = [
    { 
      key: 'error' as const, 
      label: 'Errors', 
      className: 'error',
      description: 'Critical accessibility barriers that must be fixed. These prevent users with disabilities from accessing content.',
      priority: 'High Priority',
      priorityClass: 'priority-critical'
    },
    { 
      key: 'alert' as const, 
      label: 'Alerts', 
      className: 'alert',
      description: 'Potential issues that need manual review. Some may be false positives depending on context.',
      priority: 'Review Needed',
      priorityClass: 'priority-warning'
    },
    { 
      key: 'feature' as const, 
      label: 'Features', 
      className: 'feature',
      description: 'Accessibility features properly implemented. These help users with disabilities navigate your site.',
      priority: 'Good Practice',
      priorityClass: 'priority-good'
    },
    { 
      key: 'structure' as const, 
      label: 'Structural Elements', 
      className: 'structure',
      description: 'Page structure elements like headings, lists, and tables that organize content for all users.',
      priority: 'Informational',
      priorityClass: 'priority-info'
    },
    { 
      key: 'aria' as const, 
      label: 'ARIA Attributes', 
      className: 'aria',
      description: 'Accessible Rich Internet Applications (ARIA) attributes providing extra context to assistive technologies.',
      priority: 'Semantic Info',
      priorityClass: 'priority-aria'
    },
  ];

  categories.forEach(({ key, label, className, description, priority, priorityClass }) => {
    const items = state.results!.categories[key];
    if (!items || items.length === 0) return;

    // Group by ruleId
    const groupedByRule = groupResultsByRuleId(items);
    const totalCount = items.length;

    const categoryDiv = document.createElement('div');
    categoryDiv.className = `icon-group ${className}`;
    categoryDiv.innerHTML = `
      <div class="category-header">
        <h3>
          <span class="category-icon ${className}-icon"></span>
          <span class="category-count">${totalCount}</span>
          ${label}
          <span class="category-priority ${priorityClass}">${priority}</span>
        </h3>
        <p class="category-description">${description}</p>
      </div>
    `;

    const groupList = document.createElement('ul');

    groupedByRule.forEach(group => {
      const groupItem = createGroupItem(group, className);
      groupList.appendChild(groupItem);
    });

    categoryDiv.appendChild(groupList);
    iconList.appendChild(categoryDiv);
  });

  // If no issues found, show a message
  if (iconList.children.length === 0) {
    iconList.innerHTML = `
      <div class="no-issues-message">
        <span class="no-issues-icon">✨</span>
        <p>No issues detected by automated testing.</p>
        <p class="no-issues-hint">Remember: Automated tools can only find about 30-40% of accessibility issues. 
        <a href="https://www.w3.org/WAI/test-evaluate/" target="_blank" rel="noopener">Manual testing</a> is essential.</p>
      </div>
    `;
  }
}

// Helper function to group RuleResult[] into RuleResultGroup[]
function groupResultsByRuleId(items: import('../types').RuleResult[]): RuleResultGroup[] {
  const map = new Map<string, RuleResultGroup>();

  items.forEach(item => {
    if (!map.has(item.ruleId)) {
      map.set(item.ruleId, {
        ruleId: item.ruleId,
        ruleName: item.ruleId.replace(/_/g, ' '),
        category: item.category,
        items: [],
        count: 0,
      });
    }
    const group = map.get(item.ruleId)!;
    group.items.push(item);
    group.count++;
  });

  return Array.from(map.values());
}

function createGroupItem(group: RuleResultGroup, className: string): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'icon-type';

  li.innerHTML = `
    <h4>
      <input type="checkbox" class="icon-toggle" data-rule-id="${group.ruleId}" checked>
      <span class="rule-icon ${className}-icon"></span>
      <span class="rule-count">${group.count}</span>
      <span class="rule-name">${group.ruleName}</span>
      <button class="reference-btn" data-rule-id="${group.ruleId}" title="View documentation">
        <span class="btn-icon icon-book"></span>
      </button>
    </h4>
    <ul class="item-list"></ul>
  `;

  const itemList = li.querySelector('.item-list')!;

  group.items.forEach((item, index) => {
    const itemLi = document.createElement('li');
    itemLi.className = 'item-with-inspect';
    itemLi.innerHTML = `
      <button class="icon-btn ${className}" 
              data-selector="${escapeHtml(item.selector)}"
              data-item-id="${group.ruleId}-${index}"
              title="${escapeHtml(item.message)}">
        ${index + 1}
      </button>
      <button class="inspect-btn" 
              data-selector="${escapeHtml(item.selector)}"
              title="Inspect in DevTools">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8M16 17H8M10 9H8"/>
        </svg>
      </button>
    `;
    itemList.appendChild(itemLi);
  });

  return li;
}

// ============================================
// Outline Data
// ============================================
function handleOutlineData(data: { headings: HeadingInfo[]; landmarks: LandmarkInfo[] }) {
  const headingOutline = document.getElementById('heading-outline');
  const landmarkList = document.getElementById('landmark-list');
  const structureEmpty = document.getElementById('structure-empty');

  if (!headingOutline || !landmarkList || !structureEmpty) return;

  // Headings
  if (data.headings.length === 0) {
    structureEmpty.classList.remove('hidden');
    headingOutline.innerHTML = '';
  } else {
    structureEmpty.classList.add('hidden');
    headingOutline.innerHTML = data.headings
      .map(
        h => `
      <div class="heading outline-h${h.level}" data-selector="${escapeHtml(h.selector)}">
        <span class="heading-level">H${h.level}</span>
        <span class="heading-text">${escapeHtml(h.text) || '<em>Empty</em>'}</span>
      </div>
    `
      )
      .join('');
  }

  // Landmarks
  landmarkList.innerHTML = data.landmarks
    .map(
      l => `
    <li class="landmark" data-selector="${escapeHtml(l.selector)}">
      <span class="landmark-role">${l.role}</span>
      ${l.label ? `<span class="landmark-label">${escapeHtml(l.label)}</span>` : ''}
    </li>
  `
    )
    .join('');
}

// ============================================
// Navigation Order
// ============================================
function handleNavigationData(data: NavigationItem[] | { items?: NavigationItem[] } | unknown) {
  const navList = document.getElementById('nav-list');
  if (!navList) return;

  // Handle different data formats
  let items: NavigationItem[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as { items: NavigationItem[] }).items)) {
    items = (data as { items: NavigationItem[] }).items;
  } else {
    console.warn('TheWCAG Sidebar: Invalid navigation data format:', data);
    navList.innerHTML = '<li class="nav-item">Unable to load navigation order</li>';
    return;
  }

  if (items.length === 0) {
    navList.innerHTML = '<li class="nav-item">No focusable elements found</li>';
    return;
  }

  navList.innerHTML = items
    .map(
      item => `
    <li class="nav-item" data-selector="${escapeHtml(item.selector || item.tagName || '')}">
      <span class="nav-index">${item.index || 0}</span>
      <span class="nav-role">${item.role || item.tagName || 'unknown'}</span>
      <span class="nav-name">${escapeHtml(item.accessibleName || item.text || '') || '<no name>'}</span>
    </li>
  `
    )
    .join('');
}

// ============================================
// Contrast Checker
// ============================================
function handleContrastData(data: { foreground: string; background: string }) {
  const fgHex = document.getElementById('fg-hex') as HTMLInputElement;
  const bgHex = document.getElementById('bg-hex') as HTMLInputElement;

  const fgColor = parseColor(data.foreground);
  const bgColor = parseColor(data.background);

  if (fgColor && fgHex) {
    fgHex.value = rgbToHex(fgColor).replace('#', '');
  }
  if (bgColor && bgHex) {
    bgHex.value = rgbToHex(bgColor).replace('#', '');
  }

  updateContrastResults();
}

function updateContrastResults() {
  const fgHex = (document.getElementById('fg-hex') as HTMLInputElement)?.value || '000000';
  const bgHex = (document.getElementById('bg-hex') as HTMLInputElement)?.value || 'FFFFFF';
  const alpha = parseFloat((document.getElementById('fg-alpha') as HTMLInputElement)?.value || '1');

  const fgColor = parseColor(`#${fgHex}`);
  const bgColor = parseColor(`#${bgHex}`);

  if (!fgColor || !bgColor) return;

  const ratio = calculateContrastRatio(fgColor, bgColor);
  const isLarge = state.contrastSettings?.textSize === 'large';
  const passesAA = passesWCAG_AA(ratio, isLarge);
  const passesAAA = passesWCAG_AAA(ratio, isLarge);

  // Update display
  const ratioEl = document.getElementById('contrast-ratio');
  const sampleEl = document.getElementById('sample-text');
  const aaEl = document.getElementById('wcag-aa');
  const aaaEl = document.getElementById('wcag-aaa');
  const fgPicker = document.getElementById('fg-picker') as HTMLInputElement;
  const bgPicker = document.getElementById('bg-picker') as HTMLInputElement;

  if (ratioEl) ratioEl.textContent = formatContrastRatio(ratio);
  if (sampleEl) {
    sampleEl.style.color = `#${fgHex}`;
    sampleEl.style.backgroundColor = `#${bgHex}`;
  }
  if (fgPicker) fgPicker.value = `#${fgHex}`;
  if (bgPicker) bgPicker.value = `#${bgHex}`;

  if (aaEl) {
    aaEl.textContent = passesAA ? 'Pass' : 'Fail';
    aaEl.className = passesAA ? 'pass' : 'fail';
  }
  if (aaaEl) {
    aaaEl.textContent = passesAAA ? 'Pass' : 'Fail';
    aaaEl.className = passesAAA ? 'pass' : 'fail';
  }
}

// ============================================
// Reference Documentation
// ============================================
function showReference(ruleId: string) {
  if (!state.results) return;

  // Find the rule documentation
  let doc: RuleDocumentation | undefined;
  let ruleType = '';
  let ruleName = '';

  const categoryKeys = ['error', 'alert', 'feature', 'structure', 'aria'] as const;
  const categoryLabels: Record<string, string> = {
    error: 'Error',
    alert: 'Alert',
    feature: 'Feature',
    structure: 'Structure',
    aria: 'ARIA',
  };

  for (const cat of categoryKeys) {
    const items = state.results?.categories[cat];
    if (!items) continue;

    const item = items.find(g => g.ruleId === ruleId);
    if (item) {
      // Get documentation from the rules module
      doc = {
        summary: item.message,
        purpose: `This issue affects accessibility.`,
        actions: ['Review and fix this issue.'],
        algorithm: `Detected ${item.ruleId} issue.`,
        guidelines: [],
      };
      ruleType = categoryLabels[cat] || cat;
      ruleName = item.ruleId.replace(/_/g, ' ');
      break;
    }
  }

  if (!doc) return;

  // Hide placeholder, show content
  const placeholder = document.getElementById('reference-placeholder');
  const content = document.getElementById('reference-content');
  const index = document.getElementById('reference-index');

  if (placeholder) placeholder.classList.add('hidden');
  if (index) index.classList.add('hidden');
  if (content) content.classList.remove('hidden');

  // Populate content
  document.getElementById('ref-type')!.textContent = ruleType;
  document.getElementById('ref-title')!.textContent = ruleName;
  document.getElementById('ref-summary')!.textContent = doc.summary;
  document.getElementById('ref-purpose')!.textContent = doc.purpose;
  document.getElementById('ref-algorithm')!.textContent = doc.algorithm;

  const actionsEl = document.getElementById('ref-actions')!;
  actionsEl.innerHTML = doc.actions.map(a => `<li>${escapeHtml(a)}</li>`).join('');

  const guidelinesEl = document.getElementById('ref-guidelines')!;
  guidelinesEl.innerHTML =
    doc.guidelines
      .map(
        g => `
    <li>
      <a href="${g.url}" target="_blank" rel="noopener">
        ${g.id} ${g.name} (Level ${g.level})
      </a>
    </li>
  `
      )
      .join('') || '<li>None specified</li>';

  // Switch to reference tab
  switchTab('reference');
}

// ============================================
// Tab Switching
// ============================================
function switchTab(tabName: SidebarTab) {
  state.activeTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    const isActive = tab.id === `tab-${tabName}`;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive.toString());
  });

  // Update panels
  document.querySelectorAll('.panel').forEach(panel => {
    const isActive = panel.id === `panel-${tabName}`;
    panel.classList.toggle('active', isActive);
    (panel as HTMLElement).hidden = !isActive;
  });

  // Load data for specific tabs
  if (tabName === 'order') {
    sendMessage('getNavigationOrder', {});
  } else if (tabName === 'compliance') {
    updateCompliancePanel();
  } else if (tabName === 'settings') {
    loadSettings();
  } else if (tabName === 'structure') {
    updateScreenReaderPreview();
  }
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // Tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.id.replace('tab-', '') as SidebarTab;
      switchTab(tabName);
    });
  });

  // Styles toggle
  const stylesSwitch = document.getElementById('styles-switch') as HTMLInputElement;
  if (stylesSwitch) {
    stylesSwitch.addEventListener('change', () => {
      state.stylesEnabled = stylesSwitch.checked;
      sendMessage('toggleStyles', { enabled: state.stylesEnabled });
    });
  }

  // Icon list clicks
  document.getElementById('icon-list')?.addEventListener('click', e => {
    const target = e.target as HTMLElement;

    // Reference button click
    if (target.classList.contains('reference-btn')) {
      const ruleId = target.dataset.ruleId;
      if (ruleId) showReference(ruleId);
      return;
    }

    // Inspect button click - show element in DevTools
    const inspectBtn = target.closest('.inspect-btn') as HTMLElement;
    if (inspectBtn) {
      const selector = inspectBtn.dataset.selector;
      if (selector) {
        sendMessage('inspectElement', { selector });
        showInspectNotification();
      }
      return;
    }

    // Icon button click
    if (target.classList.contains('icon-btn')) {
      const selector = target.dataset.selector;
      if (selector) {
        sendMessage('highlightElement', { selector });
      }
    }

    // Toggle checkbox
    if (target.classList.contains('icon-toggle')) {
      const checkbox = target as HTMLInputElement;
      const ruleId = checkbox.dataset.ruleId;
      // TODO: Toggle icon visibility
    }
  });

  // Structure clicks
  document.getElementById('heading-outline')?.addEventListener('click', e => {
    const heading = (e.target as HTMLElement).closest('.heading');
    if (heading) {
      const selector = heading.getAttribute('data-selector');
      if (selector) sendMessage('highlightElement', { selector });
    }
  });

  // Contrast inputs
  const contrastInputs = [
    'fg-hex',
    'bg-hex',
    'fg-picker',
    'bg-picker',
    'fg-alpha',
    'fg-lightness',
    'bg-lightness',
  ];
  contrastInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        syncContrastInputs(id);
        updateContrastResults();
      });
    }
  });

  // Desaturate
  document.getElementById('desaturate-page')?.addEventListener('click', e => {
    e.preventDefault();
    desaturated = !desaturated;
    sendMessage('desaturatePage', { enabled: desaturated });
    (e.target as HTMLElement).textContent = desaturated ? 'Restore colors' : 'Desaturate page';
  });

  // Refresh order
  document.getElementById('refresh-order')?.addEventListener('click', e => {
    e.preventDefault();
    sendMessage('getNavigationOrder', {});
  });

  // Toggle icons
  document.getElementById('toggle-icons')?.addEventListener('click', e => {
    e.preventDefault();
    sendMessage('toggleIcons', { visible: true });
  });

  // Show index
  document.getElementById('show-index')?.addEventListener('click', e => {
    e.preventDefault();
    showIconIndex();
  });
}

function syncContrastInputs(changedId: string) {
  const fgHex = document.getElementById('fg-hex') as HTMLInputElement;
  const bgHex = document.getElementById('bg-hex') as HTMLInputElement;
  const fgPicker = document.getElementById('fg-picker') as HTMLInputElement;
  const bgPicker = document.getElementById('bg-picker') as HTMLInputElement;
  const fgLightness = document.getElementById('fg-lightness') as HTMLInputElement;
  const bgLightness = document.getElementById('bg-lightness') as HTMLInputElement;

  if (changedId === 'fg-picker' && fgPicker && fgHex) {
    fgHex.value = fgPicker.value.replace('#', '');
  } else if (changedId === 'bg-picker' && bgPicker && bgHex) {
    bgHex.value = bgPicker.value.replace('#', '');
  } else if (changedId === 'fg-lightness' && fgLightness && fgHex) {
    const color = parseColor(`#${fgHex.value}`);
    if (color) {
      const hsl = rgbToHsl(color);
      hsl.l = parseInt(fgLightness.value);
      const newRgb = hslToRgb(hsl);
      fgHex.value = rgbToHex(newRgb).replace('#', '');
    }
  } else if (changedId === 'bg-lightness' && bgLightness && bgHex) {
    const color = parseColor(`#${bgHex.value}`);
    if (color) {
      const hsl = rgbToHsl(color);
      hsl.l = parseInt(bgLightness.value);
      const newRgb = hslToRgb(hsl);
      bgHex.value = rgbToHex(newRgb).replace('#', '');
    }
  }
}

function showIconIndex() {
  const placeholder = document.getElementById('reference-placeholder');
  const content = document.getElementById('reference-content');
  const index = document.getElementById('reference-index');

  if (placeholder) placeholder.classList.add('hidden');
  if (content) content.classList.add('hidden');
  if (index) {
    index.classList.remove('hidden');

    if (!state.results) {
      index.innerHTML = '<p>No results available.</p>';
      return;
    }

    const categories = [
      { key: 'error' as const, label: 'Errors' },
      { key: 'alert' as const, label: 'Alerts' },
      { key: 'feature' as const, label: 'Features' },
      { key: 'structure' as const, label: 'Structure' },
      { key: 'aria' as const, label: 'ARIA' },
    ];

    index.innerHTML = categories
      .map(({ key, label }) => {
        const items = state.results!.categories[key];
        if (!items || items.length === 0) return '';

        // Get unique rule IDs
        const uniqueRules = new Set<string>();
        items.forEach(item => uniqueRules.add(item.ruleId));

        return `
        <h3>${label}</h3>
        <div class="index-icons">
          ${Array.from(uniqueRules)
            .map(ruleId => {
              const ruleName = ruleId.replace(/_/g, ' ');
              return `
              <button class="index-icon ${key}" 
                      data-rule-id="${ruleId}" 
                      title="${ruleName}">
                ${ruleName.slice(0, 20)}
              </button>
            `;
            })
            .join('')}
        </div>
      `;
      })
      .join('');

    index.querySelectorAll('.index-icon').forEach(btn => {
      btn.addEventListener('click', () => {
        const ruleId = btn.getAttribute('data-rule-id');
        if (ruleId) showReference(ruleId);
      });
    });
  }
}

// ============================================
// Utilities
// ============================================
function hideLoading() {
  const loading = document.getElementById('loading-message');
  if (loading) loading.remove();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showInspectNotification() {
  // Remove existing notification if any
  const existing = document.getElementById('inspect-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'inspect-notification';
  notification.innerHTML = `
    <div class="inspect-notification-content">
      <strong>Element ready for inspection!</strong>
      <p>Open DevTools (F12 or Cmd+Opt+I) and type in Console:</p>
      <code>inspect($wcag)</code>
      <p class="small">Or check the Console for the logged element.</p>
      <button class="close-notification">✕</button>
    </div>
  `;
  document.body.appendChild(notification);

  // Auto-hide after 8 seconds
  setTimeout(() => notification.remove(), 8000);

  // Close button
  notification.querySelector('.close-notification')?.addEventListener('click', () => {
    notification.remove();
  });
}

// ============================================
// Compliance Panel
// ============================================
let currentComplianceReport: ComplianceReport | null = null;
let currentComplianceFilter = 'all';

function updateCompliancePanel() {
  if (!state.results) {
    const list = document.getElementById('compliance-list');
    if (list) list.innerHTML = '<p class="empty-message">Evaluate a page first to see compliance data.</p>';
    const percentage = document.getElementById('compliance-percentage');
    if (percentage) percentage.textContent = '-%';
    return;
  }

  // Generate compliance report directly in the sidebar
  const levelSelect = document.getElementById('wcag-level') as HTMLSelectElement;
  const level = (levelSelect?.value || 'AA') as WcagLevel;
  
  try {
    const report = generateComplianceReport(state.results, level);
    handleComplianceData(report);
  } catch (err) {
    console.error('TheWCAG Sidebar: Failed to generate compliance report:', err);
    const list = document.getElementById('compliance-list');
    if (list) list.innerHTML = '<p class="empty-message">Error generating compliance report.</p>';
  }
}

function handleComplianceData(report: ComplianceReport) {
  currentComplianceReport = report;
  renderComplianceList();
}

function renderComplianceList() {
  if (!currentComplianceReport) return;

  const list = document.getElementById('compliance-list');
  const percentage = document.getElementById('compliance-percentage');
  const { summary } = currentComplianceReport;
  
  if (percentage) {
    // Never show 100% if manual testing is required
    if (summary.requiresManualTesting) {
      percentage.textContent = `≤${summary.percentage}%`;
      percentage.title = `${summary.manual} criteria require manual testing. True compliance cannot be determined automatically.`;
    } else if (summary.percentage === 100 && summary.manual > 0) {
      // Extra safety: if somehow we have manual items but 100%, cap it
      percentage.textContent = `≤99%`;
      percentage.title = `${summary.manual} criteria require manual testing.`;
    } else {
      percentage.textContent = `${summary.percentage}%`;
      percentage.title = summary.failed > 0 
        ? `${summary.failed} criteria failed`
        : 'Based on automated testing';
    }
  }

  if (!list) return;

  const filteredResults = currentComplianceReport.results.filter(result => {
    if (currentComplianceFilter === 'all') return true;
    if (currentComplianceFilter === 'new22') return result.criterion.isNew22;
    return result.status === currentComplianceFilter;
  });

  if (filteredResults.length === 0) {
    list.innerHTML = '<p class="empty-message">No matching criteria found.</p>';
    return;
  }

  // Add warning banner if manual testing is required
  let warningBanner = '';
  if (summary.manual > 0) {
    warningBanner = `
      <div class="compliance-warning">
        <strong><span class="inline-icon icon-warning"></span> Manual Testing Required</strong>
        <p>${summary.manual} criteria cannot be verified automatically and require human review. 
        Full WCAG compliance cannot be determined by automated testing alone.</p>
      </div>
    `;
  }

  list.innerHTML = warningBanner + filteredResults.map(result => {
    const statusIcon = {
      'passed': '<span class="status-icon status-passed"></span>',
      'failed': '<span class="status-icon status-failed"></span>',
      'manual': '?',
      'not-applicable': '—',
      'not-tested': '○'
    }[result.status] || '?';

    const new22Badge = result.criterion.isNew22 
      ? '<span class="new-22-badge">NEW 2.2</span>' 
      : '';

    return `
      <div class="compliance-item ${result.status}">
        <div class="compliance-status">${statusIcon}</div>
        <div class="compliance-details">
          <span class="compliance-id">${result.criterion.id}</span>
          <span class="compliance-level">${result.criterion.level}</span>
          ${new22Badge}
          <div class="compliance-name">${escapeHtml(result.criterion.name)}</div>
          ${result.issueCount > 0 ? `<div class="compliance-issue-count">${result.issueCount} issues found</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function setupComplianceListeners() {
  // Level selector
  document.getElementById('wcag-level')?.addEventListener('change', () => {
    updateCompliancePanel();
  });

  // Filter buttons
  document.querySelectorAll('.compliance-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.compliance-filters .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentComplianceFilter = (btn as HTMLElement).dataset.filter || 'all';
      renderComplianceList();
    });
  });

  // Export button
  document.getElementById('export-compliance')?.addEventListener('click', () => {
    if (!currentComplianceReport) {
      showNotification('No compliance data to export', 'error');
      return;
    }
    exportComplianceReport();
  });
}

function exportComplianceReport() {
  if (!currentComplianceReport) return;

  const text = generateComplianceText(currentComplianceReport);
  downloadTextFile('wcag-compliance-report.txt', text);
  showNotification('Compliance report exported!', 'success');
}

function generateComplianceText(report: ComplianceReport): string {
  const lines = [
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
    `Manual: ${report.summary.manual}`,
    '',
  ];

  report.results.forEach(result => {
    const statusIcons: Record<string, string> = { 
      passed: '<span class="status-icon status-passed"></span>', 
      failed: '<span class="status-icon status-failed"></span>', 
      manual: '<span class="status-icon status-manual"></span>', 
      'not-applicable': '<span class="status-icon status-na"></span>', 
      'not-tested': '<span class="status-icon status-untested"></span>' 
    };
    const status = statusIcons[result.status] || statusIcons['not-tested'];
    lines.push(`[${status}] ${result.criterion.id} ${result.criterion.name}`);
  });

  return lines.join('\n');
}

// ============================================
// Settings Panel
// ============================================
let currentSettings: ExtensionSettings | null = null;

function loadSettings() {
  sendMessage('getSettings', {});
}

function handleSettingsData(settings: ExtensionSettings) {
  currentSettings = settings;
  renderIgnoreList();
  renderCustomRules();
  updateSettingsUI();
}

function updateSettingsUI() {
  if (!currentSettings) return;

  const globalIgnore = document.getElementById('global-ignore-enabled') as HTMLInputElement;
  const showNew22 = document.getElementById('show-new22-badge') as HTMLInputElement;
  const defaultLevel = document.getElementById('default-wcag-level') as HTMLSelectElement;

  if (globalIgnore) globalIgnore.checked = currentSettings.globalIgnoreEnabled;
  if (showNew22) showNew22.checked = currentSettings.showNewIn22Badge;
  if (defaultLevel) defaultLevel.value = currentSettings.defaultWcagLevel;
}

function renderIgnoreList() {
  const list = document.getElementById('ignore-list');
  if (!list || !currentSettings) return;

  if (currentSettings.ignorePatterns.length === 0) {
    list.innerHTML = '<p class="empty-message">No ignore patterns defined.</p>';
    return;
  }

  list.innerHTML = currentSettings.ignorePatterns.map(pattern => `
    <div class="ignore-item ${pattern.enabled ? '' : 'disabled'}" data-id="${pattern.id}">
      <span class="ignore-item-pattern">${escapeHtml(pattern.pattern)}</span>
      <span class="ignore-item-type">${pattern.type}</span>
      <div class="ignore-item-actions">
        <button class="toggle-pattern-btn" title="${pattern.enabled ? 'Disable' : 'Enable'}">
          <span class="toggle-icon ${pattern.enabled ? 'toggle-on' : 'toggle-off'}"></span>
        </button>
        <button class="delete-pattern-btn" title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

function renderCustomRules() {
  const list = document.getElementById('custom-rules-list');
  if (!list || !currentSettings) return;

  if (currentSettings.customRules.length === 0) {
    list.innerHTML = '<p class="empty-message">No custom rules defined.</p>';
    return;
  }

  list.innerHTML = currentSettings.customRules.map(rule => `
    <div class="custom-rule-item" data-id="${rule.id}">
      <h4>${escapeHtml(rule.name)}</h4>
      <p>${escapeHtml(rule.message)}</p>
      <div class="custom-rule-selector">${escapeHtml(rule.selector)}</div>
    </div>
  `).join('');
}

function setupSettingsListeners() {
  // Global ignore toggle
  document.getElementById('global-ignore-enabled')?.addEventListener('change', (e) => {
    if (currentSettings) {
      currentSettings.globalIgnoreEnabled = (e.target as HTMLInputElement).checked;
      saveSettings();
    }
  });

  // Add ignore pattern
  document.getElementById('add-ignore-pattern')?.addEventListener('click', () => {
    const type = (document.getElementById('ignore-pattern-type') as HTMLSelectElement)?.value;
    const value = (document.getElementById('ignore-pattern-value') as HTMLInputElement)?.value;
    const reason = (document.getElementById('ignore-pattern-reason') as HTMLInputElement)?.value;

    if (!value.trim()) {
      showNotification('Please enter a pattern', 'error');
      return;
    }

    const pattern: IgnorePattern = {
      id: Date.now().toString(),
      type: type as IgnorePattern['type'],
      pattern: value.trim(),
      reason: reason || undefined,
      createdAt: Date.now(),
      enabled: true,
    };

    if (currentSettings) {
      currentSettings.ignorePatterns.push(pattern);
      saveSettings();
      renderIgnoreList();
      
      // Clear inputs
      (document.getElementById('ignore-pattern-value') as HTMLInputElement).value = '';
      (document.getElementById('ignore-pattern-reason') as HTMLInputElement).value = '';
    }
  });

  // Ignore list actions
  document.getElementById('ignore-list')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const item = target.closest('.ignore-item');
    const id = item?.getAttribute('data-id');

    if (!id || !currentSettings) return;

    if (target.classList.contains('delete-pattern-btn')) {
      currentSettings.ignorePatterns = currentSettings.ignorePatterns.filter(p => p.id !== id);
      saveSettings();
      renderIgnoreList();
    } else if (target.classList.contains('toggle-pattern-btn')) {
      const pattern = currentSettings.ignorePatterns.find(p => p.id === id);
      if (pattern) {
        pattern.enabled = !pattern.enabled;
        saveSettings();
        renderIgnoreList();
      }
    }
  });

  // Export/Import
  document.getElementById('export-settings')?.addEventListener('click', () => {
    if (!currentSettings) return;
    const json = JSON.stringify(currentSettings, null, 2);
    downloadTextFile('thewcag-settings.json', json);
    showNotification('Settings exported!', 'success');
  });

  document.getElementById('import-settings')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const settings = JSON.parse(reader.result as string);
            sendMessage('saveSettings', settings);
            showNotification('Settings imported!', 'success');
            loadSettings();
          } catch {
            showNotification('Invalid settings file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });
}

function saveSettings() {
  if (currentSettings) {
    sendMessage('saveSettings', currentSettings);
  }
}

// ============================================
// Screen Reader Preview
// ============================================
let screenReaderOutputs: ScreenReaderOutput[] = [];

function updateScreenReaderPreview() {
  sendMessage('getScreenReaderPreview', {});
}

function handleScreenReaderData(outputs: ScreenReaderOutput[]) {
  screenReaderOutputs = outputs;
  renderScreenReaderOutput();
}

function renderScreenReaderOutput() {
  const output = document.getElementById('sr-output');
  const mode = (document.getElementById('sr-mode') as HTMLSelectElement)?.value || 'all';

  if (!output) return;

  const filtered = filterScreenReaderOutputs(screenReaderOutputs, mode);

  if (filtered.length === 0) {
    output.innerHTML = '<p class="empty-message">No elements found for this mode.</p>';
    return;
  }

  output.innerHTML = filtered.map(item => {
    const depthClass = `sr-item-depth-${Math.min(item.depth, 5)}`;
    const issueClass = item.hasIssue ? 'has-issue' : '';

    return `
      <div class="sr-item ${depthClass} ${issueClass}" data-selector="${escapeHtml(item.selector)}">
        <span class="sr-announcement">${escapeHtml(item.announcement)}</span>
        ${item.hasIssue ? `<span class="sr-issue">⚠ ${escapeHtml(item.issueMessage || '')}</span>` : ''}
      </div>
    `;
  }).join('');
}

function filterScreenReaderOutputs(outputs: ScreenReaderOutput[], mode: string): ScreenReaderOutput[] {
  if (mode === 'all') return outputs;
  if (mode === 'issues') return outputs.filter(o => o.hasIssue);
  return outputs.filter(o => {
    const typeMap: Record<string, string[]> = {
      headings: ['heading'],
      landmarks: ['landmark', 'navigation', 'region'],
      links: ['link'],
      buttons: ['button'],
      forms: ['form'],
      tables: ['table'],
      images: ['image'],
    };
    return typeMap[mode]?.includes(o.type);
  });
}

function setupScreenReaderListeners() {
  // Mode selector
  document.getElementById('sr-mode')?.addEventListener('change', () => {
    renderScreenReaderOutput();
  });

  // Click to highlight
  document.getElementById('sr-output')?.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.sr-item');
    if (item) {
      const selector = item.getAttribute('data-selector');
      if (selector) {
        sendMessage('highlightElement', { selector });
      }
    }
  });

  // Export
  document.getElementById('sr-export')?.addEventListener('click', () => {
    const text = screenReaderOutputs.map(o => {
      const indent = '  '.repeat(o.depth);
      return `${indent}${o.announcement}${o.hasIssue ? ' ⚠' : ''}`;
    }).join('\n');

    downloadTextFile('screen-reader-preview.txt', text);
    showNotification('Screen reader preview exported!', 'success');
  });
}

// ============================================
// Quick Fix
// ============================================
let currentQuickFix: QuickFix | null = null;

function showQuickFix(ruleId: string, selector: string) {
  sendMessage('getQuickFix', { ruleId, selector });
}

function handleQuickFixData(data: { fix: QuickFix; currentCode: string; suggestedCode: string }) {
  currentQuickFix = data.fix;
  
  const section = document.getElementById('quick-fix-section');
  const current = document.getElementById('fix-current');
  const suggested = document.getElementById('fix-suggested');
  const examplesList = document.getElementById('fix-examples-list');
  const learnMore = document.getElementById('fix-learn-more') as HTMLAnchorElement;

  if (!section || !current || !suggested) return;

  section.classList.remove('hidden');
  current.textContent = data.currentCode;
  suggested.textContent = data.suggestedCode;

  if (examplesList && data.fix.examples) {
    examplesList.innerHTML = data.fix.examples.map(ex => `
      <div class="fix-example">
        <div class="fix-example-before">Before: <span>${escapeHtml(ex.before)}</span></div>
        <div class="fix-example-after">After: <span>${escapeHtml(ex.after)}</span></div>
        <div class="fix-example-explanation">${escapeHtml(ex.explanation)}</div>
      </div>
    `).join('');
  }

  if (learnMore) {
    learnMore.href = data.fix.learnMoreUrl;
  }
}

function setupQuickFixListeners() {
  // Copy fix button
  document.getElementById('copy-fix-btn')?.addEventListener('click', () => {
    const suggested = document.getElementById('fix-suggested');
    if (suggested) {
      navigator.clipboard.writeText(suggested.textContent || '');
      const btn = document.getElementById('copy-fix-btn');
      if (btn) {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      }
    }
  });
}

// ============================================
// Notification System
// ============================================
function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const notification = document.getElementById('notification');
  if (!notification) return;

  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');

  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// ============================================
// Utility Functions
// ============================================
function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// Enhanced Message Handler
// ============================================
function handleNewFeatureMessages(message: { action: string; data: unknown }) {
  switch (message.action) {
    case 'complianceData':
      handleComplianceData(message.data as ComplianceReport);
      break;
    case 'settingsData':
      handleSettingsData(message.data as ExtensionSettings);
      break;
    case 'screenReaderData':
      handleScreenReaderData(message.data as ScreenReaderOutput[]);
      break;
    case 'quickFixData':
      handleQuickFixData(message.data as { fix: QuickFix; currentCode: string; suggestedCode: string });
      break;
  }
}

// ============================================
// Start
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupComplianceListeners();
  setupSettingsListeners();
  setupScreenReaderListeners();
  setupQuickFixListeners();
});
