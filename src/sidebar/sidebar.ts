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
} from '../types';
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
  connectToServiceWorker();
  setupEventListeners();
  sendMessage('sidebarLoaded', {});
}

// ============================================
// Messaging
// ============================================
function connectToServiceWorker() {
  try {
    port = chrome.runtime.connect({ name: 'sidebarToServiceWorker' });

    port.onMessage.addListener(handleMessage);
    port.onDisconnect.addListener(() => {
      port = null;
    });
  } catch (e) {
    console.error('Failed to connect to service worker:', e);
  }
}

function sendMessage(action: string, data: unknown) {
  if (port) {
    port.postMessage({ action, data });
  }
}

function handleMessage(message: { name: string; action: string; data: unknown; tabId?: number }) {
  if (message.name !== 'serviceworkerToSidebar') return;

  if (tabId === undefined && message.tabId !== undefined) {
    tabId = message.tabId;
  }

  if (message.tabId !== undefined && message.tabId !== tabId) return;

  switch (message.action) {
    case 'setExtensionUrl':
      // Extension URL received
      break;

    case 'evaluationResults':
      handleResults(message.data as EvaluationResults);
      break;

    case 'outlineData':
      handleOutlineData(message.data as { headings: HeadingInfo[]; landmarks: LandmarkInfo[] });
      break;

    case 'navigationData':
      handleNavigationData(message.data as NavigationItem[]);
      break;

    case 'contrastData':
      handleContrastData(message.data as { foreground: string; background: string });
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

  const categories = [
    { key: 'error' as const, label: 'Errors', className: 'error' },
    { key: 'alert' as const, label: 'Alerts', className: 'alert' },
    { key: 'feature' as const, label: 'Features', className: 'feature' },
    { key: 'structure' as const, label: 'Structural Elements', className: 'structure' },
    { key: 'aria' as const, label: 'ARIA', className: 'aria' },
  ];

  categories.forEach(({ key, label, className }) => {
    const items = state.results!.categories[key];
    if (!items || items.length === 0) return;

    // Group by ruleId
    const groupedByRule = groupResultsByRuleId(items);
    const totalCount = items.length;

    const categoryDiv = document.createElement('div');
    categoryDiv.className = `icon-group ${className}`;
    categoryDiv.innerHTML = `
      <h3>
        <span class="category-icon ${className}-icon"></span>
        <span class="category-count">${totalCount}</span>
        ${label}
      </h3>
    `;

    const groupList = document.createElement('ul');

    groupedByRule.forEach(group => {
      const groupItem = createGroupItem(group, className);
      groupList.appendChild(groupItem);
    });

    categoryDiv.appendChild(groupList);
    iconList.appendChild(categoryDiv);
  });
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
        📖
      </button>
    </h4>
    <ul class="item-list"></ul>
  `;

  const itemList = li.querySelector('.item-list')!;

  group.items.forEach((item, index) => {
    const itemLi = document.createElement('li');
    itemLi.innerHTML = `
      <button class="icon-btn ${className}" 
              data-selector="${escapeHtml(item.selector)}"
              data-item-id="${group.ruleId}-${index}"
              title="${escapeHtml(item.message)}">
        ${index + 1}
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
function handleNavigationData(items: NavigationItem[]) {
  const navList = document.getElementById('nav-list');
  if (!navList) return;

  navList.innerHTML = items
    .map(
      item => `
    <li class="nav-item" data-selector="${escapeHtml(item.selector || item.tagName)}">
      <span class="nav-index">${item.index}</span>
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

// ============================================
// Start
// ============================================
document.addEventListener('DOMContentLoaded', init);
