// ============================================
// TheWCAG Evaluation Extension - Contrast Utilities
// Comprehensive color contrast calculation and validation
// WCAG 2.1 Level AA and AAA compliance checking
// ============================================

import { RgbColor, HslColor } from '../types';

/**
 * Named color mappings (CSS Level 1 + common web colors)
 */
const namedColors: Record<string, RgbColor> = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 128, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  cyan: { r: 0, g: 255, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  gray: { r: 128, g: 128, b: 128 },
  grey: { r: 128, g: 128, b: 128 },
  silver: { r: 192, g: 192, b: 192 },
  maroon: { r: 128, g: 0, b: 0 },
  olive: { r: 128, g: 128, b: 0 },
  lime: { r: 0, g: 255, b: 0 },
  aqua: { r: 0, g: 255, b: 255 },
  teal: { r: 0, g: 128, b: 128 },
  navy: { r: 0, g: 0, b: 128 },
  fuchsia: { r: 255, g: 0, b: 255 },
  purple: { r: 128, g: 0, b: 128 },
  orange: { r: 255, g: 165, b: 0 },
  transparent: { r: 0, g: 0, b: 0 },
};

/**
 * Parse a color string into RGB components
 * Supports: hex (#RGB, #RRGGBB), rgb(), rgba(), named colors
 *
 * @param color - Color string to parse
 * @returns RGB color object or null if invalid
 *
 * @example
 * parseColor('#FF0000')  // { r: 255, g: 0, b: 0 }
 * parseColor('rgb(255, 128, 0)')  // { r: 255, g: 128, b: 0 }
 * parseColor('red')  // { r: 255, g: 0, b: 0 }
 */
export function parseColor(color: string | null | undefined): RgbColor | null {
  if (!color) return null;

  const trimmed = color.trim().toLowerCase();

  // Try named colors first
  if (namedColors[trimmed]) {
    return { ...namedColors[trimmed] };
  }

  // Try hex format (#RGB or #RRGGBB)
  const hexMatch = trimmed.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }

  // Try shorthand hex (#RGB)
  const shortHexMatch = trimmed.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (shortHexMatch) {
    return {
      r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
      g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
      b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16),
    };
  }

  // Try rgb/rgba format
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10))),
      g: Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10))),
      b: Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10))),
    };
  }

  return null;
}

/**
 * Convert RGB color to hexadecimal string
 *
 * @param color - RGB color object
 * @returns Hex color string (lowercase, with #)
 *
 * @example
 * rgbToHex({ r: 255, g: 0, b: 0 })  // '#ff0000'
 */
export function rgbToHex(color: RgbColor): string {
  const toHex = (n: number): string => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Convert RGB color to HSL color space
 *
 * @param color - RGB color object
 * @returns HSL color object (h: 0-360, s: 0-100, l: 0-100)
 *
 * @example
 * rgbToHsl({ r: 255, g: 0, b: 0 })  // { h: 0, s: 100, l: 50 }
 */
export function rgbToHsl(color: RgbColor): HslColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL color to RGB color space
 *
 * @param color - HSL color object (h: 0-360, s: 0-100, l: 0-100)
 * @returns RGB color object
 *
 * @example
 * hslToRgb({ h: 0, s: 100, l: 50 })  // { r: 255, g: 0, b: 0 }
 */
export function hslToRgb(color: HslColor): RgbColor {
  const h = color.h / 360;
  const s = color.s / 100;
  const l = color.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Calculate the relative luminance of a color
 * Per WCAG 2.1 definition
 *
 * @param color - RGB color object
 * @returns Relative luminance (0-1)
 *
 * @see https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getLuminance(color: RgbColor): number {
  const [rs, gs, bs] = [color.r, color.g, color.b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate the contrast ratio between two colors
 * Per WCAG 2.1 definition
 *
 * @param fg - Foreground RGB color
 * @param bg - Background RGB color
 * @returns Contrast ratio (1-21)
 *
 * @see https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 *
 * @example
 * getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })  // ~21
 */
export function getContrastRatio(fg: RgbColor, bg: RgbColor): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG 2.1 Level AA requirements
 *
 * @param ratio - Contrast ratio
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns True if passes AA
 *
 * @example
 * meetsWCAGAA(4.5, false)  // true (normal text)
 * meetsWCAGAA(3, true)     // true (large text)
 */
export function meetsWCAGAA(ratio: number, isLargeText: boolean = false): boolean {
  return ratio >= (isLargeText ? 3 : 4.5);
}

/**
 * Check if contrast ratio meets WCAG 2.1 Level AAA requirements
 *
 * @param ratio - Contrast ratio
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns True if passes AAA
 *
 * @example
 * meetsWCAGAAA(7, false)   // true (normal text)
 * meetsWCAGAAA(4.5, true)  // true (large text)
 */
export function meetsWCAGAAA(ratio: number, isLargeText: boolean = false): boolean {
  return ratio >= (isLargeText ? 4.5 : 7);
}

/**
 * Format a contrast ratio for display
 *
 * @param ratio - Contrast ratio
 * @returns Formatted string (e.g., "4.50:1")
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Blend a foreground color with a background color using alpha
 *
 * @param fg - Foreground RGB color
 * @param bg - Background RGB color
 * @param alpha - Alpha value (0-1)
 * @returns Blended RGB color
 */
export function blendColors(fg: RgbColor, bg: RgbColor, alpha: number): RgbColor {
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
  };
}

/**
 * Suggested color fix with metadata
 */
export interface ColorSuggestion {
  color: RgbColor;
  hex: string;
  contrastRatio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
}

/**
 * Suggest color fixes to improve contrast
 *
 * @param fg - Current foreground color
 * @param bg - Current background color
 * @param isLargeText - Whether text is large
 * @returns Array of suggested colors with improved contrast
 */
export function suggestColorFixes(
  fg: RgbColor,
  bg: RgbColor,
  isLargeText: boolean = false
): ColorSuggestion[] {
  const suggestions: ColorSuggestion[] = [];
  const currentRatio = getContrastRatio(fg, bg);

  // Determine if we should darken or lighten the foreground
  const bgLuminance = getLuminance(bg);
  const shouldDarken = bgLuminance > 0.5;

  const fgHsl = rgbToHsl(fg);

  // Generate suggestions by adjusting lightness
  const steps = [10, 20, 30, 40, 50];

  for (const step of steps) {
    const newL = shouldDarken
      ? Math.max(0, fgHsl.l - step)
      : Math.min(100, fgHsl.l + step);

    const newRgb = hslToRgb({ ...fgHsl, l: newL });
    const newRatio = getContrastRatio(newRgb, bg);

    if (newRatio > currentRatio) {
      suggestions.push({
        color: newRgb,
        hex: rgbToHex(newRgb),
        contrastRatio: newRatio,
        meetsAA: meetsWCAGAA(newRatio, isLargeText),
        meetsAAA: meetsWCAGAAA(newRatio, isLargeText),
      });
    }
  }

  // Sort by contrast ratio (best first)
  suggestions.sort((a, b) => b.contrastRatio - a.contrastRatio);

  // Return unique suggestions (limit to 5)
  return suggestions.slice(0, 5);
}

/**
 * Calculate the optimal text color (black or white) for a given background
 *
 * @param bg - Background RGB color
 * @returns Either black or white, whichever has better contrast
 */
export function getOptimalTextColor(bg: RgbColor): RgbColor {
  const luminance = getLuminance(bg);
  return luminance > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
}

/**
 * Check if a color is considered "light"
 *
 * @param color - RGB color
 * @returns True if the color is light
 */
export function isLightColor(color: RgbColor): boolean {
  return getLuminance(color) > 0.5;
}

/**
 * Adjust color lightness by a percentage
 *
 * @param color - RGB color
 * @param percent - Percentage to adjust (-100 to 100)
 * @returns Adjusted RGB color
 */
export function adjustLightness(color: RgbColor, percent: number): RgbColor {
  const hsl = rgbToHsl(color);
  hsl.l = Math.max(0, Math.min(100, hsl.l + percent));
  return hslToRgb(hsl);
}

/**
 * Get the effective background color by walking up the DOM tree
 * and compositing transparent backgrounds
 *
 * @param element - Target element
 * @returns Effective background RGB color
 */
export function getEffectiveBackgroundColor(element: Element): RgbColor {
  let current: Element | null = element;
  let bg: RgbColor = { r: 255, g: 255, b: 255 }; // Default to white

  while (current && current !== document.documentElement) {
    const style = window.getComputedStyle(current);
    const bgColor = style.backgroundColor;

    if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
      const parsed = parseColor(bgColor);
      if (parsed) {
        // Check for alpha
        const alphaMatch = bgColor.match(/rgba\([^)]+,\s*([\d.]+)\s*\)/);
        if (alphaMatch) {
          const alpha = parseFloat(alphaMatch[1]);
          if (alpha < 1) {
            bg = blendColors(parsed, bg, alpha);
          } else {
            bg = parsed;
            break;
          }
        } else {
          bg = parsed;
          break;
        }
      }
    }

    current = current.parentElement;
  }

  return bg;
}

/**
 * Get the foreground color of an element
 *
 * @param element - Target element
 * @returns Foreground RGB color
 */
export function getForegroundColor(element: Element): RgbColor | null {
  const style = window.getComputedStyle(element);
  return parseColor(style.color);
}

/**
 * Analyze the contrast of an element
 *
 * @param element - Target element
 * @returns Contrast analysis result
 */
export function analyzeElementContrast(element: Element): {
  foreground: RgbColor;
  background: RgbColor;
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  isLargeText: boolean;
} | null {
  const fg = getForegroundColor(element);
  if (!fg) return null;

  const bg = getEffectiveBackgroundColor(element);
  const ratio = getContrastRatio(fg, bg);

  // Determine if text is large
  const style = window.getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight, 10) || 400;
  const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);

  return {
    foreground: fg,
    background: bg,
    ratio,
    meetsAA: meetsWCAGAA(ratio, isLargeText),
    meetsAAA: meetsWCAGAAA(ratio, isLargeText),
    isLargeText,
  };
}

