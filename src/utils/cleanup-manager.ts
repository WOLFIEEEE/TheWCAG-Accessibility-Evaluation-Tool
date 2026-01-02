// ============================================
// TheWCAG Evaluation Extension - Cleanup Manager
// Memory management and resource cleanup
// ============================================

type CleanupFunction = () => void;

/**
 * Manages cleanup of resources to prevent memory leaks
 */
class CleanupManager {
  private elements: Set<Element> = new Set();
  private listeners: Map<EventTarget, Map<string, EventListener[]>> = new Map();
  private observers: Set<MutationObserver> = new Set();
  private intervals: Set<number> = new Set();
  private timeouts: Set<number> = new Set();
  private cleanupFunctions: Set<CleanupFunction> = new Set();
  private isCleanedUp = false;

  /**
   * Register an element for cleanup
   */
  registerElement(element: Element): void {
    if (this.isCleanedUp) return;
    this.elements.add(element);
  }

  /**
   * Register an event listener for cleanup
   */
  registerListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    if (this.isCleanedUp) return;

    // Add the listener
    target.addEventListener(event, listener, options);

    // Track for cleanup
    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Map());
    }
    const targetListeners = this.listeners.get(target)!;
    if (!targetListeners.has(event)) {
      targetListeners.set(event, []);
    }
    targetListeners.get(event)!.push(listener);
  }

  /**
   * Register a MutationObserver for cleanup
   */
  registerObserver(observer: MutationObserver): void {
    if (this.isCleanedUp) return;
    this.observers.add(observer);
  }

  /**
   * Register an interval for cleanup
   */
  registerInterval(id: number): void {
    if (this.isCleanedUp) {
      clearInterval(id);
      return;
    }
    this.intervals.add(id);
  }

  /**
   * Register a timeout for cleanup
   */
  registerTimeout(id: number): void {
    if (this.isCleanedUp) {
      clearTimeout(id);
      return;
    }
    this.timeouts.add(id);
  }

  /**
   * Register a custom cleanup function
   */
  registerCleanup(fn: CleanupFunction): void {
    if (this.isCleanedUp) return;
    this.cleanupFunctions.add(fn);
  }

  /**
   * Create a managed interval
   */
  setInterval(callback: () => void, ms: number): number {
    const id = window.setInterval(callback, ms);
    this.registerInterval(id);
    return id;
  }

  /**
   * Create a managed timeout
   */
  setTimeout(callback: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.timeouts.delete(id);
      callback();
    }, ms);
    this.registerTimeout(id);
    return id;
  }

  /**
   * Clear a specific interval
   */
  clearInterval(id: number): void {
    clearInterval(id);
    this.intervals.delete(id);
  }

  /**
   * Clear a specific timeout
   */
  clearTimeout(id: number): void {
    clearTimeout(id);
    this.timeouts.delete(id);
  }

  /**
   * Perform full cleanup of all registered resources
   */
  cleanup(): void {
    if (this.isCleanedUp) return;
    this.isCleanedUp = true;

    // Remove all elements
    this.elements.forEach((element) => {
      try {
        element.remove();
      } catch {
        // Element may already be removed
      }
    });
    this.elements.clear();

    // Remove all event listeners
    this.listeners.forEach((events, target) => {
      events.forEach((listeners, event) => {
        listeners.forEach((listener) => {
          try {
            target.removeEventListener(event, listener);
          } catch {
            // Target may no longer exist
          }
        });
      });
    });
    this.listeners.clear();

    // Disconnect all observers
    this.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch {
        // Observer may already be disconnected
      }
    });
    this.observers.clear();

    // Clear all intervals
    this.intervals.forEach((id) => {
      clearInterval(id);
    });
    this.intervals.clear();

    // Clear all timeouts
    this.timeouts.forEach((id) => {
      clearTimeout(id);
    });
    this.timeouts.clear();

    // Run custom cleanup functions
    this.cleanupFunctions.forEach((fn) => {
      try {
        fn();
      } catch {
        // Ignore cleanup errors
      }
    });
    this.cleanupFunctions.clear();
  }

  /**
   * Check if cleanup has been performed
   */
  isCleanup(): boolean {
    return this.isCleanedUp;
  }

  /**
   * Reset the manager (for reuse after cleanup)
   */
  reset(): void {
    this.cleanup();
    this.isCleanedUp = false;
  }

  /**
   * Get statistics about tracked resources
   */
  getStats(): {
    elements: number;
    listeners: number;
    observers: number;
    intervals: number;
    timeouts: number;
    cleanupFunctions: number;
  } {
    let listenerCount = 0;
    this.listeners.forEach((events) => {
      events.forEach((listeners) => {
        listenerCount += listeners.length;
      });
    });

    return {
      elements: this.elements.size,
      listeners: listenerCount,
      observers: this.observers.size,
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
      cleanupFunctions: this.cleanupFunctions.size,
    };
  }
}

// Singleton instance for global use
export const cleanupManager = new CleanupManager();

// Create a new manager for isolated contexts
export function createCleanupManager(): CleanupManager {
  return new CleanupManager();
}

/**
 * Decorator to wrap a function with cleanup registration
 */
export function withCleanup(manager: CleanupManager) {
  return function <T extends (...args: unknown[]) => unknown>(
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      if (manager.isCleanup()) return;
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}

export default CleanupManager;

