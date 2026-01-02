// ============================================
// TheWCAG Evaluation Extension - Color Utilities
// Complete set of color manipulation utilities
// ============================================

import { RgbColor, HslColor, ContrastResult } from '../types';

// ============================================
// Color Parsing
// ============================================

/**
 * Parse a CSS color string into RGB values
 */
export function parseColor(color: string): RgbColor | null {
  if (!color) return null;

  // Handle rgb/rgba format
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Handle hex format
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }

  // Handle shorthand hex format
  const shortHexMatch = color.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (shortHexMatch) {
    return {
      r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
      g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
      b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16),
    };
  }

  // Handle named colors
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
    transparent: { r: 0, g: 0, b: 0 }, // Will be handled specially
  };

  const normalized = color.toLowerCase().trim();
  if (namedColors[normalized]) {
    return namedColors[normalized];
  }

  return null;
}

/**
 * Check if a color is transparent
 */
export function isTransparent(color: string): boolean {
  if (!color) return true;
  if (color === 'transparent') return true;
  if (color === 'rgba(0, 0, 0, 0)') return true;

  const alphaMatch = color.match(/rgba\s*\([^)]+,\s*([0-9.]+)\s*\)/);
  if (alphaMatch) {
    return parseFloat(alphaMatch[1]) === 0;
  }

  return false;
}

// ============================================
// Color Conversion
// ============================================

/**
 * Convert RGB to hex string
 */
export function rgbToHex(rgb: RgbColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): RgbColor | null {
  return parseColor(hex);
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

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
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HslColor): RgbColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
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

// ============================================
// Contrast Calculation
// ============================================

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export function calculateLuminance(rgb: RgbColor): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function calculateContrastRatio(fg: RgbColor, bg: RgbColor): number {
  const l1 = calculateLuminance(fg);
  const l2 = calculateLuminance(bg);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio passes WCAG requirements
 */
export function checkContrast(
  fg: RgbColor,
  bg: RgbColor,
  isLargeText: boolean = false
): ContrastResult {
  const ratio = calculateContrastRatio(fg, bg);

  // WCAG AA: 4.5:1 for normal text, 3:1 for large text
  // WCAG AAA: 7:1 for normal text, 4.5:1 for large text
  const aaThreshold = isLargeText ? 3.0 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7.0;

  return {
    ratio,
    foreground: fg,
    background: bg,
    passesAA: ratio >= aaThreshold,
    passesAAA: ratio >= aaaThreshold,
    isLargeText,
  };
}

// ============================================
// Color Adjustment
// ============================================

/**
 * Darken a color by a percentage
 */
export function darken(rgb: RgbColor, percent: number): RgbColor {
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, hsl.l - percent);
  return hslToRgb(hsl);
}

/**
 * Lighten a color by a percentage
 */
export function lighten(rgb: RgbColor, percent: number): RgbColor {
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.min(100, hsl.l + percent);
  return hslToRgb(hsl);
}

/**
 * Adjust saturation of a color
 */
export function saturate(rgb: RgbColor, percent: number): RgbColor {
  const hsl = rgbToHsl(rgb);
  hsl.s = Math.min(100, Math.max(0, hsl.s + percent));
  return hslToRgb(hsl);
}

/**
 * Get a contrasting color (black or white)
 */
export function getContrastingColor(rgb: RgbColor): RgbColor {
  const luminance = calculateLuminance(rgb);
  return luminance > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
}

/**
 * Suggest a better contrast color
 */
export function suggestBetterContrast(
  fg: RgbColor,
  bg: RgbColor,
  isLargeText: boolean = false
): RgbColor {
  const targetRatio = isLargeText ? 4.5 : 7.0; // Target AAA
  let adjustedFg = { ...fg };

  const fgLuminance = calculateLuminance(fg);
  const bgLuminance = calculateLuminance(bg);

  // Determine if we should lighten or darken
  const shouldDarken = fgLuminance > bgLuminance;

  // Iteratively adjust until we reach target ratio
  for (let i = 0; i < 100; i++) {
    const currentRatio = calculateContrastRatio(adjustedFg, bg);
    if (currentRatio >= targetRatio) break;

    if (shouldDarken) {
      adjustedFg = darken(adjustedFg, 5);
    } else {
      adjustedFg = lighten(adjustedFg, 5);
    }
  }

  return adjustedFg;
}

// ============================================
// Color Blending
// ============================================

/**
 * Blend two colors with alpha
 */
export function blendColors(fg: RgbColor, bg: RgbColor, alpha: number = 1): RgbColor {
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
  };
}

/**
 * Overlay color calculation (for semi-transparent overlays)
 */
export function overlayColor(fg: RgbColor, fgAlpha: number, bg: RgbColor): RgbColor {
  return blendColors(fg, bg, fgAlpha);
}

// ============================================
// Color Analysis
// ============================================

/**
 * Check if a color is "light" (high luminance)
 */
export function isLightColor(rgb: RgbColor): boolean {
  return calculateLuminance(rgb) > 0.5;
}

/**
 * Check if a color is "dark" (low luminance)
 */
export function isDarkColor(rgb: RgbColor): boolean {
  return calculateLuminance(rgb) <= 0.5;
}

/**
 * Get grayscale equivalent of a color
 */
export function toGrayscale(rgb: RgbColor): RgbColor {
  // Using luminance-based conversion
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  return { r: gray, g: gray, b: gray };
}

/**
 * Check if two colors are visually similar
 */
export function areColorsSimilar(c1: RgbColor, c2: RgbColor, threshold: number = 30): boolean {
  const diff = Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b);
  return diff < threshold;
}

// ============================================
// CSS Color Utilities
// ============================================

/**
 * Convert RGB to CSS rgb() string
 */
export function rgbToCss(rgb: RgbColor): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Convert RGB to CSS rgba() string with alpha
 */
export function rgbaToCss(rgb: RgbColor, alpha: number = 1): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Convert HSL to CSS hsl() string
 */
export function hslToCss(hsl: HslColor): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * Check if contrast ratio passes WCAG AA
 */
export function passesWCAG_AA(ratio: number, isLargeText: boolean = false): boolean {
  const threshold = isLargeText ? 3.0 : 4.5;
  return ratio >= threshold;
}

/**
 * Check if contrast ratio passes WCAG AAA
 */
export function passesWCAG_AAA(ratio: number, isLargeText: boolean = false): boolean {
  const threshold = isLargeText ? 4.5 : 7.0;
  return ratio >= threshold;
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Check if text is large (18pt+ or 14pt+ bold)
 */
export function isLargeText(fontSize: number, fontWeight: string | number): boolean {
  // Convert px to pt (1pt = 1.333px)
  const fontSizePt = fontSize / 1.333;
  const isBold = fontWeight === 'bold' || parseInt(String(fontWeight), 10) >= 700;

  // Large text: 18pt+ or 14pt+ if bold
  return fontSizePt >= 18 || (fontSizePt >= 14 && isBold);
}

/**
 * Adjust lightness of a color to improve contrast
 */
export function adjustLightness(rgb: RgbColor, targetRatio: number, bgRgb: RgbColor): RgbColor {
  const hsl = rgbToHsl(rgb);
  const bgLuminance = calculateLuminance(bgRgb);

  // Determine if we should lighten or darken based on background
  const shouldLighten = bgLuminance < 0.5;

  // Iteratively adjust until we reach target ratio
  for (let i = 0; i < 100; i++) {
    const currentRgb = hslToRgb(hsl);
    const currentRatio = calculateContrastRatio(currentRgb, bgRgb);
    if (currentRatio >= targetRatio) {
      return currentRgb;
    }

    if (shouldLighten) {
      hsl.l = Math.min(100, hsl.l + 2);
    } else {
      hsl.l = Math.max(0, hsl.l - 2);
    }
  }

  return hslToRgb(hsl);
}
