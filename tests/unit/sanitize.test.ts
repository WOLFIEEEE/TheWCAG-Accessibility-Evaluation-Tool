// ============================================
// TheWCAG Evaluation Extension - Sanitize Tests
// Unit tests for sanitization utilities
// ============================================

import {
  escapeHtml,
  unescapeHtml,
  sanitizeSelector,
  sanitizeUrl,
  isValidUrl,
  sanitizeJson,
} from '../../src/utils/sanitize';

describe('Sanitize Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert("XSS")&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle strings without special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('"test"')).toBe('"test"');
    });
  });

  describe('unescapeHtml', () => {
    it('should unescape HTML entities', () => {
      expect(unescapeHtml('&lt;p&gt;Hello&lt;/p&gt;')).toBe('<p>Hello</p>');
    });

    it('should handle ampersands', () => {
      expect(unescapeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
    });

    it('should handle empty strings', () => {
      expect(unescapeHtml('')).toBe('');
    });
  });

  describe('sanitizeSelector', () => {
    it('should allow valid CSS selectors', () => {
      expect(sanitizeSelector('#my-id')).toBe('#my-id');
      expect(sanitizeSelector('.my-class')).toBe('.my-class');
      expect(sanitizeSelector('div.class#id')).toBe('div.class#id');
    });

    it('should remove HTML characters', () => {
      expect(sanitizeSelector('#id<script>')).toBe('#idscript');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeSelector('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should escape invalid selectors', () => {
      const result = sanitizeSelector('div[invalid');
      expect(typeof result).toBe('string');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should block javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('should block data: URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should handle empty strings', () => {
      expect(sanitizeUrl('')).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should return true for valid https URLs', () => {
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    });

    it('should return true for mailto URLs', () => {
      expect(isValidUrl('mailto:test@example.com')).toBe(true);
    });

    it('should return false for javascript URLs', () => {
      expect(isValidUrl('javascript:void(0)')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });
  });

  describe('sanitizeJson', () => {
    it('should escape strings in objects', () => {
      const input = { name: '<script>alert(1)</script>' };
      const result = sanitizeJson(input);
      expect(result.name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('should handle nested objects', () => {
      const input = { user: { name: '<b>test</b>' } };
      const result = sanitizeJson(input);
      expect(result.user.name).toBe('&lt;b&gt;test&lt;/b&gt;');
    });

    it('should handle arrays', () => {
      const input = ['<script>', 'normal'];
      const result = sanitizeJson(input);
      expect(result[0]).toBe('&lt;script&gt;');
      expect(result[1]).toBe('normal');
    });

    it('should preserve numbers and booleans', () => {
      const input = { count: 42, active: true };
      const result = sanitizeJson(input);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
    });

    it('should handle null and undefined', () => {
      expect(sanitizeJson(null)).toBe(null);
      expect(sanitizeJson(undefined)).toBe(undefined);
    });
  });
});

