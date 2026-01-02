// ============================================
// TheWCAG Evaluation Extension - Messaging Utilities
// ============================================

import { Message, MessageAction, PortMessage } from '../types';

/**
 * Safe port connection with error handling
 */
export function safeConnect(tabId: number, name: string): chrome.runtime.Port | null {
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
  if (!port) return false;

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
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure content script is injected
 */
export async function ensureContentScript(tabId: number): Promise<void> {
  const isActive = await pingContentScript(tabId);
  if (isActive) return;

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content/content-script.js'],
  });
}
