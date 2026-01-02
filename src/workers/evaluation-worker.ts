// ============================================
// TheWCAG Evaluation Extension - Evaluation Worker
// Offload heavy accessibility computations to a web worker
// ============================================

// Worker message types
interface WorkerRequest {
  id: string;
  type: 'evaluate' | 'computeContrast' | 'analyzeStructure';
  data: unknown;
}

interface WorkerResponse {
  id: string;
  type: 'result' | 'error' | 'progress';
  data?: unknown;
  error?: string;
  progress?: number;
}

// Contrast calculation utilities (moved to worker for performance)
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Batch contrast calculation
function computeContrastBatch(
  pairs: Array<{ foreground: string; background: string }>
): Array<{ ratio: number; passAA: boolean; passAAA: boolean }> {
  return pairs.map(({ foreground, background }) => {
    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    if (!fg || !bg) {
      return { ratio: 0, passAA: false, passAAA: false };
    }

    const ratio = getContrastRatio(fg, bg);
    return {
      ratio: Math.round(ratio * 100) / 100,
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7,
    };
  });
}

// Structure analysis
interface HeadingData {
  level: number;
  text: string;
  index: number;
}

function analyzeHeadingStructure(
  headings: HeadingData[]
): Array<{ type: string; message: string; index: number }> {
  const issues: Array<{ type: string; message: string; index: number }> = [];

  // Check for skipped heading levels
  let prevLevel = 0;
  headings.forEach((heading, index) => {
    if (heading.level > prevLevel + 1 && prevLevel !== 0) {
      issues.push({
        type: 'skipped_level',
        message: `Heading level skipped from H${prevLevel} to H${heading.level}`,
        index,
      });
    }
    prevLevel = heading.level;
  });

  // Check for empty headings
  headings.forEach((heading, index) => {
    if (!heading.text.trim()) {
      issues.push({
        type: 'empty_heading',
        message: `H${heading.level} heading is empty`,
        index,
      });
    }
  });

  // Check for single H1
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    issues.push({
      type: 'missing_h1',
      message: 'Page has no H1 heading',
      index: -1,
    });
  } else if (h1Count > 1) {
    issues.push({
      type: 'multiple_h1',
      message: `Page has ${h1Count} H1 headings (should have 1)`,
      index: -1,
    });
  }

  return issues;
}

// Main message handler
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, type, data } = event.data;

  try {
    let result: unknown;

    switch (type) {
      case 'computeContrast':
        result = computeContrastBatch(
          data as Array<{ foreground: string; background: string }>
        );
        break;

      case 'analyzeStructure':
        result = analyzeHeadingStructure(data as HeadingData[]);
        break;

      default:
        throw new Error(`Unknown worker task type: ${type}`);
    }

    const response: WorkerResponse = {
      id,
      type: 'result',
      data: result,
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(response);
  }
};

// Export for TypeScript
export {};

