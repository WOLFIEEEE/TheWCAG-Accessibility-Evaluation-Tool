// ============================================
// TheWCAG Evaluation Extension - Page Analyzer
// ============================================

import { EvaluationResults, RuleResult } from '../types';
import { evaluatePage } from '../rules';
import { dispatchCustomEvent, listenForCustomEvent } from '../utils/messaging';
import { getNavigationOrder, getHeadings, getLandmarks } from '../utils/dom-utils';

// State
let extensionUrl = '';
let results: EvaluationResults | null = null;
let iconsVisible = true;
let stylesEnabled = true;
let sidebarElement: HTMLIFrameElement | null = null;
let tooltipElement: HTMLDivElement | null = null;
const iconElements: Map<string, HTMLElement> = new Map();
let isInitialized = false;
let cleanupFunctions: Array<() => void> = [];

// Track if extension has been cleaned up
let isCleanedUp = false;

// Helper Functions
const calculateAimScore = (errors: number, alerts: number): number => {
  const errorPenalty = errors * 0.5;
  const alertPenalty = alerts * 0.1;
  const score = Math.max(0, 10 - errorPenalty - alertPenalty);
  return Math.round(score * 10) / 10;
};

// Sidebar Creation
const createSidebar = (): void => {
  removeSidebar();

  const container = document.createElement('div');
  container.id = 'thewcag-sidebar-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 380px;
    height: 100vh;
    z-index: 2147483647;
    box-shadow: 2px 0 10px rgba(0,0,0,0.3);
    transition: transform 0.3s ease;
  `;

  sidebarElement = document.createElement('iframe');
  sidebarElement.id = 'thewcag-sidebar';
  sidebarElement.src = extensionUrl + 'sidebar/sidebar.html';
  sidebarElement.style.cssText = `
    width: 100%;
    height: 100%;
      border: none;
      background: #F9F7F4;
  `;

  container.appendChild(sidebarElement);

  const toggle = document.createElement('button');
  toggle.id = 'thewcag-toggle';
  toggle.innerHTML = '◀';
  toggle.setAttribute('aria-label', 'Toggle sidebar');
  toggle.style.cssText = `
    position: fixed;
    top: 50%;
    left: 380px;
    transform: translateY(-50%);
    width: 24px;
    height: 50px;
    padding: 0;
    border: none;
    border-radius: 0 6px 6px 0;
      background-color: #A85A3B;
    color: white;
    cursor: pointer;
    z-index: 2147483647;
    font-size: 14px;
    transition: left 0.3s ease;
  `;

  let sidebarVisible = true;
  toggle.addEventListener('click', () => {
    sidebarVisible = !sidebarVisible;
    container.style.transform = sidebarVisible ? 'translateX(0)' : 'translateX(-380px)';
    toggle.style.left = sidebarVisible ? '380px' : '0px';
    toggle.innerHTML = sidebarVisible ? '◀' : '▶';
  });

  document.body.appendChild(container);
  document.body.appendChild(toggle);

  document.body.style.marginLeft = '380px';
  document.body.style.transition = 'margin-left 0.3s ease';
};

const removeSidebar = (): void => {
  const container = document.getElementById('thewcag-sidebar-container');
  const toggle = document.getElementById('thewcag-toggle');

  if (container) container.remove();
  if (toggle) toggle.remove();

  document.body.style.marginLeft = '';
  sidebarElement = null;
};

// Icon helpers
const getCategoryClass = (category: string): string => {
  const classes: Record<string, string> = {
    error: 'error',
    alert: 'alert',
    feature: 'feature',
    structure: 'structure',
    aria: 'aria',
  };
  return classes[category] || 'default';
};

const getCategoryStyles = (category: string): string => {
  const styles: Record<string, string> = {
    error: 'background-color: #D64545;',
    alert: 'background-color: #E6994D;',
    feature: 'background-color: #4A9D5B;',
    structure: 'background-color: #4A7DB5;',
    aria: 'background-color: #8B5CB5;',
  };
  return styles[category] || 'background-color: #A85A3B;';
};

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    error: '✕',
    alert: '!',
    feature: '✓',
    structure: '▤',
    aria: 'A',
  };
  return icons[category] || '•';
};

const clearIcons = (): void => {
  const container = document.getElementById('thewcag-icons');
  if (container) container.innerHTML = '';
  iconElements.clear();
};

// Tooltip
const hideTooltip = (): void => {
  if (tooltipElement) {
    tooltipElement.remove();
    tooltipElement = null;
  }
};

const showTooltip = (item: RuleResult, category: string, anchorElement: HTMLElement): void => {
  hideTooltip();

  const rect = anchorElement.getBoundingClientRect();

  tooltipElement = document.createElement('div');
  tooltipElement.id = 'thewcag-tooltip';
  tooltipElement.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 5}px;
    left: ${rect.left}px;
    max-width: 250px;
    padding: 10px;
    background: #1451A0;
    color: white;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    z-index: 2147483647;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    pointer-events: auto;
  `;

  tooltipElement.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${item.message}</div>
    <div style="font-size: 11px; opacity: 0.9;">
      Click for details • 
      <a href="#" style="color: #8dd;" class="thewcag-reference-link">REFERENCE</a>
    </div>
  `;

  document.body.appendChild(tooltipElement);

  const tooltipRect = tooltipElement.getBoundingClientRect();
  if (tooltipRect.right > window.innerWidth) {
    tooltipElement.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
  }
  if (tooltipRect.bottom > window.innerHeight) {
    tooltipElement.style.top = `${rect.top - tooltipRect.height - 5}px`;
  }
};

// Element Highlighting
const highlightElement = (element: HTMLElement): void => {
  const existing = document.querySelector('.thewcag-highlight');
  if (existing) existing.classList.remove('thewcag-highlight');

  if (!document.getElementById('thewcag-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'thewcag-highlight-styles';
    style.textContent = `
      .thewcag-highlight {
        outline: 3px solid #e74c3c !important;
        outline-offset: 2px !important;
        animation: thewcag-pulse 1s ease-in-out 3;
      }
      @keyframes thewcag-pulse {
        0%, 100% { outline-color: #e74c3c; }
        50% { outline-color: #f39c12; }
      }
    `;
    document.head.appendChild(style);
  }

  element.classList.add('thewcag-highlight');
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    element.classList.remove('thewcag-highlight');
  }, 3000);
};

// Icon Creation
const createIcon = (
  item: RuleResult,
  ruleId: string,
  category: string,
  index: number,
  container: HTMLElement
): void => {
  const element = document.querySelector(item.selector);
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  const icon = document.createElement('div');
  const iconId = `${ruleId}-${index}`;
  icon.id = `thewcag-icon-${iconId}`;
  icon.className = `thewcag-icon thewcag-icon-${getCategoryClass(category)}`;
  icon.style.cssText = `
    position: absolute;
    top: ${rect.top + scrollTop - 12}px;
    left: ${rect.left + scrollLeft - 12}px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: auto;
    font-size: 12px;
    font-weight: bold;
    color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ${getCategoryStyles(category)}
  `;

  icon.innerHTML = getCategoryIcon(category);
  icon.setAttribute('data-rule-id', ruleId);
  icon.setAttribute('data-item-id', iconId);
  icon.setAttribute('role', 'button');
  icon.setAttribute('tabindex', '0');
  icon.setAttribute('aria-label', `${category}: ${item.message}`);

  icon.addEventListener('mouseenter', () => showTooltip(item, category, icon));
  icon.addEventListener('mouseleave', hideTooltip);
  icon.addEventListener('click', () => {
    highlightElement(element as HTMLElement);
    dispatchCustomEvent('showTooltip', { ruleId, item, category });
  });
  icon.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      highlightElement(element as HTMLElement);
    }
  });

  container.appendChild(icon);
  iconElements.set(iconId, icon);
};

// Icon Injection
const injectIcons = (): void => {
  if (!results) return;

  clearIcons();

  let iconContainer = document.getElementById('thewcag-icons');
  if (!iconContainer) {
    iconContainer = document.createElement('div');
    iconContainer.id = 'thewcag-icons';
    iconContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 2147483646;
    `;
    document.body.appendChild(iconContainer);
  }

  const categoryMap: Record<string, RuleResult[]> = {
    error: results.categories.error,
    alert: results.categories.alert,
    feature: results.categories.feature,
    structure: results.categories.structure,
    aria: results.categories.aria,
  };

  Object.entries(categoryMap).forEach(([category, items]) => {
    items.forEach((item: RuleResult, index: number) => {
      createIcon(item, item.ruleId, category, index, iconContainer!);
    });
  });
};

// Style Toggle
const toggleStyles = (enabled: boolean): void => {
  stylesEnabled = enabled;

  const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');

  stylesheets.forEach(sheet => {
    if (sheet.id && sheet.id.startsWith('thewcag')) return;
    (sheet as HTMLElement).dataset.thewcagDisabled = enabled ? '' : 'true';
    (sheet as HTMLLinkElement | HTMLStyleElement).disabled = !enabled;
  });

  if (!enabled) {
    document.body.dataset.thewcagOriginalStyle = document.body.getAttribute('style') || '';
    document.body.style.cssText = `
      font-family: serif;
      font-size: 16px;
      line-height: 1.5;
      color: black;
      background: white;
      margin-left: 380px;
    `;
  } else {
    document.body.style.cssText = document.body.dataset.thewcagOriginalStyle || '';
    document.body.style.marginLeft = '380px';
  }
};

// Reset
const reset = (): void => {
  isCleanedUp = true;
  
  // Run all cleanup functions
  cleanupFunctions.forEach(fn => {
    try {
      fn();
    } catch {
      // Ignore cleanup errors
    }
  });
  cleanupFunctions = [];

  removeSidebar();
  clearIcons();
  hideTooltip();

  const iconContainer = document.getElementById('thewcag-icons');
  if (iconContainer) iconContainer.remove();

  const highlightStyles = document.getElementById('thewcag-highlight-styles');
  if (highlightStyles) highlightStyles.remove();

  if (!stylesEnabled) {
    toggleStyles(true);
  }

  document.body.style.filter = '';
  results = null;
};

// Message Listeners
const setupMessageListeners = (): void => {
  const cleanup1 = listenForCustomEvent('resetEvaluation', () => {
    reset();
  });
  cleanupFunctions.push(cleanup1);

  const cleanup2 = listenForCustomEvent<{ enabled: boolean }>('toggleStyles', data => {
    if (isCleanedUp) return;
    toggleStyles(data.enabled);
  });
  cleanupFunctions.push(cleanup2);

  const cleanup3 = listenForCustomEvent<{ visible: boolean }>('toggleIcons', data => {
    if (isCleanedUp) return;
    iconsVisible = data.visible;
    if (iconsVisible) {
      injectIcons();
    } else {
      clearIcons();
    }
  });
  cleanupFunctions.push(cleanup3);

  const cleanup4 = listenForCustomEvent<{ selector: string }>('highlightElement', data => {
    if (isCleanedUp) return;
    const element = document.querySelector(data.selector);
    if (element) highlightElement(element as HTMLElement);
  });
  cleanupFunctions.push(cleanup4);

  const cleanup5 = listenForCustomEvent('getNavigationOrder', () => {
    if (isCleanedUp) return;
    const navOrder = getNavigationOrder();
    // Convert to serializable format (remove DOM element references)
    const serializableItems = navOrder.items.map(item => {
      const el = item.element;
      // Generate a useful selector
      let selector = item.tagName;
      if (el.id) {
        selector = `#${el.id}`;
      } else if (el.className && typeof el.className === 'string' && el.className.trim()) {
        selector = `${item.tagName}.${el.className.trim().split(/\s+/)[0]}`;
      }
      
      // Get role - use implicit role for common elements
      let role = el.getAttribute('role');
      if (!role) {
        const implicitRoles: Record<string, string> = {
          a: 'link',
          button: 'button',
          input: item.type === 'checkbox' ? 'checkbox' : 
                 item.type === 'radio' ? 'radio' : 
                 item.type === 'submit' ? 'button' : 'textbox',
          select: 'combobox',
          textarea: 'textbox',
          img: 'img',
          nav: 'navigation',
          main: 'main',
          header: 'banner',
          footer: 'contentinfo',
          aside: 'complementary',
        };
        role = implicitRoles[item.tagName] || item.tagName;
      }
      
      return {
        index: item.index,
        tagName: item.tagName,
        type: item.type,
        text: item.text,
        tabIndex: item.tabIndex,
        isNative: item.isNative,
        selector,
        role,
        accessibleName: item.text || `${role} element`,
      };
    });
    dispatchCustomEvent('navigationData', serializableItems);
  });
  cleanupFunctions.push(cleanup5);

  const cleanup6 = listenForCustomEvent('getOutline', () => {
    if (isCleanedUp) return;
    const headingElements = getHeadings();
    const landmarkElements = getLandmarks();
    
    // Convert heading elements to serializable format
    const headings = headingElements.map(el => {
      const tagName = el.tagName.toLowerCase();
      const level = tagName.startsWith('h') ? parseInt(tagName[1]) : 
                    parseInt(el.getAttribute('aria-level') || '2');
      return {
        level,
        text: el.textContent?.trim() || '',
        selector: generateSelector(el),
        hasError: false,
      };
    });
    
    // Convert landmark elements to serializable format
    const landmarks = landmarkElements.map(el => {
      const role = el.getAttribute('role') || 
                   getLandmarkRole(el.tagName.toLowerCase());
      return {
        role,
        label: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '',
        selector: generateSelector(el),
      };
    });
    
    dispatchCustomEvent('outlineData', { headings, landmarks });
  });
  cleanupFunctions.push(cleanup6);
  
  // Helper to get implicit landmark role from tag name
  const getLandmarkRole = (tagName: string): string => {
    const roles: Record<string, string> = {
      header: 'banner',
      nav: 'navigation',
      main: 'main',
      aside: 'complementary',
      footer: 'contentinfo',
      search: 'search',
      form: 'form',
    };
    return roles[tagName] || tagName;
  };
  
  // Helper to generate a CSS selector for an element
  const generateSelector = (el: Element): string => {
    if (el.id) return `#${el.id}`;
    const tagName = el.tagName.toLowerCase();
    const className = el.className && typeof el.className === 'string' 
      ? '.' + el.className.trim().split(/\s+/).join('.') 
      : '';
    return tagName + className;
  };

  const cleanup7 = listenForCustomEvent<{ enabled: boolean }>('desaturatePage', data => {
    if (isCleanedUp) return;
    document.body.style.filter = data.enabled ? 'grayscale(100%)' : '';
  });
  cleanupFunctions.push(cleanup7);

  // Handle compliance report request
  const cleanup8 = listenForCustomEvent<{ level: string }>('getComplianceReport', data => {
    if (isCleanedUp || !results) return;
    
    // Import compliance checker dynamically
    import('../utils/compliance-checker').then(({ generateComplianceReport }) => {
      const level = (data.level || 'AA') as 'A' | 'AA' | 'AAA';
      const report = generateComplianceReport(results!, level);
      dispatchCustomEvent('complianceData', report);
    }).catch(err => {
      console.error('TheWCAG: Failed to generate compliance report:', err);
    });
  });
  cleanupFunctions.push(cleanup8);

  // Handle screen reader preview request
  const cleanup9 = listenForCustomEvent('getScreenReaderPreview', () => {
    if (isCleanedUp) return;
    
    // Import screen reader simulator dynamically
    import('../utils/screen-reader-simulator').then(({ generateFullPreview }) => {
      const outputs = generateFullPreview();
      dispatchCustomEvent('screenReaderData', outputs);
    }).catch(err => {
      console.error('TheWCAG: Failed to generate screen reader preview:', err);
    });
  });
  cleanupFunctions.push(cleanup9);
};

// Evaluation
const startEvaluation = async (): Promise<void> => {
  if (isCleanedUp) return;
  
  try {
    console.log('TheWCAG: Starting evaluation...');
    createSidebar();

    const evalResults = await evaluatePage(document);
    console.log('TheWCAG: Evaluation complete');
    
    if (isCleanedUp) return; // Check again after async operation
    
    const contrastErrors = evalResults.categories.contrast?.length || 0;

    // Create serializable versions of rule results (DOM elements can't be serialized to JSON)
    const serializeResults = (items: RuleResult[]): RuleResult[] => 
      items.map(item => ({
        ruleId: item.ruleId,
        category: item.category,
        selector: item.selector,
        xpath: item.xpath,
        message: item.message,
        impact: item.impact,
        data: item.data,
        element: null as unknown as Element, // Placeholder - element can't be serialized
      }));

    results = {
      success: true,
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
      categories: {
        error: serializeResults(evalResults.categories.error || []),
        alert: serializeResults(evalResults.categories.alert || []),
        feature: serializeResults(evalResults.categories.feature || []),
        structure: serializeResults(evalResults.categories.structure || []),
        aria: serializeResults(evalResults.categories.aria || []),
        contrast: serializeResults(evalResults.categories.contrast || []),
      },
      statistics: {
        totalElements: evalResults.statistics.totalElements,
        pageTitle: evalResults.statistics.pageTitle,
        errors: evalResults.statistics.errors,
        alerts: evalResults.statistics.alerts,
        features: evalResults.statistics.features,
        structure: evalResults.statistics.structure,
        aria: evalResults.statistics.aria,
        contrast: evalResults.statistics.contrast,
        totalIssues: evalResults.statistics.errors + evalResults.statistics.alerts,
      },
      summary: {
        errors: evalResults.statistics.errors,
        alerts: evalResults.statistics.alerts,
        features: evalResults.statistics.features,
        structure: evalResults.statistics.structure,
        aria: evalResults.statistics.aria,
        contrastErrors,
      },
      aimScore: calculateAimScore(evalResults.statistics.errors, evalResults.statistics.alerts),
    };

    console.log('TheWCAG: Dispatching results with summary:', results?.summary);
    dispatchCustomEvent('evaluationResults', results);

    if (iconsVisible && !isCleanedUp) {
      injectIcons();
    }
  } catch (error) {
    console.error('TheWCAG: Evaluation error', error);
  }
};

// Initialize
const init = (): void => {
  if (isInitialized || isCleanedUp) return;
  isInitialized = true;

  let urlReceived = false;
  
  const cleanup = listenForCustomEvent<string>('setExtensionUrl', url => {
    if (isCleanedUp || urlReceived) return;
    urlReceived = true;
    extensionUrl = url;
    startEvaluation();
  });
  cleanupFunctions.push(cleanup);

  // Request extension URL with retries
  const requestUrl = (retries: number): void => {
    if (urlReceived || isCleanedUp || retries <= 0) return;
    dispatchCustomEvent('getExtensionUrl', {});
    setTimeout(() => requestUrl(retries - 1), 100);
  };
  
  requestUrl(10); // Try up to 10 times with 100ms delay

  setupMessageListeners();
};

// Prevent multiple injections
if (!(window as unknown as { __THEWCAG_ANALYZER__: boolean }).__THEWCAG_ANALYZER__) {
  (window as unknown as { __THEWCAG_ANALYZER__: boolean }).__THEWCAG_ANALYZER__ = true;
  init();
}
