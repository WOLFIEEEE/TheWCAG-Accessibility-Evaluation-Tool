// ============================================
// TheWCAG Evaluation Extension - Settings Manager
// Manages extension settings with Chrome storage
// ============================================

import {
  ExtensionSettings,
  IgnorePattern,
  CustomRule,
  SiteProfile,
  WcagLevel,
} from '../types';

// ============================================
// Default Settings
// ============================================

const DEFAULT_SETTINGS: ExtensionSettings = {
  ignorePatterns: [],
  customRules: [],
  siteProfiles: [],
  globalIgnoreEnabled: true,
  defaultWcagLevel: 'AA',
  showNewIn22Badge: true,
};

// Storage key
const STORAGE_KEY = 'thewcag_settings';

// ============================================
// Settings Cache
// ============================================

let settingsCache: ExtensionSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds

// ============================================
// Core Functions
// ============================================

/**
 * Load settings from Chrome storage
 */
export async function loadSettings(): Promise<ExtensionSettings> {
  // Check cache first
  if (settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return settingsCache;
  }

  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];

    if (stored) {
      // Merge with defaults to ensure all fields exist
      settingsCache = { ...DEFAULT_SETTINGS, ...stored };
    } else {
      settingsCache = { ...DEFAULT_SETTINGS };
    }

    cacheTimestamp = Date.now();
    return settingsCache as ExtensionSettings;
  } catch (error) {
    console.error('TheWCAG: Failed to load settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save settings to Chrome storage
 */
export async function saveSettings(settings: ExtensionSettings): Promise<boolean> {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
    settingsCache = settings;
    cacheTimestamp = Date.now();
    return true;
  } catch (error) {
    console.error('TheWCAG: Failed to save settings:', error);
    return false;
  }
}

/**
 * Clear the settings cache
 */
export function clearCache(): void {
  settingsCache = null;
  cacheTimestamp = 0;
}

// ============================================
// Ignore Pattern Functions
// ============================================

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a new ignore pattern
 */
export async function addIgnorePattern(
  pattern: Omit<IgnorePattern, 'id' | 'createdAt'>
): Promise<IgnorePattern> {
  const settings = await loadSettings();

  const newPattern: IgnorePattern = {
    ...pattern,
    id: generateId(),
    createdAt: Date.now(),
  };

  settings.ignorePatterns.push(newPattern);
  await saveSettings(settings);

  return newPattern;
}

/**
 * Update an existing ignore pattern
 */
export async function updateIgnorePattern(
  id: string,
  updates: Partial<Omit<IgnorePattern, 'id' | 'createdAt'>>
): Promise<boolean> {
  const settings = await loadSettings();
  const index = settings.ignorePatterns.findIndex((p) => p.id === id);

  if (index === -1) return false;

  settings.ignorePatterns[index] = {
    ...settings.ignorePatterns[index],
    ...updates,
  };

  return saveSettings(settings);
}

/**
 * Remove an ignore pattern
 */
export async function removeIgnorePattern(id: string): Promise<boolean> {
  const settings = await loadSettings();
  const initialLength = settings.ignorePatterns.length;

  settings.ignorePatterns = settings.ignorePatterns.filter((p) => p.id !== id);

  if (settings.ignorePatterns.length === initialLength) return false;

  // Also remove from site profiles
  settings.siteProfiles.forEach((profile) => {
    profile.ignorePatterns = profile.ignorePatterns.filter((pid) => pid !== id);
  });

  return saveSettings(settings);
}

/**
 * Get all enabled ignore patterns
 */
export async function getEnabledIgnorePatterns(): Promise<IgnorePattern[]> {
  const settings = await loadSettings();
  if (!settings.globalIgnoreEnabled) return [];
  return settings.ignorePatterns.filter((p) => p.enabled);
}

// ============================================
// Custom Rule Functions
// ============================================

/**
 * Add a new custom rule
 */
export async function addCustomRule(
  rule: Omit<CustomRule, 'id' | 'createdAt'>
): Promise<CustomRule> {
  const settings = await loadSettings();

  const newRule: CustomRule = {
    ...rule,
    id: generateId(),
    createdAt: Date.now(),
  };

  settings.customRules.push(newRule);
  await saveSettings(settings);

  return newRule;
}

/**
 * Update an existing custom rule
 */
export async function updateCustomRule(
  id: string,
  updates: Partial<Omit<CustomRule, 'id' | 'createdAt'>>
): Promise<boolean> {
  const settings = await loadSettings();
  const index = settings.customRules.findIndex((r) => r.id === id);

  if (index === -1) return false;

  settings.customRules[index] = {
    ...settings.customRules[index],
    ...updates,
  };

  return saveSettings(settings);
}

/**
 * Remove a custom rule
 */
export async function removeCustomRule(id: string): Promise<boolean> {
  const settings = await loadSettings();
  const initialLength = settings.customRules.length;

  settings.customRules = settings.customRules.filter((r) => r.id !== id);

  if (settings.customRules.length === initialLength) return false;

  // Also remove from site profiles
  settings.siteProfiles.forEach((profile) => {
    profile.customRules = profile.customRules.filter((rid) => rid !== id);
  });

  return saveSettings(settings);
}

/**
 * Get all enabled custom rules
 */
export async function getEnabledCustomRules(): Promise<CustomRule[]> {
  const settings = await loadSettings();
  return settings.customRules.filter((r) => r.enabled);
}

// ============================================
// Site Profile Functions
// ============================================

/**
 * Get site profile for a domain
 */
export async function getSiteProfile(domain: string): Promise<SiteProfile | null> {
  const settings = await loadSettings();
  return settings.siteProfiles.find((p) => p.domain === domain) || null;
}

/**
 * Create or update site profile
 */
export async function updateSiteProfile(
  domain: string,
  updates: Partial<Omit<SiteProfile, 'domain'>>
): Promise<SiteProfile> {
  const settings = await loadSettings();
  let profile = settings.siteProfiles.find((p) => p.domain === domain);

  if (profile) {
    Object.assign(profile, updates, { lastUsed: Date.now() });
  } else {
    profile = {
      domain,
      ignorePatterns: updates.ignorePatterns || [],
      customRules: updates.customRules || [],
      lastUsed: Date.now(),
    };
    settings.siteProfiles.push(profile);
  }

  await saveSettings(settings);
  return profile;
}

/**
 * Remove site profile
 */
export async function removeSiteProfile(domain: string): Promise<boolean> {
  const settings = await loadSettings();
  const initialLength = settings.siteProfiles.length;

  settings.siteProfiles = settings.siteProfiles.filter((p) => p.domain !== domain);

  if (settings.siteProfiles.length === initialLength) return false;

  return saveSettings(settings);
}

/**
 * Get ignore patterns for a specific site
 */
export async function getIgnorePatternsForSite(domain: string): Promise<IgnorePattern[]> {
  const settings = await loadSettings();
  if (!settings.globalIgnoreEnabled) return [];

  const profile = settings.siteProfiles.find((p) => p.domain === domain);
  const globalPatterns = settings.ignorePatterns.filter((p) => p.enabled);

  if (!profile) return globalPatterns;

  // Filter to patterns in the site profile
  const sitePatternIds = new Set(profile.ignorePatterns);
  return globalPatterns.filter(
    (p) => p.type === 'domain' || sitePatternIds.has(p.id)
  );
}

/**
 * Get custom rules for a specific site
 */
export async function getCustomRulesForSite(domain: string): Promise<CustomRule[]> {
  const settings = await loadSettings();
  const profile = settings.siteProfiles.find((p) => p.domain === domain);
  const allRules = settings.customRules.filter((r) => r.enabled);

  if (!profile) return allRules;

  const siteRuleIds = new Set(profile.customRules);
  return allRules.filter((r) => siteRuleIds.has(r.id));
}

// ============================================
// Import/Export Functions
// ============================================

/**
 * Export settings as JSON string
 */
export async function exportSettings(): Promise<string> {
  const settings = await loadSettings();
  return JSON.stringify(settings, null, 2);
}

/**
 * Import settings from JSON string
 */
export async function importSettings(json: string): Promise<boolean> {
  try {
    const imported = JSON.parse(json) as Partial<ExtensionSettings>;

    // Validate structure
    if (typeof imported !== 'object' || imported === null) {
      throw new Error('Invalid settings format');
    }

    const settings = await loadSettings();

    // Merge imported settings
    if (Array.isArray(imported.ignorePatterns)) {
      // Add new patterns, avoiding duplicates by pattern
      const existingPatterns = new Set(settings.ignorePatterns.map((p) => p.pattern));
      imported.ignorePatterns.forEach((p) => {
        if (!existingPatterns.has(p.pattern)) {
          settings.ignorePatterns.push({
            ...p,
            id: generateId(),
            createdAt: Date.now(),
          });
        }
      });
    }

    if (Array.isArray(imported.customRules)) {
      const existingRules = new Set(settings.customRules.map((r) => r.name));
      imported.customRules.forEach((r) => {
        if (!existingRules.has(r.name)) {
          settings.customRules.push({
            ...r,
            id: generateId(),
            createdAt: Date.now(),
          });
        }
      });
    }

    if (typeof imported.globalIgnoreEnabled === 'boolean') {
      settings.globalIgnoreEnabled = imported.globalIgnoreEnabled;
    }

    if (imported.defaultWcagLevel) {
      settings.defaultWcagLevel = imported.defaultWcagLevel;
    }

    return saveSettings(settings);
  } catch (error) {
    console.error('TheWCAG: Failed to import settings:', error);
    return false;
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<boolean> {
  return saveSettings({ ...DEFAULT_SETTINGS });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get WCAG level setting
 */
export async function getDefaultWcagLevel(): Promise<WcagLevel> {
  const settings = await loadSettings();
  return settings.defaultWcagLevel;
}

/**
 * Set WCAG level setting
 */
export async function setDefaultWcagLevel(level: WcagLevel): Promise<boolean> {
  const settings = await loadSettings();
  settings.defaultWcagLevel = level;
  return saveSettings(settings);
}

/**
 * Toggle global ignore
 */
export async function toggleGlobalIgnore(enabled: boolean): Promise<boolean> {
  const settings = await loadSettings();
  settings.globalIgnoreEnabled = enabled;
  return saveSettings(settings);
}

/**
 * Get settings statistics
 */
export async function getSettingsStats(): Promise<{
  ignorePatterns: number;
  customRules: number;
  siteProfiles: number;
}> {
  const settings = await loadSettings();
  return {
    ignorePatterns: settings.ignorePatterns.length,
    customRules: settings.customRules.length,
    siteProfiles: settings.siteProfiles.length,
  };
}

