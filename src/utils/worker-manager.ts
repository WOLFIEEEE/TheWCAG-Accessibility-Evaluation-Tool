// ============================================
// TheWCAG Evaluation Extension - Worker Manager
// Manages web workers for background processing
// ============================================

interface PendingTask {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timeout?: ReturnType<typeof setTimeout>;
}

interface WorkerMessage {
  id: string;
  type: 'result' | 'error' | 'progress';
  data?: unknown;
  error?: string;
  progress?: number;
}

/**
 * WorkerManager handles communication with web workers
 */
export class WorkerManager {
  private worker: Worker | null = null;
  private pendingTasks: Map<string, PendingTask> = new Map();
  private taskIdCounter = 0;
  private workerUrl: string;
  private isTerminated = false;

  constructor(workerUrl: string) {
    this.workerUrl = workerUrl;
  }

  /**
   * Initialize the worker
   */
  private ensureWorker(): Worker {
    if (this.isTerminated) {
      throw new Error('WorkerManager has been terminated');
    }

    if (!this.worker) {
      this.worker = new Worker(this.workerUrl);
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);
    }

    return this.worker;
  }

  /**
   * Handle incoming messages from the worker
   */
  private handleMessage(event: MessageEvent<WorkerMessage>): void {
    const { id, type, data, error } = event.data;
    const pending = this.pendingTasks.get(id);

    if (!pending) return;

    // Clear timeout if set
    if (pending.timeout) {
      clearTimeout(pending.timeout);
    }

    this.pendingTasks.delete(id);

    if (type === 'error') {
      pending.reject(new Error(error || 'Worker error'));
    } else {
      pending.resolve(data);
    }
  }

  /**
   * Handle worker errors
   */
  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error.message);
    // Reject all pending tasks
    this.pendingTasks.forEach((pending, id) => {
      if (pending.timeout) {
        clearTimeout(pending.timeout);
      }
      pending.reject(new Error(`Worker error: ${error.message}`));
      this.pendingTasks.delete(id);
    });
  }

  /**
   * Send a task to the worker and get a promise for the result
   */
  async execute<T>(type: string, data: unknown, timeoutMs = 30000): Promise<T> {
    const worker = this.ensureWorker();
    const id = `task-${++this.taskIdCounter}`;

    return new Promise<T>((resolve, reject) => {
      const pending: PendingTask = {
        resolve: resolve as (value: unknown) => void,
        reject,
      };

      // Set timeout
      if (timeoutMs > 0) {
        pending.timeout = setTimeout(() => {
          this.pendingTasks.delete(id);
          reject(new Error('Worker task timeout'));
        }, timeoutMs);
      }

      this.pendingTasks.set(id, pending);

      worker.postMessage({ id, type, data });
    });
  }

  /**
   * Compute contrast ratios in batch
   */
  async computeContrastBatch(
    pairs: Array<{ foreground: string; background: string }>
  ): Promise<Array<{ ratio: number; passAA: boolean; passAAA: boolean }>> {
    return this.execute('computeContrast', pairs);
  }

  /**
   * Analyze heading structure
   */
  async analyzeStructure(
    headings: Array<{ level: number; text: string; index: number }>
  ): Promise<Array<{ type: string; message: string; index: number }>> {
    return this.execute('analyzeStructure', headings);
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      // Reject all pending tasks
      this.pendingTasks.forEach((pending) => {
        if (pending.timeout) {
          clearTimeout(pending.timeout);
        }
        pending.reject(new Error('Worker terminated'));
      });
      this.pendingTasks.clear();

      this.worker.terminate();
      this.worker = null;
    }
    this.isTerminated = true;
  }

  /**
   * Check if worker is available
   */
  isAvailable(): boolean {
    return !this.isTerminated && typeof Worker !== 'undefined';
  }
}

// Singleton instance for the evaluation worker
let evaluationWorker: WorkerManager | null = null;

/**
 * Get the evaluation worker instance
 */
export function getEvaluationWorker(): WorkerManager | null {
  if (typeof Worker === 'undefined') {
    return null; // Web Workers not supported
  }

  if (!evaluationWorker) {
    try {
      // Worker URL would be resolved by the bundler
      evaluationWorker = new WorkerManager(
        chrome.runtime.getURL('workers/evaluation-worker.js')
      );
    } catch {
      return null;
    }
  }

  return evaluationWorker;
}

/**
 * Terminate all workers
 */
export function terminateAllWorkers(): void {
  if (evaluationWorker) {
    evaluationWorker.terminate();
    evaluationWorker = null;
  }
}

export default WorkerManager;

