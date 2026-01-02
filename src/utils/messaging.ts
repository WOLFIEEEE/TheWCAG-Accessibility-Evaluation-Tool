// ============================================
// TheWCAG Evaluation Extension - Messaging Utilities
// ============================================

import { Message, MessageAction, PortMessage } from '../types';

/**
 * Check if extension context is still valid
 * This prevents "Extension context invalidated" errors
 */
export function isContextValid(): boolean {
  try {
    return !!(chrome?.runtime?.id);
  } catch {
    return false;
  }
}

/**
 * Safe wrapper for chrome API calls
 */
export function safeChrome<T>(fn: () => T, fallback: T): T {
  if (!isContextValid()) return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * Safe port connection with error handling
 */
export function safeConnect(tabId: number, name: string): chrome.runtime.Port | null {
  if (!isContextValid()) return null;
  try {
    const port = chrome.tabs.connect(tabId, { name });
    port.onDisconnect.addListener(() => {
      // Consume lastError to prevent console warnings
      void chrome.runtime.lastError;
    });
    return port;
  } catch {
    return null;
  }
}

/**
 * Safe port message posting
 */
export function safePostMessage(port: chrome.runtime.Port | null, message: PortMessage): boolean {
  if (!port || !isContextValid()) return false;

  try {
    port.postMessage(message);
    return true;
  } catch {
    return false;
  }
}

/**
 * Send message to content script
 */
export async function sendToContentScript<T>(
  tabId: number,
  action: MessageAction,
  data?: T
): Promise<void> {
  const port = safeConnect(tabId, 'serviceWorkerToContent');
  if (port) {
    safePostMessage(port, { name: 'serviceWorkerToContent', action, data });
  }
}

/**
 * Send message to sidebar
 */
export async function sendToSidebar<T>(
  tabId: number,
  action: MessageAction,
  data?: T
): Promise<void> {
  const port = safeConnect(tabId, 'serviceWorkerToSidebar');
  if (port) {
    safePostMessage(port, { name: 'serviceWorkerToSidebar', action, data, tabId });
  }
}

/**
 * Wake service worker
 */
export async function wakeServiceWorker(): Promise<void> {
  if (!isContextValid()) return;
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
}

/**
 * Dispatch custom event on document
 */
export function dispatchCustomEvent<T>(eventName: string, data?: T): void {
  const eventData = {
    detail: data ? JSON.stringify(data) : undefined,
  };
  const event = new CustomEvent(eventName, eventData);
  document.dispatchEvent(event);
}

/**
 * Listen for custom event on document
 */
export function listenForCustomEvent<T>(
  eventName: string,
  callback: (data: T) => void
): () => void {
  const handler = (event: CustomEvent) => {
    let data: T;
    try {
      data = event.detail ? JSON.parse(event.detail) : undefined;
    } catch {
      data = event.detail;
    }
    callback(data);
  };

  document.addEventListener(eventName, handler as EventListener);

  return () => {
    document.removeEventListener(eventName, handler as EventListener);
  };
}

/**
 * Create message payload
 */
export function createMessage<T>(action: MessageAction, data?: T): Message<T> {
  return { action, data };
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
}

/**
 * Ping tab to check if content script is active
 */
export async function pingContentScript(tabId: number): Promise<boolean> {
  if (!isContextValid()) return false;
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure content script is injected and ready
 */
export async function ensureContentScript(tabId: number): Promise<void> {
  if (!isContextValid()) return;
  const isActive = await pingContentScript(tabId);
  if (isActive) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/content-script.js'],
    });
    
    // Wait for content script to initialize and verify it's ready
    let retries = 10;
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const ready = await pingContentScript(tabId);
      if (ready) return;
      retries--;
    }
  } catch {
    // Tab may not exist or scripting not allowed
  }
}
