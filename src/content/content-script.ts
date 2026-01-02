// ============================================
// TheWCAG Evaluation Extension - Content Script
// ============================================

import { MessageAction } from '../types';
import { dispatchCustomEvent } from '../utils/messaging';

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

const connectToServiceWorker = (): void => {
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
      if (message?.name === 'serviceWorkerToContent') {
        handleServiceWorkerMessage(message.action, message.data);
      }
    });

    serviceWorkerPort.onDisconnect.addListener(() => {
      serviceWorkerPort = null;
    });
  } catch {
    serviceWorkerPort = null;
  }
};

const wakeServiceWorker = async (): Promise<void> => {
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
  const tryPost = (): boolean => {
    if (!serviceWorkerPort) {
      connectToServiceWorker();
    }
    if (!serviceWorkerPort) return false;

    try {
      serviceWorkerPort.postMessage({ action, data });
      return true;
    } catch {
      return false;
    }
  };

  // Fast path
  if (tryPost()) return;

  // Wake + reconnect + retry
  await wakeServiceWorker();
  connectToServiceWorker();
  if (tryPost()) return;

  // Final fallback - one-off message
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
  // Dispatch as custom event for the injected script
  dispatchCustomEvent(action, data);
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
    const extensionUrl = chrome.runtime.getURL('');
    config.extensionUrl = extensionUrl;
    dispatchCustomEvent('setExtensionUrl', extensionUrl);
    sendToServiceWorker('setExtensionUrl', extensionUrl);
  });

  // Evaluation results
  document.addEventListener('evaluationResults', ((event: CustomEvent) => {
    const data = parseEventData(event);
    sendToServiceWorker('evaluationResults', data);
  }) as EventListener);

  // Outline data
  document.addEventListener('outlineData', ((event: CustomEvent) => {
    const data = parseEventData(event);
    sendToServiceWorker('outlineData', data);
  }) as EventListener);

  // Navigation data
  document.addEventListener('navigationData', ((event: CustomEvent) => {
    const data = parseEventData(event);
    sendToServiceWorker('navigationData', data);
  }) as EventListener);

  // Contrast data
  document.addEventListener('contrastData', ((event: CustomEvent) => {
    const data = parseEventData(event);
    sendToServiceWorker('contrastData', data);
  }) as EventListener);

  // Tooltip
  document.addEventListener('showTooltip', ((event: CustomEvent) => {
    const data = parseEventData(event);
    sendToServiceWorker('showTooltip', data);
  }) as EventListener);
};

// Service Worker Message Listener
const setupServiceWorkerListener = (): void => {
  chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener(message => {
      if (message?.name === 'serviceWorkerToContent') {
        handleServiceWorkerMessage(message.action, message.data);
      }
    });

    port.onDisconnect.addListener(() => {
      void chrome.runtime.lastError;
    });
  });
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
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'PING') {
    sendResponse({ ok: true });
  }
});
