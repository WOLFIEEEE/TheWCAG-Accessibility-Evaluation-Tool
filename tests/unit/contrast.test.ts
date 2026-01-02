// ============================================
// TheWCAG Evaluation Extension - Contrast Tests
// Unit tests for contrast calculation utilities
// ============================================

import {
  parseColor,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  getLuminance,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  suggestColorFixes,
} from '../../src/utils/contrast';

describe('Contrast Utilities', () => {
  describe('parseColor', () => {
    it('should parse hex colors', () => {
      expect(parseColor('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseColor('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should parse shorthand hex colors', () => {
      expect(parseColor('#F00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('#0F0')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should parse rgb colors', () => {
      expect(parseColor('rgb(255, 128, 0)')).toEqual({ r: 255, g: 128, b: 0 });
      expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse rgba colors', () => {
      expect(parseColor('rgba(255, 128, 0, 0.5)')).toEqual({ r: 255, g: 128, b: 0 });
    });

    it('should parse named colors', () => {
      expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return null for invalid colors', () => {
      expect(parseColor('invalid')).toBeNull();
      expect(parseColor('')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
    });

    it('should handle edge cases', () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
    });
  });

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL', () => {
      const red = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(red.h).toBe(0);
      expect(red.s).toBe(100);
      expect(red.l).toBe(50);
    });

    it('should handle gray values', () => {
      const gray = rgbToHsl({ r: 128, g: 128, b: 128 });
      expect(gray.s).toBe(0);
      expect(gray.l).toBe(50);
    });

    it('should handle white and black', () => {
      const white = rgbToHsl({ r: 255, g: 255, b: 255 });
      expect(white.l).toBe(100);

      const black = rgbToHsl({ r: 0, g: 0, b: 0 });
      expect(black.l).toBe(0);
    });
  });

  describe('hslToRgb', () => {
    it('should convert HSL to RGB', () => {
      const red = hslToRgb({ h: 0, s: 100, l: 50 });
      expect(red.r).toBe(255);
      expect(red.g).toBe(0);
      expect(red.b).toBe(0);
    });

    it('should handle achromatic colors', () => {
      const gray = hslToRgb({ h: 0, s: 0, l: 50 });
      expect(gray.r).toBe(gray.g);
      expect(gray.g).toBe(gray.b);
    });
  });

  describe('getLuminance', () => {
    it('should calculate relative luminance', () => {
      // White should have luminance close to 1
      expect(getLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);

      // Black should have luminance of 0
      expect(getLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    });

    it('should calculate mid-gray luminance', () => {
      const luminance = getLuminance({ r: 128, g: 128, b: 128 });
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('should return 21:1 for black on white', () => {
      const black = { r: 0, g: 0, b: 0 };
      const white = { r: 255, g: 255, b: 255 };
      expect(getContrastRatio(black, white)).toBeCloseTo(21, 0);
    });

    it('should return 1:1 for same colors', () => {
      const color = { r: 128, g: 128, b: 128 };
      expect(getContrastRatio(color, color)).toBeCloseTo(1, 5);
    });

    it('should be symmetric', () => {
      const color1 = { r: 255, g: 0, b: 0 };
      const color2 = { r: 0, g: 0, b: 255 };
      expect(getContrastRatio(color1, color2)).toBe(getContrastRatio(color2, color1));
    });
  });

  describe('meetsWCAGAA', () => {
    it('should pass for black on white', () => {
      expect(meetsWCAGAA(21, false)).toBe(true);
      expect(meetsWCAGAA(21, true)).toBe(true);
    });

    it('should require 4.5:1 for normal text', () => {
      expect(meetsWCAGAA(4.5, false)).toBe(true);
      expect(meetsWCAGAA(4.4, false)).toBe(false);
    });

    it('should require 3:1 for large text', () => {
      expect(meetsWCAGAA(3, true)).toBe(true);
      expect(meetsWCAGAA(2.9, true)).toBe(false);
    });
  });

  describe('meetsWCAGAAA', () => {
    it('should require 7:1 for normal text', () => {
      expect(meetsWCAGAAA(7, false)).toBe(true);
      expect(meetsWCAGAAA(6.9, false)).toBe(false);
    });

    it('should require 4.5:1 for large text', () => {
      expect(meetsWCAGAAA(4.5, true)).toBe(true);
      expect(meetsWCAGAAA(4.4, true)).toBe(false);
    });
  });

  describe('suggestColorFixes', () => {
    it('should suggest darker foreground for light backgrounds', () => {
      const fg = { r: 180, g: 180, b: 180 };
      const bg = { r: 255, g: 255, b: 255 };
      const suggestions = suggestColorFixes(fg, bg);

      expect(suggestions.length).toBeGreaterThan(0);
      // Suggested colors should have better contrast
      suggestions.forEach((suggestion) => {
        expect(suggestion.contrastRatio).toBeGreaterThan(getContrastRatio(fg, bg));
      });
    });

    it('should suggest lighter foreground for dark backgrounds', () => {
      const fg = { r: 100, g: 100, b: 100 };
      const bg = { r: 0, g: 0, b: 0 };
      const suggestions = suggestColorFixes(fg, bg);

      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});

