// ============================================
// TheWCAG Evaluation Extension - Structure Rules
// Complete structural element detection rules
// ============================================

import { AccessibilityRule, RuleResult, EvaluationContext } from '../../types';
import { 
  getSelector, 
  getXPath, 
  getTextContent,
} from '../../utils/dom-utils';
import { createRule } from '../index';

// ============================================
// Heading Structure Rules
// ============================================

const h1: AccessibilityRule = createRule('h1', 'Heading level 1', 'structure', {
  description: 'First-level heading',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'h1') return null;
    
    const text = getTextContent(element);
    if (!text || text.trim() === '') return null;
    
    return {
      ruleId: 'h1',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Heading level 1',
      impact: 'none',
      data: { text: text.substring(0, 100) },
    };
  },
  documentation: {
    summary: 'A first-level heading is present.',
    purpose: 'Headings provide page structure and navigation.',
    actions: [],
    algorithm: 'An h1 element is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const h2: AccessibilityRule = createRule('h2', 'Heading level 2', 'structure', {
  description: 'Second-level heading',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'h2') return null;
    
    const text = getTextContent(element);
    if (!text || text.trim() === '') return null;
    
    return {
      ruleId: 'h2',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Heading level 2',
      impact: 'none',
      data: { text: text.substring(0, 100) },
    };
  },
  documentation: {
    summary: 'A second-level heading is present.',
    purpose: 'Headings provide page structure and navigation.',
    actions: [],
    algorithm: 'An h2 element is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const h3: AccessibilityRule = createRule('h3', 'Heading level 3', 'structure', {
  description: 'Third-level heading',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'h3') return null;
    
    const text = getTextContent(element);
    if (!text || text.trim() === '') return null;
    
    return {
      ruleId: 'h3',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Heading level 3',
      impact: 'none',
      data: { text: text.substring(0, 100) },
    };
  },
  documentation: {
    summary: 'A third-level heading is present.',
    purpose: 'Headings provide page structure and navigation.',
    actions: [],
    algorithm: 'An h3 element is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const h4: AccessibilityRule = createRule('h4', 'Heading level 4', 'structure', {
  description: 'Fourth-level heading',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'h4') return null;
    
    const text = getTextContent(element);
    if (!text || text.trim() === '') return null;
    
    return {
      ruleId: 'h4',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Heading level 4',
      impact: 'none',
      data: { text: text.substring(0, 100) },
    };
  },
  documentation: {
    summary: 'A fourth-level heading is present.',
    purpose: 'Headings provide page structure and navigation.',
    actions: [],
    algorithm: 'An h4 element is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const h5: AccessibilityRule = createRule('h5', 'Heading level 5', 'structure', {
  description: 'Fifth-level heading',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'h5') return null;
    
    const text = getTextContent(element);
    if (!text || text.trim() === '') return null;
    
    return {
      ruleId: 'h5',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Heading level 5',
      impact: 'none',
      data: { text: text.substring(0, 100) },
    };
  },
  documentation: {
    summary: 'A fifth-level heading is present.',
    purpose: 'Headings provide page structure and navigation.',
    actions: [],
    algorithm: 'An h5 element is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const h6: AccessibilityRule = createRule('h6', 'Heading level 6', 'structure', {
  description: 'Sixth-level heading',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['headings', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'h6') return null;
    
    const text = getTextContent(element);
    if (!text || text.trim() === '') return null;
    
    return {
      ruleId: 'h6',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Heading level 6',
      impact: 'none',
      data: { text: text.substring(0, 100) },
    };
  },
  documentation: {
    summary: 'A sixth-level heading is present.',
    purpose: 'Headings provide page structure and navigation.',
    actions: [],
    algorithm: 'An h6 element is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Landmark Structure Rules
// ============================================

const header: AccessibilityRule = createRule('header', 'Header landmark', 'structure', {
  description: 'Header/banner landmark',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['landmarks', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    // Check if it's a header element not nested in article/aside/main/nav/section
    if (tagName === 'header') {
      if (!element.closest('article, aside, main, nav, section')) {
        return {
          ruleId: 'header',
          category: 'structure',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Header landmark (banner)',
          impact: 'none',
        };
      }
    }
    
    if (role === 'banner') {
      return {
        ruleId: 'header',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Banner landmark',
        impact: 'none',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A header/banner landmark is present.',
    purpose: 'Landmarks help screen reader users navigate the page.',
    actions: [],
    algorithm: 'A header element or role=banner is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const nav: AccessibilityRule = createRule('nav', 'Navigation landmark', 'structure', {
  description: 'Navigation landmark',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['landmarks', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    if (tagName === 'nav' || role === 'navigation') {
      return {
        ruleId: 'nav',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Navigation landmark',
        impact: 'none',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A navigation landmark is present.',
    purpose: 'Navigation landmarks help users find navigation sections.',
    actions: [],
    algorithm: 'A nav element or role=navigation is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const search: AccessibilityRule = createRule('search', 'Search landmark', 'structure', {
  description: 'Search landmark',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['landmarks', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    if (tagName === 'search' || role === 'search') {
      return {
        ruleId: 'search',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Search landmark',
        impact: 'none',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A search landmark is present.',
    purpose: 'Search landmarks help users find search functionality.',
    actions: [],
    algorithm: 'A search element or role=search is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const main: AccessibilityRule = createRule('main', 'Main landmark', 'structure', {
  description: 'Main content landmark',
  impact: 'none',
  wcagCriteria: ['1.3.1', '2.4.1'],
  wcagLevel: 'A',
  tags: ['landmarks', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    if (tagName === 'main' || role === 'main') {
      return {
        ruleId: 'main',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Main content landmark',
        impact: 'none',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A main content landmark is present.',
    purpose: 'Main landmarks help users skip to main content.',
    actions: [],
    algorithm: 'A main element or role=main is present.',
    guidelines: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' },
      { id: '2.4.1', name: 'Bypass Blocks', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html' },
    ],
  },
});

const footer: AccessibilityRule = createRule('footer', 'Footer landmark', 'structure', {
  description: 'Footer/contentinfo landmark',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['landmarks', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    // Check if it's a footer element not nested in article/aside/main/nav/section
    if (tagName === 'footer') {
      if (!element.closest('article, aside, main, nav, section')) {
        return {
          ruleId: 'footer',
          category: 'structure',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Footer landmark (contentinfo)',
          impact: 'none',
        };
      }
    }
    
    if (role === 'contentinfo') {
      return {
        ruleId: 'footer',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Contentinfo landmark',
        impact: 'none',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A footer/contentinfo landmark is present.',
    purpose: 'Footer landmarks help users find page footer information.',
    actions: [],
    algorithm: 'A footer element or role=contentinfo is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const aside: AccessibilityRule = createRule('aside', 'Aside/complementary landmark', 'structure', {
  description: 'Aside/complementary landmark',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['landmarks', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    if (tagName === 'aside' || role === 'complementary') {
      return {
        ruleId: 'aside',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Complementary landmark',
        impact: 'none',
      };
    }
    return null;
  },
  documentation: {
    summary: 'An aside/complementary landmark is present.',
    purpose: 'Complementary landmarks indicate supporting content.',
    actions: [],
    algorithm: 'An aside element or role=complementary is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const region: AccessibilityRule = createRule('region', 'Region landmark', 'structure', {
  description: 'Region landmark',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['landmarks', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    // Section with accessible name becomes region
    if (tagName === 'section') {
      const hasLabel = element.hasAttribute('aria-label') || 
                       element.hasAttribute('aria-labelledby');
      if (hasLabel) {
        return {
          ruleId: 'region',
          category: 'structure',
          element,
          selector: getSelector(element),
          xpath: getXPath(element),
          message: 'Region landmark',
          impact: 'none',
        };
      }
    }
    
    if (role === 'region') {
      return {
        ruleId: 'region',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Region landmark',
        impact: 'none',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A region landmark is present.',
    purpose: 'Region landmarks identify significant page sections.',
    actions: [],
    algorithm: 'A section with accessible name or role=region is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// List Structure Rules
// ============================================

const ul: AccessibilityRule = createRule('ul', 'Unordered list', 'structure', {
  description: 'Unordered list',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['lists', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'ul') return null;
    
    const items = element.querySelectorAll(':scope > li');
    if (items.length === 0) return null;
    
    return {
      ruleId: 'ul',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `Unordered list with ${items.length} items`,
      impact: 'none',
      data: { itemCount: items.length },
    };
  },
  documentation: {
    summary: 'An unordered list is present.',
    purpose: 'Lists help convey relationships between items.',
    actions: [],
    algorithm: 'A ul element with li children is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const ol: AccessibilityRule = createRule('ol', 'Ordered list', 'structure', {
  description: 'Ordered list',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['lists', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'ol') return null;
    
    const items = element.querySelectorAll(':scope > li');
    if (items.length === 0) return null;
    
    return {
      ruleId: 'ol',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `Ordered list with ${items.length} items`,
      impact: 'none',
      data: { itemCount: items.length },
    };
  },
  documentation: {
    summary: 'An ordered list is present.',
    purpose: 'Ordered lists convey sequence information.',
    actions: [],
    algorithm: 'An ol element with li children is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const dl: AccessibilityRule = createRule('dl', 'Definition list', 'structure', {
  description: 'Definition list',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['lists', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'dl') return null;
    
    const terms = element.querySelectorAll(':scope > dt');
    const definitions = element.querySelectorAll(':scope > dd');
    if (terms.length === 0 || definitions.length === 0) return null;
    
    return {
      ruleId: 'dl',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `Definition list with ${terms.length} terms`,
      impact: 'none',
      data: { termCount: terms.length, definitionCount: definitions.length },
    };
  },
  documentation: {
    summary: 'A definition list is present.',
    purpose: 'Definition lists associate terms with definitions.',
    actions: [],
    algorithm: 'A dl element with dt and dd children is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Table Structure Rules
// ============================================

const tableData: AccessibilityRule = createRule('table_data', 'Data table', 'structure', {
  description: 'Data table with headers',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'table') return null;
    
    const table = element as HTMLTableElement;
    
    // Skip layout tables
    if (table.getAttribute('role') === 'presentation' || table.getAttribute('role') === 'none') return null;
    
    const headers = table.querySelectorAll('th');
    if (headers.length === 0) return null;
    
    return {
      ruleId: 'table_data',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: `Data table with ${headers.length} headers`,
      impact: 'none',
      data: { headerCount: headers.length },
    };
  },
  documentation: {
    summary: 'A data table with headers is present.',
    purpose: 'Data tables with headers help users understand tabular data.',
    actions: [],
    algorithm: 'A table with th elements is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const tableCaption: AccessibilityRule = createRule('table_caption', 'Table caption', 'structure', {
  description: 'Table has a caption',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'table') return null;
    
    const table = element as HTMLTableElement;
    
    if (table.caption && getTextContent(table.caption).trim()) {
      return {
        ruleId: 'table_caption',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Table has caption',
        impact: 'none',
        data: { caption: getTextContent(table.caption) },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A table has a caption.',
    purpose: 'Captions help identify tables.',
    actions: [],
    algorithm: 'A table has a non-empty caption element.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const tableLayout: AccessibilityRule = createRule('table_layout', 'Layout table', 'structure', {
  description: 'Layout table',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'table') return null;
    
    const table = element as HTMLTableElement;
    
    if (table.getAttribute('role') === 'presentation' || table.getAttribute('role') === 'none') {
      return {
        ruleId: 'table_layout',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Layout table (role=presentation)',
        impact: 'none',
      };
    }
    return null;
  },
  documentation: {
    summary: 'A table is marked as presentational/layout.',
    purpose: 'Layout tables should have role=presentation.',
    actions: [],
    algorithm: 'A table has role=presentation or role=none.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const th: AccessibilityRule = createRule('th', 'Table header', 'structure', {
  description: 'Table header cell',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'th') return null;
    
    const text = getTextContent(element);
    if (!text || text.trim() === '') return null;
    
    return {
      ruleId: 'th',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: 'Table header',
      impact: 'none',
      data: { text: text.substring(0, 50) },
    };
  },
  documentation: {
    summary: 'A table header cell is present.',
    purpose: 'Table headers provide context for data cells.',
    actions: [],
    algorithm: 'A th element with text is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const thCol: AccessibilityRule = createRule('th_col', 'Column header', 'structure', {
  description: 'Column table header',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'th') return null;
    
    const th = element as HTMLTableCellElement;
    const scope = th.getAttribute('scope');
    
    if (scope === 'col' || scope === 'colgroup') {
      const text = getTextContent(element);
      return {
        ruleId: 'th_col',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Column header',
        impact: 'none',
        data: { text: text?.substring(0, 50), scope },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A column header is present.',
    purpose: 'Column headers with scope describe column data.',
    actions: [],
    algorithm: 'A th with scope=col is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const thRow: AccessibilityRule = createRule('th_row', 'Row header', 'structure', {
  description: 'Row table header',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['tables', 'structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'th') return null;
    
    const th = element as HTMLTableCellElement;
    const scope = th.getAttribute('scope');
    
    if (scope === 'row' || scope === 'rowgroup') {
      const text = getTextContent(element);
      return {
        ruleId: 'th_row',
        category: 'structure',
        element,
        selector: getSelector(element),
        xpath: getXPath(element),
        message: 'Row header',
        impact: 'none',
        data: { text: text?.substring(0, 50), scope },
      };
    }
    return null;
  },
  documentation: {
    summary: 'A row header is present.',
    purpose: 'Row headers with scope describe row data.',
    actions: [],
    algorithm: 'A th with scope=row is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

// ============================================
// Other Structure Rules
// ============================================

const figure: AccessibilityRule = createRule('figure', 'Figure', 'structure', {
  description: 'Figure element',
  impact: 'none',
  wcagCriteria: ['1.3.1'],
  wcagLevel: 'A',
  tags: ['structure'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'figure') return null;
    
    const caption = element.querySelector('figcaption');
    
    return {
      ruleId: 'figure',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: caption ? 'Figure with caption' : 'Figure',
      impact: 'none',
      data: { hasCaption: !!caption },
    };
  },
  documentation: {
    summary: 'A figure element is present.',
    purpose: 'Figures associate content with captions.',
    actions: [],
    algorithm: 'A figure element is present.',
    guidelines: [{ id: '1.3.1', name: 'Info and Relationships', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html' }],
  },
});

const iframe: AccessibilityRule = createRule('iframe', 'Inline frame', 'structure', {
  description: 'Inline frame',
  impact: 'none',
  wcagCriteria: ['4.1.2'],
  wcagLevel: 'A',
  tags: ['structure', 'frames'],
  evaluate: (element: Element): RuleResult | null => {
    if (element.tagName.toLowerCase() !== 'iframe') return null;
    
    const iframe = element as HTMLIFrameElement;
    const title = iframe.title;
    
    return {
      ruleId: 'iframe',
      category: 'structure',
      element,
      selector: getSelector(element),
      xpath: getXPath(element),
      message: title ? `Iframe: "${title}"` : 'Iframe (no title)',
      impact: 'none',
      data: { title, src: iframe.src },
    };
  },
  documentation: {
    summary: 'An iframe is present.',
    purpose: 'Iframes should have descriptive titles.',
    actions: [],
    algorithm: 'An iframe element is present.',
    guidelines: [{ id: '4.1.2', name: 'Name, Role, Value', level: 'A', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html' }],
  },
});

// ============================================
// Export all structure rules
// ============================================
export const structureRules: AccessibilityRule[] = [
  // Headings
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  // Landmarks
  header,
  nav,
  search,
  main,
  footer,
  aside,
  region,
  // Lists
  ul,
  ol,
  dl,
  // Tables
  tableData,
  tableCaption,
  tableLayout,
  th,
  thCol,
  thRow,
  // Other
  figure,
  iframe,
];
