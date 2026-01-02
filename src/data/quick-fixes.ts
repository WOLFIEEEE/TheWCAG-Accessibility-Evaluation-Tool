// ============================================
// TheWCAG Evaluation Extension - Quick Fix Database
// Fix templates for accessibility issues (30+ rules)
// ============================================

import { QuickFix, FixExample, FixPlaceholder } from '../types';

// ============================================
// Quick Fix Templates
// ============================================

export const quickFixes: Record<string, QuickFix> = {
  // ==========================================
  // Images and Alt Text
  // ==========================================

  alt_missing: {
    ruleId: 'alt_missing',
    title: 'Add alt text to image',
    description: 'Provide descriptive alt text that conveys the meaning and purpose of the image.',
    template: '<img src="{{src}}" alt="{{altText}}"{{additionalAttrs}}>',
    placeholders: [
      {
        key: 'src',
        label: 'Source URL',
        type: 'auto',
        autoGenerate: 'getAttribute:src',
      },
      {
        key: 'altText',
        label: 'Alt text',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'additionalAttrs',
        label: 'Additional attributes',
        type: 'auto',
        autoGenerate: 'preserveAttributes',
      },
    ],
    examples: [
      {
        before: '<img src="hero.jpg">',
        after: '<img src="hero.jpg" alt="Team collaborating at a whiteboard">',
        explanation: 'Describe what the image shows in a concise manner.',
      },
      {
        before: '<img src="icon-search.svg">',
        after: '<img src="icon-search.svg" alt="Search">',
        explanation: 'For functional images, describe the action or purpose.',
      },
      {
        before: '<img src="decorative-border.png">',
        after: '<img src="decorative-border.png" alt="">',
        explanation: 'Use empty alt="" for purely decorative images.',
      },
    ],
    wcagCriteria: ['1.1.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/images/',
  },

  alt_empty: {
    ruleId: 'alt_empty',
    title: 'Add meaningful alt text',
    description: 'Replace empty alt attribute with descriptive text, or confirm it should be decorative.',
    template: '<img src="{{src}}" alt="{{altText}}">',
    placeholders: [
      {
        key: 'src',
        label: 'Source URL',
        type: 'auto',
        autoGenerate: 'getAttribute:src',
      },
      {
        key: 'altText',
        label: 'Alt text',
        type: 'text',
        defaultValue: '',
      },
    ],
    examples: [
      {
        before: '<img src="product.jpg" alt="">',
        after: '<img src="product.jpg" alt="Blue wireless headphones with cushioned ear cups">',
        explanation: 'Add descriptive text if the image conveys information.',
      },
    ],
    wcagCriteria: ['1.1.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/images/decision-tree/',
  },

  alt_suspicious: {
    ruleId: 'alt_suspicious',
    title: 'Improve alt text quality',
    description: 'Replace suspicious or redundant alt text with more descriptive content.',
    template: '<img src="{{src}}" alt="{{altText}}">',
    placeholders: [
      {
        key: 'src',
        label: 'Source URL',
        type: 'auto',
        autoGenerate: 'getAttribute:src',
      },
      {
        key: 'altText',
        label: 'Improved alt text',
        type: 'text',
        defaultValue: '',
      },
    ],
    examples: [
      {
        before: '<img src="chart.png" alt="image">',
        after: '<img src="chart.png" alt="Bar chart showing Q3 sales increased by 25%">',
        explanation: 'Avoid generic terms like "image" or "photo". Be specific.',
      },
      {
        before: '<img src="logo.png" alt="logo.png">',
        after: '<img src="logo.png" alt="Acme Corporation logo">',
        explanation: 'Don\'t use filenames as alt text.',
      },
    ],
    wcagCriteria: ['1.1.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/images/',
  },

  // ==========================================
  // Form Labels
  // ==========================================

  label_missing: {
    ruleId: 'label_missing',
    title: 'Add label to form input',
    description: 'Associate a visible label with the form control using the for attribute.',
    template: '<label for="{{inputId}}">{{labelText}}</label>\n<input type="{{inputType}}" id="{{inputId}}" name="{{inputName}}">',
    placeholders: [
      {
        key: 'inputId',
        label: 'Input ID',
        type: 'auto',
        autoGenerate: 'generateId',
      },
      {
        key: 'labelText',
        label: 'Label text',
        type: 'text',
        defaultValue: 'Label',
      },
      {
        key: 'inputType',
        label: 'Input type',
        type: 'auto',
        autoGenerate: 'getAttribute:type',
      },
      {
        key: 'inputName',
        label: 'Input name',
        type: 'auto',
        autoGenerate: 'getAttribute:name',
      },
    ],
    examples: [
      {
        before: '<input type="email" name="email">',
        after: '<label for="email-input">Email address</label>\n<input type="email" id="email-input" name="email">',
        explanation: 'Use a visible label element with a matching for attribute.',
      },
      {
        before: '<input type="text" placeholder="Enter name">',
        after: '<label for="name-input">Full name</label>\n<input type="text" id="name-input" placeholder="e.g., John Smith">',
        explanation: 'Placeholder is not a substitute for a label.',
      },
    ],
    wcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/',
  },

  label_empty: {
    ruleId: 'label_empty',
    title: 'Add text to label',
    description: 'Provide visible text content within the label element.',
    template: '<label for="{{forId}}">{{labelText}}</label>',
    placeholders: [
      {
        key: 'forId',
        label: 'For attribute',
        type: 'auto',
        autoGenerate: 'getAttribute:for',
      },
      {
        key: 'labelText',
        label: 'Label text',
        type: 'text',
        defaultValue: 'Label',
      },
    ],
    examples: [
      {
        before: '<label for="username"></label>',
        after: '<label for="username">Username</label>',
        explanation: 'Labels must have visible text content.',
      },
    ],
    wcagCriteria: ['3.3.2'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/',
  },

  // ==========================================
  // Links
  // ==========================================

  link_empty: {
    ruleId: 'link_empty',
    title: 'Add accessible name to link',
    description: 'Provide link text or aria-label to describe the link purpose.',
    template: '<a href="{{href}}"{{ariaLabel}}>{{linkText}}</a>',
    placeholders: [
      {
        key: 'href',
        label: 'Link URL',
        type: 'auto',
        autoGenerate: 'getAttribute:href',
      },
      {
        key: 'linkText',
        label: 'Link text',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'ariaLabel',
        label: 'Aria label',
        type: 'text',
        defaultValue: '',
      },
    ],
    examples: [
      {
        before: '<a href="/about"></a>',
        after: '<a href="/about">About us</a>',
        explanation: 'Add descriptive link text.',
      },
      {
        before: '<a href="/profile"><img src="avatar.png"></a>',
        after: '<a href="/profile" aria-label="View profile"><img src="avatar.png" alt=""></a>',
        explanation: 'Use aria-label when the link contains only an image.',
      },
    ],
    wcagCriteria: ['2.4.4', '4.1.2'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/html/H30',
  },

  link_ambiguous: {
    ruleId: 'link_ambiguous',
    title: 'Make link text more descriptive',
    description: 'Replace generic link text with descriptive text that indicates the destination.',
    template: '<a href="{{href}}">{{linkText}}</a>',
    placeholders: [
      {
        key: 'href',
        label: 'Link URL',
        type: 'auto',
        autoGenerate: 'getAttribute:href',
      },
      {
        key: 'linkText',
        label: 'Descriptive link text',
        type: 'text',
        defaultValue: '',
      },
    ],
    examples: [
      {
        before: '<a href="/pricing">Click here</a>',
        after: '<a href="/pricing">View pricing plans</a>',
        explanation: 'Avoid "click here", "read more", "learn more" without context.',
      },
      {
        before: 'To learn more, <a href="/docs">click here</a>.',
        after: '<a href="/docs">Read our documentation</a> to learn more.',
        explanation: 'Make the link text self-explanatory.',
      },
    ],
    wcagCriteria: ['2.4.4', '2.4.9'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context',
  },

  // ==========================================
  // Buttons
  // ==========================================

  button_empty: {
    ruleId: 'button_empty',
    title: 'Add accessible name to button',
    description: 'Provide button text, aria-label, or aria-labelledby for the button.',
    template: '<button type="{{buttonType}}"{{ariaLabel}}>{{buttonText}}</button>',
    placeholders: [
      {
        key: 'buttonType',
        label: 'Button type',
        type: 'auto',
        autoGenerate: 'getAttribute:type',
        defaultValue: 'button',
      },
      {
        key: 'buttonText',
        label: 'Button text',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'ariaLabel',
        label: 'Aria label',
        type: 'text',
        defaultValue: '',
      },
    ],
    examples: [
      {
        before: '<button><svg>...</svg></button>',
        after: '<button aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>',
        explanation: 'Icon buttons need aria-label to describe the action.',
      },
      {
        before: '<button class="hamburger"></button>',
        after: '<button class="hamburger" aria-label="Open menu" aria-expanded="false"></button>',
        explanation: 'Menu buttons should also indicate their expanded state.',
      },
    ],
    wcagCriteria: ['4.1.2', '2.4.4'],
    learnMoreUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  },

  // ==========================================
  // Headings
  // ==========================================

  heading_empty: {
    ruleId: 'heading_empty',
    title: 'Add content to heading',
    description: 'Provide text content for the heading element.',
    template: '<{{headingLevel}}>{{headingText}}</{{headingLevel}}>',
    placeholders: [
      {
        key: 'headingLevel',
        label: 'Heading level',
        type: 'auto',
        autoGenerate: 'getTagName',
      },
      {
        key: 'headingText',
        label: 'Heading text',
        type: 'text',
        defaultValue: 'Heading',
      },
    ],
    examples: [
      {
        before: '<h2></h2>',
        after: '<h2>Product Features</h2>',
        explanation: 'Headings must have text content.',
      },
    ],
    wcagCriteria: ['1.3.1', '2.4.6'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
  },

  heading_order: {
    ruleId: 'heading_order',
    title: 'Fix heading level order',
    description: 'Adjust heading level to maintain proper hierarchy without skipping levels.',
    template: '<{{correctLevel}}>{{headingText}}</{{correctLevel}}>',
    placeholders: [
      {
        key: 'correctLevel',
        label: 'Correct heading level',
        type: 'select',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      },
      {
        key: 'headingText',
        label: 'Heading text',
        type: 'auto',
        autoGenerate: 'getTextContent',
      },
    ],
    examples: [
      {
        before: '<h1>Page Title</h1>\n<h3>Section</h3>',
        after: '<h1>Page Title</h1>\n<h2>Section</h2>',
        explanation: 'Don\'t skip heading levels (h1 → h3). Use h2 after h1.',
      },
    ],
    wcagCriteria: ['1.3.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
  },

  // ==========================================
  // ARIA
  // ==========================================

  aria_hidden_focusable: {
    ruleId: 'aria_hidden_focusable',
    title: 'Fix aria-hidden on focusable element',
    description: 'Remove aria-hidden from focusable elements or make them non-focusable.',
    template: '{{fixedCode}}',
    placeholders: [
      {
        key: 'fixedCode',
        label: 'Fixed code',
        type: 'text',
        defaultValue: '',
      },
    ],
    examples: [
      {
        before: '<button aria-hidden="true">Close</button>',
        after: '<button>Close</button>',
        explanation: 'Remove aria-hidden if the element should be interactive.',
      },
      {
        before: '<a href="#" aria-hidden="true">Skip</a>',
        after: '<a href="#" tabindex="-1" aria-hidden="true">Skip</a>',
        explanation: 'Or add tabindex="-1" if it should be truly hidden.',
      },
    ],
    wcagCriteria: ['4.1.2'],
    learnMoreUrl: 'https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/',
  },

  aria_valid_attr: {
    ruleId: 'aria_valid_attr',
    title: 'Fix invalid ARIA attribute',
    description: 'Use a valid ARIA attribute name.',
    template: '{{fixedCode}}',
    placeholders: [
      {
        key: 'fixedCode',
        label: 'Fixed code',
        type: 'text',
        defaultValue: '',
      },
    ],
    examples: [
      {
        before: '<div aria-role="button">Click</div>',
        after: '<div role="button">Click</div>',
        explanation: 'Use "role" not "aria-role".',
      },
      {
        before: '<div aria-labelled="title">Content</div>',
        after: '<div aria-labelledby="title">Content</div>',
        explanation: 'Correct spelling: aria-labelledby (with "by").',
      },
    ],
    wcagCriteria: ['4.1.2'],
    learnMoreUrl: 'https://www.w3.org/TR/wai-aria-1.2/#state_prop_def',
  },

  // ==========================================
  // Document Structure
  // ==========================================

  title_missing: {
    ruleId: 'title_missing',
    title: 'Add page title',
    description: 'Add a descriptive title element to the document head.',
    template: '<title>{{pageTitle}}</title>',
    placeholders: [
      {
        key: 'pageTitle',
        label: 'Page title',
        type: 'text',
        defaultValue: 'Page Title',
      },
    ],
    examples: [
      {
        before: '<head>\n  <meta charset="UTF-8">\n</head>',
        after: '<head>\n  <meta charset="UTF-8">\n  <title>Contact Us - Acme Corp</title>\n</head>',
        explanation: 'Include a descriptive, unique title for each page.',
      },
    ],
    wcagCriteria: ['2.4.2'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/html/H25',
  },

  language_missing: {
    ruleId: 'language_missing',
    title: 'Add language attribute',
    description: 'Specify the language of the page using the lang attribute.',
    template: '<html lang="{{langCode}}">',
    placeholders: [
      {
        key: 'langCode',
        label: 'Language code',
        type: 'select',
        options: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'ru'],
        defaultValue: 'en',
      },
    ],
    examples: [
      {
        before: '<html>',
        after: '<html lang="en">',
        explanation: 'Use ISO 639-1 language codes (en, es, fr, de, etc.).',
      },
    ],
    wcagCriteria: ['3.1.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/html/H57',
  },

  // ==========================================
  // Contrast
  // ==========================================

  contrast_insufficient: {
    ruleId: 'contrast_insufficient',
    title: 'Improve color contrast',
    description: 'Adjust text or background color to meet minimum contrast ratio.',
    template: '{{element}} {\n  color: {{foreground}};\n  background-color: {{background}};\n}',
    placeholders: [
      {
        key: 'element',
        label: 'CSS selector',
        type: 'auto',
        autoGenerate: 'getSelector',
      },
      {
        key: 'foreground',
        label: 'Text color',
        type: 'text',
        defaultValue: '#000000',
      },
      {
        key: 'background',
        label: 'Background color',
        type: 'text',
        defaultValue: '#FFFFFF',
      },
    ],
    examples: [
      {
        before: 'color: #999999; /* on white */\n/* Contrast ratio: 2.85:1 */',
        after: 'color: #595959; /* on white */\n/* Contrast ratio: 7.0:1 */',
        explanation: 'Darken light text or lighten backgrounds to achieve 4.5:1 ratio.',
      },
    ],
    wcagCriteria: ['1.4.3', '1.4.6'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum',
  },

  // ==========================================
  // Target Size (WCAG 2.2)
  // ==========================================

  target_size_minimum: {
    ruleId: 'target_size_minimum',
    title: 'Increase target size',
    description: 'Ensure interactive elements are at least 24x24 CSS pixels.',
    template: '{{element}} {\n  min-width: 24px;\n  min-height: 24px;\n  padding: {{padding}};\n}',
    placeholders: [
      {
        key: 'element',
        label: 'CSS selector',
        type: 'auto',
        autoGenerate: 'getSelector',
      },
      {
        key: 'padding',
        label: 'Padding',
        type: 'text',
        defaultValue: '4px 8px',
      },
    ],
    examples: [
      {
        before: '.icon-btn {\n  width: 16px;\n  height: 16px;\n}',
        after: '.icon-btn {\n  min-width: 24px;\n  min-height: 24px;\n  padding: 4px;\n}',
        explanation: 'WCAG 2.2 requires targets to be at least 24x24 pixels.',
      },
    ],
    wcagCriteria: ['2.5.8'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum',
  },

  target_size_enhanced: {
    ruleId: 'target_size_enhanced',
    title: 'Increase target size to 44px',
    description: 'Ensure interactive elements are at least 44x44 CSS pixels for AAA compliance.',
    template: '{{element}} {\n  min-width: 44px;\n  min-height: 44px;\n}',
    placeholders: [
      {
        key: 'element',
        label: 'CSS selector',
        type: 'auto',
        autoGenerate: 'getSelector',
      },
    ],
    examples: [
      {
        before: '.touch-btn { width: 32px; height: 32px; }',
        after: '.touch-btn { min-width: 44px; min-height: 44px; }',
        explanation: 'AAA level requires 44x44 pixel touch targets.',
      },
    ],
    wcagCriteria: ['2.5.5'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced',
  },

  // ==========================================
  // Focus
  // ==========================================

  focus_not_visible: {
    ruleId: 'focus_not_visible',
    title: 'Add visible focus indicator',
    description: 'Ensure focused elements have a visible focus indicator.',
    template: '{{element}}:focus {\n  outline: 2px solid {{outlineColor}};\n  outline-offset: 2px;\n}',
    placeholders: [
      {
        key: 'element',
        label: 'CSS selector',
        type: 'auto',
        autoGenerate: 'getSelector',
      },
      {
        key: 'outlineColor',
        label: 'Outline color',
        type: 'text',
        defaultValue: '#005fcc',
      },
    ],
    examples: [
      {
        before: 'button:focus { outline: none; }',
        after: 'button:focus {\n  outline: 2px solid #005fcc;\n  outline-offset: 2px;\n}',
        explanation: 'Never remove focus outlines without providing an alternative.',
      },
    ],
    wcagCriteria: ['2.4.7'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible',
  },

  tabindex_positive: {
    ruleId: 'tabindex_positive',
    title: 'Remove positive tabindex',
    description: 'Use tabindex="0" or remove tabindex instead of positive values.',
    template: '<{{tagName}}{{attributes}} tabindex="0">',
    placeholders: [
      {
        key: 'tagName',
        label: 'Tag name',
        type: 'auto',
        autoGenerate: 'getTagName',
      },
      {
        key: 'attributes',
        label: 'Other attributes',
        type: 'auto',
        autoGenerate: 'preserveAttributes',
      },
    ],
    examples: [
      {
        before: '<div tabindex="5">Custom control</div>',
        after: '<div tabindex="0">Custom control</div>',
        explanation: 'Positive tabindex disrupts natural tab order. Use 0 instead.',
      },
    ],
    wcagCriteria: ['2.4.3'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/failures/F44',
  },

  // ==========================================
  // Tables
  // ==========================================

  table_missing_headers: {
    ruleId: 'table_missing_headers',
    title: 'Add table headers',
    description: 'Use th elements with scope attribute for table headers.',
    template: '<table>\n  <thead>\n    <tr>\n      <th scope="col">{{header1}}</th>\n      <th scope="col">{{header2}}</th>\n    </tr>\n  </thead>\n  <tbody>\n    <!-- Table rows -->\n  </tbody>\n</table>',
    placeholders: [
      {
        key: 'header1',
        label: 'First header',
        type: 'text',
        defaultValue: 'Column 1',
      },
      {
        key: 'header2',
        label: 'Second header',
        type: 'text',
        defaultValue: 'Column 2',
      },
    ],
    examples: [
      {
        before: '<table>\n  <tr><td>Name</td><td>Email</td></tr>\n  <tr><td>John</td><td>john@example.com</td></tr>\n</table>',
        after: '<table>\n  <thead>\n    <tr><th scope="col">Name</th><th scope="col">Email</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>John</td><td>john@example.com</td></tr>\n  </tbody>\n</table>',
        explanation: 'Use th with scope for header cells, organized in thead.',
      },
    ],
    wcagCriteria: ['1.3.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/tables/',
  },

  table_missing_caption: {
    ruleId: 'table_missing_caption',
    title: 'Add table caption',
    description: 'Provide a caption or accessible name for the table.',
    template: '<table>\n  <caption>{{captionText}}</caption>\n  <!-- Table content -->\n</table>',
    placeholders: [
      {
        key: 'captionText',
        label: 'Table caption',
        type: 'text',
        defaultValue: 'Table description',
      },
    ],
    examples: [
      {
        before: '<table>...</table>',
        after: '<table>\n  <caption>Quarterly sales figures for 2024</caption>\n  ...\n</table>',
        explanation: 'Caption provides context about the table\'s purpose.',
      },
    ],
    wcagCriteria: ['1.3.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/tables/caption-summary/',
  },

  // ==========================================
  // Lists
  // ==========================================

  list_misuse: {
    ruleId: 'list_misuse',
    title: 'Use proper list markup',
    description: 'Convert to semantic list elements (ul/ol with li children).',
    template: '<{{listType}}>\n  <li>{{item1}}</li>\n  <li>{{item2}}</li>\n</{{listType}}>',
    placeholders: [
      {
        key: 'listType',
        label: 'List type',
        type: 'select',
        options: ['ul', 'ol'],
        defaultValue: 'ul',
      },
      {
        key: 'item1',
        label: 'First item',
        type: 'text',
        defaultValue: 'Item 1',
      },
      {
        key: 'item2',
        label: 'Second item',
        type: 'text',
        defaultValue: 'Item 2',
      },
    ],
    examples: [
      {
        before: '<div>• Item 1</div>\n<div>• Item 2</div>',
        after: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>',
        explanation: 'Use semantic list markup instead of styled divs.',
      },
    ],
    wcagCriteria: ['1.3.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/html/H48',
  },

  // ==========================================
  // Landmarks
  // ==========================================

  landmark_missing: {
    ruleId: 'landmark_missing',
    title: 'Add landmark regions',
    description: 'Use semantic HTML5 elements or ARIA landmarks to define page regions.',
    template: '<{{landmark}}{{ariaLabel}}>\n  <!-- Content -->\n</{{landmark}}>',
    placeholders: [
      {
        key: 'landmark',
        label: 'Landmark element',
        type: 'select',
        options: ['main', 'nav', 'header', 'footer', 'aside', 'section'],
      },
      {
        key: 'ariaLabel',
        label: 'Aria label (for multiple nav/section)',
        type: 'text',
        defaultValue: '',
      },
    ],
    examples: [
      {
        before: '<div id="navigation">...</div>\n<div id="content">...</div>',
        after: '<nav aria-label="Main navigation">...</nav>\n<main>...</main>',
        explanation: 'Replace generic divs with semantic HTML5 landmarks.',
      },
    ],
    wcagCriteria: ['1.3.1', '2.4.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/tutorials/page-structure/regions/',
  },

  skip_link_missing: {
    ruleId: 'skip_link_missing',
    title: 'Add skip navigation link',
    description: 'Add a skip link to allow keyboard users to bypass repetitive content.',
    template: '<a href="#main-content" class="skip-link">Skip to main content</a>\n\n<!-- Navigation here -->\n\n<main id="main-content">\n  <!-- Main content -->\n</main>',
    placeholders: [],
    examples: [
      {
        before: '<nav>...</nav>\n<main>...</main>',
        after: '<a href="#main-content" class="skip-link">Skip to main content</a>\n<nav>...</nav>\n<main id="main-content">...</main>',
        explanation: 'Skip links help keyboard users bypass navigation.',
      },
    ],
    wcagCriteria: ['2.4.1'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Techniques/general/G1',
  },

  // ==========================================
  // Autocomplete
  // ==========================================

  autocomplete_missing: {
    ruleId: 'autocomplete_missing',
    title: 'Add autocomplete attribute',
    description: 'Add appropriate autocomplete value to help users complete forms.',
    template: '<input type="{{inputType}}" name="{{inputName}}" autocomplete="{{autocompleteValue}}">',
    placeholders: [
      {
        key: 'inputType',
        label: 'Input type',
        type: 'auto',
        autoGenerate: 'getAttribute:type',
      },
      {
        key: 'inputName',
        label: 'Input name',
        type: 'auto',
        autoGenerate: 'getAttribute:name',
      },
      {
        key: 'autocompleteValue',
        label: 'Autocomplete value',
        type: 'select',
        options: [
          'name', 'given-name', 'family-name', 'email', 'tel', 'street-address',
          'postal-code', 'country', 'cc-number', 'cc-exp', 'username', 'new-password',
          'current-password', 'one-time-code', 'organization', 'bday',
        ],
      },
    ],
    examples: [
      {
        before: '<input type="email" name="email">',
        after: '<input type="email" name="email" autocomplete="email">',
        explanation: 'autocomplete helps browsers and assistive tech auto-fill forms.',
      },
    ],
    wcagCriteria: ['1.3.5'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose',
  },

  // ==========================================
  // Media
  // ==========================================

  video_captions_missing: {
    ruleId: 'video_captions_missing',
    title: 'Add video captions',
    description: 'Provide a captions track for video content.',
    template: '<video controls>\n  <source src="{{videoSrc}}" type="video/mp4">\n  <track kind="captions" src="{{captionsSrc}}" srclang="{{language}}" label="{{label}}" default>\n</video>',
    placeholders: [
      {
        key: 'videoSrc',
        label: 'Video source',
        type: 'auto',
        autoGenerate: 'getAttribute:src',
      },
      {
        key: 'captionsSrc',
        label: 'Captions file (VTT)',
        type: 'text',
        defaultValue: 'captions.vtt',
      },
      {
        key: 'language',
        label: 'Language code',
        type: 'text',
        defaultValue: 'en',
      },
      {
        key: 'label',
        label: 'Track label',
        type: 'text',
        defaultValue: 'English',
      },
    ],
    examples: [
      {
        before: '<video src="video.mp4" controls></video>',
        after: '<video controls>\n  <source src="video.mp4" type="video/mp4">\n  <track kind="captions" src="captions.vtt" srclang="en" label="English" default>\n</video>',
        explanation: 'Use WebVTT format for caption files.',
      },
    ],
    wcagCriteria: ['1.2.2', '1.2.4'],
    learnMoreUrl: 'https://www.w3.org/WAI/media/av/captions/',
  },

  audio_autoplay: {
    ruleId: 'audio_autoplay',
    title: 'Remove autoplay or add controls',
    description: 'Remove autoplay attribute or provide pause/stop controls.',
    template: '<{{mediaType}} controls src="{{src}}">\n  Your browser does not support this media.\n</{{mediaType}}>',
    placeholders: [
      {
        key: 'mediaType',
        label: 'Media type',
        type: 'select',
        options: ['audio', 'video'],
      },
      {
        key: 'src',
        label: 'Source',
        type: 'auto',
        autoGenerate: 'getAttribute:src',
      },
    ],
    examples: [
      {
        before: '<audio autoplay src="music.mp3">',
        after: '<audio controls src="music.mp3">\n  Your browser does not support audio.\n</audio>',
        explanation: 'Remove autoplay and add controls for user control.',
      },
    ],
    wcagCriteria: ['1.4.2'],
    learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/audio-control',
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get quick fix for a rule ID
 */
export function getQuickFix(ruleId: string): QuickFix | undefined {
  return quickFixes[ruleId];
}

/**
 * Get all available quick fixes
 */
export function getAllQuickFixes(): QuickFix[] {
  return Object.values(quickFixes);
}

/**
 * Get quick fixes by WCAG criterion
 */
export function getQuickFixesByCriterion(criterionId: string): QuickFix[] {
  return Object.values(quickFixes).filter((fix) =>
    fix.wcagCriteria.includes(criterionId)
  );
}

/**
 * Check if a rule has a quick fix available
 */
export function hasQuickFix(ruleId: string): boolean {
  return ruleId in quickFixes;
}

/**
 * Get quick fix rule IDs
 */
export function getQuickFixRuleIds(): string[] {
  return Object.keys(quickFixes);
}

