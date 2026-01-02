// ============================================
// TheWCAG Evaluation Extension - Service Worker
// ============================================

import { ExtensionState, MessageAction } from '../types';
import { safeConnect, safePostMessage, ensureContentScript } from '../utils/messaging';

// Extension state
const state: ExtensionState = {
  activeTabs: new Set(),
  injectedTabs: new Set(),
  sidebarLoadedTabs: new Set(),
};

// Icon paths
const ICONS = {
  active: {
    16: 'assets/icons/icon16.png',
    32: 'assets/icons/icon32.png',
    64: 'assets/icons/icon64.png',
  },
  inactive: {
    16: 'assets/icons/icon16-inactive.png',
    32: 'assets/icons/icon32-inactive.png',
    64: 'assets/icons/icon64-inactive.png',
  },
};

// ============================================
// Keep Service Worker Alive
// ============================================
const keepAlive = () => setInterval(() => chrome.runtime.getPlatformInfo(), 25000);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

// ============================================
// Tab State Management
// ============================================
function isTabActive(tabId: number): boolean {
  return state.activeTabs.has(tabId);
}

function setTabActive(tabId: number): void {
  state.activeTabs.add(tabId);
}

function setTabInactive(tabId: number): void {
  state.activeTabs.delete(tabId);
  state.injectedTabs.delete(tabId);
  state.sidebarLoadedTabs.delete(tabId);
}

function setSidebarLoaded(tabId: number): void {
  state.sidebarLoadedTabs.add(tabId);
}

function isSidebarLoaded(tabId: number): boolean {
  return state.sidebarLoadedTabs.has(tabId);
}

// ============================================
// Icon Management
// ============================================
async function updateIcon(tabId: number): Promise<void> {
  const isActive = isTabActive(tabId);
  try {
    await chrome.action.setIcon({
      tabId,
      path: isActive ? ICONS.active : ICONS.inactive,
    });
  } catch {
    // Tab may no longer exist
  }
}

// ============================================
// Run Evaluation
// ============================================
async function runEvaluation(tabId: number, tabUrl: string): Promise<void> {
  // Don't run on chrome:// pages
  if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://')) {
    return;
  }

  if (isTabActive(tabId)) {
    // Already active - reset
    await resetEvaluation(tabId);
  } else {
    // Ensure content script is injected
    await ensureContentScript(tabId);
    state.injectedTabs.add(tabId);

    // Inject analyzer script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['inject/analyzer.js'],
    });

    setTabActive(tabId);
    await updateIcon(tabId);
  }
}

async function resetEvaluation(tabId: number): Promise<void> {
  sendToContentScript(tabId, 'resetEvaluation', {});
  setTabInactive(tabId);
  await updateIcon(tabId);
}

// ============================================
// Messaging
// ============================================
function sendToContentScript(tabId: number, action: MessageAction, data: unknown): void {
  const port = safeConnect(tabId, 'serviceWorkerToContent');
  if (port) {
    safePostMessage(port, { name: 'serviceWorkerToContent', action, data });
  }
}

function sendToSidebar(tabId: number, action: MessageAction, data: unknown): void {
  const port = safeConnect(tabId, 'serviceWorkerToSidebar');
  if (port) {
    safePostMessage(port, { name: 'serviceWorkerToSidebar', action, data, tabId });
  }
}

function sendToSidebarWhenReady(tabId: number, action: MessageAction, data: unknown): void {
  if (!isSidebarLoaded(tabId)) {
    // Retry after 100ms
    setTimeout(() => sendToSidebarWhenReady(tabId, action, data), 100);
    return;
  }
  sendToSidebar(tabId, action, data);
}

// ============================================
// Event Listeners
// ============================================

// Extension icon clicked
chrome.action.onClicked.addListener(async tab => {
  if (!tab?.id) return;
  if (tab?.url?.startsWith('chrome://')) return;

  const tabUrl = tab.url || '';
  await runEvaluation(tab.id, tabUrl);
});

// Message handling
chrome.runtime.onConnect.addListener(port => {
  const tabId = port.sender?.tab?.id;
  let isAlive = true;

  const handleDisconnect = () => {
    void chrome.runtime.lastError;
    isAlive = false;
  };

  const handleMessage = (message: { action: MessageAction; data: unknown }) => {
    if (!isAlive || tabId === undefined) return;

    if (port.name === 'contentToServiceWorker') {
      switch (message.action) {
        case 'setExtensionUrl':
        case 'evaluationResults':
          sendToSidebarWhenReady(tabId, message.action, message.data);
          break;

        case 'outlineData':
        case 'navigationData':
        case 'contrastData':
        case 'showTooltip':
          sendToSidebar(tabId, message.action, message.data);
          break;
      }
    } else if (port.name === 'sidebarToServiceWorker') {
      switch (message.action) {
        case 'sidebarLoaded':
          setSidebarLoaded(tabId);
          sendToContentScript(tabId, message.action, message.data);
          break;

        default:
          sendToContentScript(tabId, message.action, message.data);
          break;
      }
    }
  };

  port.onDisconnect.addListener(handleDisconnect);
  port.onMessage.addListener(handleMessage);
});

// Handle ping for content script detection
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'WAKE' || message?.type === 'PING') {
    sendResponse({ ok: true });
  }
  return true;
});

// Navigation handling
chrome.webNavigation.onBeforeNavigate.addListener(details => {
  if (details.frameId !== 0) return;
  setTabInactive(details.tabId);
  updateIcon(details.tabId);
});

chrome.webNavigation.onCommitted.addListener(details => {
  if (details.frameId !== 0) return;
  if (details.transitionQualifiers?.includes('forward_back')) {
    setTabInactive(details.tabId);
    updateIcon(details.tabId);
  }
});

chrome.webNavigation.onTabReplaced.addListener(({ replacedTabId }) => {
  setTabInactive(replacedTabId);
  updateIcon(replacedTabId);
});

// Tab updates
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === 'loading') {
    setTabInactive(tabId);
    updateIcon(tabId);
  }
});

// Tab closed
chrome.tabs.onRemoved.addListener(tabId => {
  setTabInactive(tabId);
});

// Tab activated
chrome.tabs.onActivated.addListener(({ tabId }) => {
  updateIcon(tabId);
});

// Window focus changed
chrome.windows.onFocusChanged.addListener(async windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  const [activeTab] = await chrome.tabs.query({ active: true, windowId }).catch(() => []);
  if (activeTab?.id) {
    updateIcon(activeTab.id);
  }
});

// ============================================
// Context Menu
// ============================================
chrome.contextMenus.create(
  {
    id: 'run-thewcag',
    title: 'Evaluate this page with TheWCAG',
  },
  () => void chrome.runtime.lastError
);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'run-thewcag' && tab?.id) {
    const tabUrl = tab.url || '';
    runEvaluation(tab.id, tabUrl);
  }
});

// ============================================
// Keyboard Shortcut
// ============================================
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'toggle-extension' && tab?.id) {
    const tabUrl = tab.url || '';
    runEvaluation(tab.id, tabUrl);
  }
});

// Log startup
console.log('TheWCAG Evaluation Extension - Service Worker Started');
