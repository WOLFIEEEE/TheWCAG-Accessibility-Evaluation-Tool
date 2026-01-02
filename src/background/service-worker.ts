// ============================================
// TheWCAG Evaluation Extension - Service Worker
// ============================================

import { ExtensionState, MessageAction, ExtensionSettings, WcagLevel } from '../types';
import { safeConnect, safePostMessage, ensureContentScript, isContextValid } from '../utils/messaging';
import { loadSettings, saveSettings } from '../utils/settings-manager';
import { generateComplianceReport } from '../utils/compliance-checker';
import { getQuickFix } from '../data/quick-fixes';

// Extension state
const state: ExtensionState = {
  activeTabs: new Set(),
  injectedTabs: new Set(),
  sidebarLoadedTabs: new Set(),
};

// Track tabs expecting sidebar connections (for matching sidebar ports to tabs)
const pendingSidebarTabs: number[] = [];
const sidebarPorts: Map<number, chrome.runtime.Port> = new Map();

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
  if (!isContextValid()) return;
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
  if (!isContextValid()) return;
  
  // Don't run on chrome:// pages
  if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://')) {
    return;
  }

  try {
    if (isTabActive(tabId)) {
      // Already active - reset
      await resetEvaluation(tabId);
    } else {
      // Ensure content script is injected
      await ensureContentScript(tabId);
      state.injectedTabs.add(tabId);

      // Track this tab as expecting a sidebar connection
      pendingSidebarTabs.push(tabId);

      // Inject analyzer script
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['inject/analyzer.js'],
      });

      setTabActive(tabId);
      await updateIcon(tabId);
    }
  } catch (error) {
    console.error('TheWCAG: Error running evaluation', error);
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
  // Use the stored sidebar port (sidebar is an extension iframe, can't use tabs.connect)
  const storedPort = sidebarPorts.get(tabId);
  if (storedPort) {
    try {
      storedPort.postMessage({ name: 'serviceWorkerToSidebar', action, data, tabId });
      console.log('TheWCAG: Sent to sidebar:', action);
      return;
    } catch (e) {
      console.error('TheWCAG: Failed to send to sidebar:', e);
      // Port disconnected, remove it
      sidebarPorts.delete(tabId);
    }
  } else {
    console.warn('TheWCAG: No sidebar port for tab', tabId);
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
// Setup Event Listeners
// ============================================
function setupEventListeners(): void {
  // Extension icon clicked
  chrome.action.onClicked.addListener(async tab => {
    if (!tab?.id) return;
    if (tab?.url?.startsWith('chrome://')) return;

    const tabUrl = tab.url || '';
    await runEvaluation(tab.id, tabUrl);
  });

  // Message handling
  chrome.runtime.onConnect.addListener(port => {
    let resolvedTabId = port.sender?.tab?.id;
    let isAlive = true;

    // For sidebar connections, match to a pending tab or use sender tab
    if (port.name === 'sidebarToServiceWorker') {
      // If we don't have a tab ID from sender, get from pending list
      if (resolvedTabId === undefined && pendingSidebarTabs.length > 0) {
        resolvedTabId = pendingSidebarTabs.shift();
      }
      // Store the sidebar port for direct communication
      if (resolvedTabId !== undefined) {
        sidebarPorts.set(resolvedTabId, port);
        console.log('TheWCAG: Sidebar connected for tab', resolvedTabId);
      }
    }

    const handleDisconnect = () => {
      void chrome.runtime.lastError;
      isAlive = false;
      if (resolvedTabId !== undefined) {
        sidebarPorts.delete(resolvedTabId);
      }
    };

    const handleMessage = (message: { action: MessageAction; data: unknown }) => {
      if (!isAlive || resolvedTabId === undefined) return;

      if (port.name === 'contentToServiceWorker') {
        switch (message.action) {
          case 'setExtensionUrl':
          case 'evaluationResults':
            sendToSidebarWhenReady(resolvedTabId, message.action, message.data);
            break;

          case 'outlineData':
          case 'navigationData':
          case 'contrastData':
          case 'showTooltip':
          case 'complianceData':
          case 'screenReaderData':
            sendToSidebar(resolvedTabId, message.action, message.data);
            break;
        }
      } else if (port.name === 'sidebarToServiceWorker') {
        switch (message.action) {
          case 'sidebarLoaded':
            setSidebarLoaded(resolvedTabId);
            sendToContentScript(resolvedTabId, message.action, message.data);
            break;

          case 'getSettings':
            handleGetSettings(resolvedTabId);
            break;

          case 'saveSettings':
            handleSaveSettings(resolvedTabId, message.data as ExtensionSettings);
            break;

          case 'getComplianceReport':
            // Forward to content script, which will send back compliance data
            sendToContentScript(resolvedTabId, message.action, message.data);
            break;

          case 'getScreenReaderPreview':
            // Forward to content script
            sendToContentScript(resolvedTabId, message.action, message.data);
            break;

          case 'getQuickFix':
            handleGetQuickFix(resolvedTabId, message.data as { ruleId: string; selector: string });
            break;

          default:
            sendToContentScript(resolvedTabId, message.action, message.data);
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
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, windowId });
      if (activeTab?.id) {
        updateIcon(activeTab.id);
      }
    } catch {
      // Ignore query errors
    }
  });

  // Context Menu
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

  // Keyboard Shortcut
  chrome.commands.onCommand.addListener((command, tab) => {
    if (command === 'toggle-extension' && tab?.id) {
      const tabUrl = tab.url || '';
      runEvaluation(tab.id, tabUrl);
    }
  });
}

// ============================================
// Feature Handlers
// ============================================
async function handleGetSettings(tabId: number): Promise<void> {
  try {
    const settings = await loadSettings();
    sendToSidebar(tabId, 'settingsData' as MessageAction, settings);
  } catch (error) {
    console.error('TheWCAG: Failed to load settings:', error);
  }
}

async function handleSaveSettings(tabId: number, settings: ExtensionSettings): Promise<void> {
  try {
    await saveSettings(settings);
    // Send back updated settings
    sendToSidebar(tabId, 'settingsData' as MessageAction, settings);
  } catch (error) {
    console.error('TheWCAG: Failed to save settings:', error);
  }
}

function handleGetQuickFix(tabId: number, data: { ruleId: string; selector: string }): void {
  const fix = getQuickFix(data.ruleId);
  if (fix) {
    sendToSidebar(tabId, 'quickFixData' as MessageAction, {
      fix,
      currentCode: `<!-- Element: ${data.selector} -->`,
      suggestedCode: fix.template,
    });
  }
}

// ============================================
// Keep Service Worker Alive
// ============================================
function startKeepAlive(): void {
  setInterval(() => {
    if (chrome?.runtime?.id) {
      chrome.runtime.getPlatformInfo().catch(() => {});
    }
  }, 25000);
}

// ============================================
// Initialize
// ============================================
function init(): void {
  try {
    setupEventListeners();
    startKeepAlive();
    console.log('TheWCAG Evaluation Extension - Service Worker Started');
  } catch (error) {
    console.error('TheWCAG: Service Worker initialization error', error);
  }
}

// Start the service worker
init();
