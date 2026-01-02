// ============================================
// TheWCAG Evaluation Extension - Error Handler
// Global error handling and logging
// ============================================

export interface ErrorLog {
  timestamp: number;
  type: 'error' | 'warning' | 'info';
  source: 'content' | 'sidebar' | 'analyzer' | 'background';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

// Error storage (in-memory, limited size)
const MAX_ERRORS = 100;
const errorLogs: ErrorLog[] = [];

/**
 * Log an error to the internal log
 */
export function logError(
  source: ErrorLog['source'],
  error: Error | string,
  context?: Record<string, unknown>
): void {
  const log: ErrorLog = {
    timestamp: Date.now(),
    type: 'error',
    source,
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'object' ? error.stack : undefined,
    context,
  };

  errorLogs.push(log);
  if (errorLogs.length > MAX_ERRORS) {
    errorLogs.shift();
  }

  // Console output in development
  console.error(`[TheWCAG ${source}]`, log.message, context || '');
}

/**
 * Log a warning
 */
export function logWarning(
  source: ErrorLog['source'],
  message: string,
  context?: Record<string, unknown>
): void {
  const log: ErrorLog = {
    timestamp: Date.now(),
    type: 'warning',
    source,
    message,
    context,
  };

  errorLogs.push(log);
  if (errorLogs.length > MAX_ERRORS) {
    errorLogs.shift();
  }

  console.warn(`[TheWCAG ${source}]`, message, context || '');
}

/**
 * Log info
 */
export function logInfo(
  source: ErrorLog['source'],
  message: string,
  context?: Record<string, unknown>
): void {
  const log: ErrorLog = {
    timestamp: Date.now(),
    type: 'info',
    source,
    message,
    context,
  };

  errorLogs.push(log);
  if (errorLogs.length > MAX_ERRORS) {
    errorLogs.shift();
  }
}

/**
 * Get all error logs
 */
export function getErrorLogs(): ErrorLog[] {
  return [...errorLogs];
}

/**
 * Clear error logs
 */
export function clearErrorLogs(): void {
  errorLogs.length = 0;
}

/**
 * Setup global error handlers for a context
 */
export function setupGlobalErrorHandlers(source: ErrorLog['source']): void {
  // Global error handler
  if (typeof window !== 'undefined') {
    window.onerror = (message, _source, lineno, colno, error) => {
      logError(source, error || String(message), {
        line: lineno,
        column: colno,
      });
      return false; // Don't prevent default handling
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      logError(source, event.reason || 'Unhandled promise rejection', {
        type: 'unhandledrejection',
      });
    };
  }
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  source: ErrorLog['source'],
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(source, error as Error, { ...context, args });
      throw error;
    }
  }) as T;
}

/**
 * Safe execution wrapper - catches errors and returns null
 */
export function safeExecute<T>(
  fn: () => T,
  source: ErrorLog['source'],
  fallback: T | null = null
): T | null {
  try {
    return fn();
  } catch (error) {
    logError(source, error as Error);
    return fallback;
  }
}

/**
 * Safe async execution wrapper
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  source: ErrorLog['source'],
  fallback: T | null = null
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    logError(source, error as Error);
    return fallback;
  }
}

/**
 * Retry wrapper for async operations
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    source?: ErrorLog['source'];
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 100, backoff = 2, source = 'background' } = options;

  let lastError: Error | null = null;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logWarning(source, `Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= backoff;
      }
    }
  }

  throw lastError;
}

