// ============================================
// TheWCAG Evaluation Extension - Test Setup
// Jest test environment setup
// ============================================

import '@testing-library/jest-dom';

// Mock Chrome API
const mockChrome = {
  runtime: {
    id: 'test-extension-id',
    getURL: (path: string) => `chrome-extension://test-extension-id/${path}`,
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    onConnect: {
      addListener: jest.fn(),
    },
    connect: jest.fn(() => ({
      postMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
      },
      onDisconnect: {
        addListener: jest.fn(),
      },
    })),
    lastError: null,
  },
  tabs: {
    sendMessage: jest.fn(),
    connect: jest.fn(() => ({
      postMessage: jest.fn(),
      onMessage: { addListener: jest.fn() },
      onDisconnect: { addListener: jest.fn() },
    })),
    query: jest.fn().mockResolvedValue([]),
  },
  action: {
    setIcon: jest.fn(),
  },
  scripting: {
    executeScript: jest.fn().mockResolvedValue([]),
  },
  i18n: {
    getMessage: jest.fn((key: string) => key),
    getUILanguage: jest.fn(() => 'en'),
    getAcceptLanguages: jest.fn(() => Promise.resolve(['en'])),
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
    },
    sync: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
    },
  },
};

(global as unknown as { chrome: typeof mockChrome }).chrome = mockChrome;

// Mock MutationObserver
class MockMutationObserver {
  callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
  }

  observe = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}

global.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock getComputedStyle for elements without styles
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element: Element, pseudoElt?: string | null) => {
  try {
    return originalGetComputedStyle(element, pseudoElt);
  } catch {
    // Return mock computed style
    return {
      display: 'block',
      visibility: 'visible',
      opacity: '1',
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      fontSize: '16px',
      fontWeight: '400',
      outline: 'none',
      outlineStyle: 'none',
      outlineWidth: '0px',
      cursor: 'default',
      animationName: 'none',
      animationDuration: '0s',
      animationIterationCount: '1',
      transitionDuration: '0s',
      flexDirection: 'row',
      order: '0',
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration;
  }
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});

// Suppress console errors during tests (optional)
// console.error = jest.fn();
// console.warn = jest.fn();

export { mockChrome };

