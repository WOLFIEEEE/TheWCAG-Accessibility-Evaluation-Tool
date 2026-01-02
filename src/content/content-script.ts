// ============================================
// TheWCAG Evaluation Extension - Content Script
// ============================================

import { MessageAction } from '../types';
import { dispatchCustomEvent, isContextValid } from '../utils/messaging';

// Configuration
const config = {
  debug: false,
  extensionUrl: '',
  platform: 'extension',
  browser: 'chrome',
};

// Port Management
let serviceWorkerPort: chrome.runtime.Port | null = null;
let isInitialized = false;
let isContextInvalidated = false;

// Check if context is still valid
const checkContext = (): boolean => {
  if (isContextInvalidated) return false;
  if (!isContextValid()) {
    isContextInvalidated = true;
    cleanup();
    return false;
  }
  return true;
};

// Cleanup function for when context is invalidated
const cleanup = (): void => {
  try {
    serviceWorkerPort?.disconnect();
  } catch {
    // Ignore
  }
  serviceWorkerPort = null;
};

const connectToServiceWorker = (): void => {
  if (!checkContext()) return;
  
  try {
    if (serviceWorkerPort) {
      try {
        serviceWorkerPort.disconnect();
      } catch {
        // Ignore
      }
      serviceWorkerPort = null;
    }

    // Wake service worker before connecting
    chrome.runtime.sendMessage({ type: 'WAKE' }, () => void chrome.runtime.lastError);

    serviceWorkerPort = chrome.runtime.connect({ name: 'contentToServiceWorker' });

    serviceWorkerPort.onMessage.addListener(message => {
      if (!checkContext()) return;
      if (message?.name === 'serviceWorkerToContent') {
        handleServiceWorkerMessage(message.action, message.data);
      }
    });

    serviceWorkerPort.onDisconnect.addListener(() => {
      void chrome.runtime.lastError;
      serviceWorkerPort = null;
    });
  } catch {
    serviceWorkerPort = null;
  }
};

const wakeServiceWorker = async (): Promise<void> => {
  if (!checkContext()) return;
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage({ type: 'WAKE' }, () => {
        void chrome.runtime.lastError;
        resolve();
      });
    } catch {
      resolve();
    }
  });
};

const sendToServiceWorker = async (action: MessageAction, data: unknown): Promise<void> => {
  if (!checkContext()) return;
  
  const tryPost = (): boolean => {
    if (!checkContext()) return false;
    if (!serviceWorkerPort) {
      connectToServiceWorker();
    }
    if (!serviceWorkerPort) return false;

    try {
      serviceWorkerPort.postMessage({ action, data });
      return true;
    } catch {
      serviceWorkerPort = null;
      return false;
    }
  };

  // Fast path
  if (tryPost()) return;

  // Wake + reconnect + retry
  await wakeServiceWorker();
  if (!checkContext()) return;
  connectToServiceWorker();
  if (tryPost()) return;

  // Final fallback - one-off message
  if (!checkContext()) return;
  try {
    await new Promise<void>(resolve => {
      chrome.runtime.sendMessage({ name: 'contentToServiceWorker', action, data }, () => {
        void chrome.runtime.lastError;
        resolve();
      });
    });
  } catch {
    if (config.debug) {
      console.error('Failed to send message to service worker');
    }
  }
};

// Message Handling
const handleServiceWorkerMessage = (action: MessageAction, data: unknown): void => {
  // Handle inspect element action
  if (action === 'inspectElement') {
    const selector = (data as { selector: string })?.selector;
    if (selector) {
      inspectElement(selector);
    }
    return;
  }

  // Handle getComplianceReport - generate compliance data
  if (action === 'getComplianceReport') {
    // Request stored results from analyzer and generate compliance report
    dispatchCustomEvent('getComplianceReport', data);
    return;
  }

  // Handle getScreenReaderPreview - generate screen reader preview
  if (action === 'getScreenReaderPreview') {
    dispatchCustomEvent('getScreenReaderPreview', data);
    return;
  }
  
  // Dispatch as custom event for the injected script
  dispatchCustomEvent(action, data);
};

// Inspect element in DevTools
const inspectElement = (selector: string): void => {
  try {
    const element = document.querySelector(selector);
    if (element) {
      // Store in global variable for DevTools access
      (window as unknown as { $wcag: Element }).$wcag = element;
      
      // Log to console with styled output
      console.log(
        '%c[TheWCAG] Element ready for inspection:',
        'background: #A85A3B; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );
      console.log('%cSelector: ' + selector, 'color: #666;');
      console.log('%cType inspect($wcag) to inspect in Elements panel', 'color: #4FC3F7; font-style: italic;');
      console.log(element);
      
      // Highlight the element visually
      const originalOutline = (element as HTMLElement).style.outline;
      const originalOutlineOffset = (element as HTMLElement).style.outlineOffset;
      (element as HTMLElement).style.outline = '3px solid #A85A3B';
      (element as HTMLElement).style.outlineOffset = '2px';
      
      // Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        (element as HTMLElement).style.outline = originalOutline;
        (element as HTMLElement).style.outlineOffset = originalOutlineOffset;
      }, 3000);
    } else {
      console.warn('[TheWCAG] Element not found:', selector);
      console.log('%cThe element may be hidden or removed from the DOM', 'color: #E6994D;');
    }
  } catch (e) {
    console.error('[TheWCAG] Error inspecting element:', e);
  }
};

// Parse event data helper
const parseEventData = (event: CustomEvent): unknown => {
  if (!event.detail) return undefined;
  if (typeof event.detail === 'string') {
    try {
      return JSON.parse(event.detail);
    } catch {
      return event.detail;
    }
  }
  return event.detail;
};

// Event Listeners (from page context)
const setupEventListeners = (): void => {
  // Get extension URL
  document.addEventListener('getExtensionUrl', () => {
    if (!checkContext()) return;
    try {
      const extensionUrl = chrome.runtime.getURL('');
      config.extensionUrl = extensionUrl;
      console.log('TheWCAG: Extension URL requested, responding with:', extensionUrl);
      dispatchCustomEvent('setExtensionUrl', extensionUrl);
      sendToServiceWorker('setExtensionUrl', extensionUrl);
    } catch {
      // Context invalidated
    }
  });

  // Evaluation results
  document.addEventListener('evaluationResults', ((event: CustomEvent) => {
    if (!checkContext()) return;
    const data = parseEventData(event);
    console.log('TheWCAG: Evaluation results received:', data);
    console.log('TheWCAG: Has summary?', !!(data as any)?.summary);
    sendToServiceWorker('evaluationResults', data);
  }) as EventListener);

  // Outline data
  document.addEventListener('outlineData', ((event: CustomEvent) => {
    if (!checkContext()) return;
    const data = parseEventData(event);
    sendToServiceWorker('outlineData', data);
  }) as EventListener);

  // Navigation data
  document.addEventListener('navigationData', ((event: CustomEvent) => {
    if (!checkContext()) return;
    const data = parseEventData(event);
    sendToServiceWorker('navigationData', data);
  }) as EventListener);

  // Contrast data
  document.addEventListener('contrastData', ((event: CustomEvent) => {
    if (!checkContext()) return;
    const data = parseEventData(event);
    sendToServiceWorker('contrastData', data);
  }) as EventListener);

  // Tooltip
  document.addEventListener('showTooltip', ((event: CustomEvent) => {
    if (!checkContext()) return;
    const data = parseEventData(event);
    sendToServiceWorker('showTooltip', data);
  }) as EventListener);

  // Compliance data
  document.addEventListener('complianceData', ((event: CustomEvent) => {
    if (!checkContext()) return;
    const data = parseEventData(event);
    sendToServiceWorker('complianceData', data);
  }) as EventListener);

  // Screen reader preview data
  document.addEventListener('screenReaderData', ((event: CustomEvent) => {
    if (!checkContext()) return;
    const data = parseEventData(event);
    sendToServiceWorker('screenReaderData', data);
  }) as EventListener);
};

// Service Worker Message Listener
const setupServiceWorkerListener = (): void => {
  if (!checkContext()) return;
  try {
    chrome.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(message => {
        if (!checkContext()) return;
        if (message?.name === 'serviceWorkerToContent') {
          handleServiceWorkerMessage(message.action, message.data);
        }
      });

      port.onDisconnect.addListener(() => {
        void chrome.runtime.lastError;
      });
    });
  } catch {
    // Context invalidated
  }
};

// Cleanup on navigation
const setupCleanup = (): void => {
  window.addEventListener('pagehide', () => {
    try {
      serviceWorkerPort?.disconnect();
    } catch {
      // Ignore
    }
    serviceWorkerPort = null;
  });
};

// Initialize
const init = (): void => {
  if (isInitialized) return;
  if (!checkContext()) return;
  isInitialized = true;

  connectToServiceWorker();
  setupEventListeners();
  setupServiceWorkerListener();
  setupCleanup();

  if (config.debug) {
    console.log('TheWCAG Content Script initialized');
  }
};

// Prevent multiple initializations
if (!(window as unknown as { __THEWCAG_CONTENT_SCRIPT__: boolean }).__THEWCAG_CONTENT_SCRIPT__) {
  (window as unknown as { __THEWCAG_CONTENT_SCRIPT__: boolean }).__THEWCAG_CONTENT_SCRIPT__ = true;
  init();
}

// Handle ping from service worker
try {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!checkContext()) {
      sendResponse({ ok: false });
      return;
    }
    if (msg?.type === 'PING') {
      sendResponse({ ok: true });
    }
  });
} catch {
  // Context invalidated during setup
}
