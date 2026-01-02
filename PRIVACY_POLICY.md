# Privacy Policy for TheWCAG Accessibility Evaluation Tool

**Last Updated:** December 2024

## Introduction

TheWCAG Accessibility Evaluation Tool ("we", "our", or "the Extension") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our Chrome browser extension.

## Data Collection and Usage

### What We Do NOT Collect

TheWCAG Accessibility Evaluation Tool **does NOT collect, store, transmit, or share** any of the following:

- ❌ Personally identifiable information (name, email, address, etc.)
- ❌ Health information
- ❌ Financial or payment information
- ❌ Authentication credentials (passwords, PINs, etc.)
- ❌ Personal communications (emails, messages, etc.)
- ❌ Location data (GPS, IP address, region)
- ❌ Web browsing history
- ❌ User activity tracking (clicks, keystrokes, mouse movements)
- ❌ Any data transmitted to external servers

### What We Access (Local Processing Only)

The extension requires access to website content **solely for the purpose of accessibility evaluation**. This includes:

- **Page Content**: HTML structure, CSS styles, ARIA attributes, and text content
- **Purpose**: To analyze web pages for WCAG 2.2 compliance and identify accessibility issues
- **Processing**: All analysis occurs **entirely within your browser** - no data leaves your device

### Local Storage

The extension uses Chrome's local storage API (`chrome.storage.sync`) to store:

- **User Preferences**: Ignore patterns, custom rules, site-specific settings
- **Export Preferences**: Preferred report formats and settings
- **Extension State**: UI preferences and panel states

**All stored data remains on your device** and is never transmitted to external servers.

## Permissions Explained

### activeTab
- **Purpose**: Access the currently active tab when you click the extension icon
- **Usage**: Reads page content to perform accessibility evaluation
- **Scope**: Only the tab you explicitly activate
- **Data**: Never transmitted externally

### contextMenus
- **Purpose**: Add "Evaluate this page with TheWCAG" to the right-click menu
- **Usage**: Provides alternative way to trigger accessibility evaluation
- **Data**: No data collection

### scripting
- **Purpose**: Inject evaluation scripts into web pages
- **Usage**: Analyzes DOM structure, CSS, and accessibility attributes
- **Processing**: All analysis happens locally in your browser

### webNavigation
- **Purpose**: Detect page navigation and reloads
- **Usage**: Reset extension state when pages change
- **Data**: No data collection or transmission

### storage
- **Purpose**: Save your preferences and settings
- **Usage**: Stores ignore patterns, custom rules, and UI preferences
- **Location**: Local storage only (chrome.storage.sync)
- **Data**: Never transmitted externally

### Host Permissions (http://*/*, https://*/*, file:///*)
- **Purpose**: Access page content for accessibility evaluation
- **Usage**: Required to read DOM, CSS, and content for WCAG analysis
- **Scope**: Only when you explicitly activate the extension
- **Processing**: All evaluation occurs locally
- **Transmission**: No page content or data is sent to external servers

## Third-Party Services

TheWCAG Accessibility Evaluation Tool **does not use** any:

- Analytics services
- Tracking services
- Advertising networks
- Third-party data processors
- External APIs (except for optional GitHub repository links in documentation)

## Data Sharing and Disclosure

**We do NOT:**
- Sell user data to third parties
- Transfer user data to third parties
- Use data for purposes unrelated to accessibility evaluation
- Use data for creditworthiness or lending purposes
- Share data with advertisers or marketers

**All data processing occurs locally on your device.**

## User Control

You have full control over:

- **Settings**: Customize ignore patterns, custom rules, and preferences
- **Data Storage**: All preferences stored locally can be cleared via Chrome settings
- **Extension Usage**: The extension only runs when you explicitly activate it
- **Data Export**: You can export evaluation reports, but this is a local action

## Security

- All processing occurs locally in your browser
- No network transmission of page content or user data
- No external server communication for evaluation purposes
- Settings stored using Chrome's secure storage API

## Children's Privacy

TheWCAG Accessibility Evaluation Tool is not intended for children under 13. We do not knowingly collect any information from children.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of the extension after changes constitutes acceptance of the updated policy.

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) requirements

## Contact Information

For questions, concerns, or requests regarding this Privacy Policy or data practices:

- **GitHub Repository**: [https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool](https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool)
- **Issues**: [https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool/issues](https://github.com/WOLFIEEEE/TheWCAG-Accessibility-Evaluation-Tool/issues)

## Summary

**In simple terms:**
- ✅ All accessibility evaluation happens in your browser
- ✅ Your preferences are stored locally on your device
- ✅ No data is sent to external servers
- ✅ No tracking or analytics
- ✅ No third-party data sharing
- ✅ You control when the extension runs

TheWCAG Accessibility Evaluation Tool is designed with privacy as a core principle. We believe accessibility evaluation should be private, secure, and under your control.

---

*This privacy policy is effective as of the date listed above and applies to all versions of TheWCAG Accessibility Evaluation Tool.*

