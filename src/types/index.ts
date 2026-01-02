// ============================================
// TheWCAG Evaluation Extension - Type Definitions
// Complete type system for the extension
// ============================================

// ============================================
// Messaging Types
// ============================================

export type MessageAction =
  | 'runWCAG'
  | 'resetTab'
  | 'resetEvaluation'
  | 'toggleStyles'
  | 'toggleIcons'
  | 'getResults'
  | 'getNavigationOrder'
  | 'showNavOrder'
  | 'scrollToNavIcon'
  | 'toggleGroup'
  | 'toggleType'
  | 'hoverHighlight'
  | 'iconClickAction'
  | 'contrastIconDetails'
  | 'setCurrentTab'
  | 'evaluationComplete'
  | 'resultsReceived'
  | 'setExtensionUrl'
  | 'getExtensionUrl'
  | 'evaluationResults'
  | 'outlineData'
  | 'navigationData'
  | 'contrastData'
  | 'showTooltip'
  | 'sidebarLoaded'
  | 'highlightElement'
  | 'getOutline'
  | 'desaturatePage'
  | 'inspectElement'
  | 'getSettings'
  | 'saveSettings'
  | 'getComplianceReport'
  | 'complianceData'
  | 'getScreenReaderPreview'
  | 'screenReaderData'
  | 'getQuickFix'
  | 'quickFixData';

export interface Message<T = any> {
  action: string;
  data?: T;
  tabId?: number;
}

export interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface PortMessage<T = any> {
  name: string;
  action: MessageAction;
  data?: T;
  tabId?: number;
}

// ============================================
// Sidebar Types
// ============================================

export type SidebarTab =
  | 'details'
  | 'reference'
  | 'navigation'
  | 'structure'
  | 'contrast'
  | 'order'
  | 'compliance'
  | 'settings';

export interface ContrastSettings {
  foreground: string;
  background: string;
  alpha: number;
  textSize: 'normal' | 'large';
}

export interface SidebarState {
  currentTab?: SidebarTab;
  activeTab: SidebarTab;
  isOpen?: boolean;
  isLoading: boolean;
  stylesEnabled: boolean;
  iconsVisible?: boolean;
  results: EvaluationResults | null;
  selectedIcon: any | null;
  contrastSettings?: ContrastSettings;
  error?: string | null;
}

export interface RuleResultGroup {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  items: RuleResult[];
  count: number;
}

export interface HeadingInfo {
  level: number;
  text: string;
  selector: string;
  hasError: boolean;
  errorMessage?: string;
}

export interface LandmarkInfo {
  role: string;
  label?: string;
  selector: string;
}

export interface NavigationItem {
  index: number;
  tagName: string;
  type?: string;
  text: string;
  tabIndex: number;
  isNative: boolean;
  selector: string;
  element?: Element;
  role?: string;
  accessibleName?: string;
}

// ============================================
// Rule Types
// ============================================

export type RuleCategory = 'error' | 'alert' | 'feature' | 'structure' | 'aria' | 'contrast';

export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor' | 'none';

export type WcagLevel = 'A' | 'AA' | 'AAA';

export interface WcagGuideline {
  id: string;
  name: string;
  level: WcagLevel;
  url?: string;
}

export interface RuleDocumentation {
  summary: string;
  purpose: string;
  actions: string[];
  algorithm: string;
  guidelines: WcagGuideline[];
}

export interface AccessibilityRule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  impact: ImpactLevel;
  wcagCriteria: string[];
  wcagLevel: WcagLevel;
  tags: string[];
  evaluate: (element: Element, context: EvaluationContext) => RuleResult | null;
  documentation: RuleDocumentation;
}

export interface EvaluationContext {
  document: Document;
  options?: EvaluationOptions;
}

export interface EvaluationOptions {
  categories?: RuleCategory[];
  tags?: string[];
  wcagLevel?: WcagLevel;
  includeHidden?: boolean;
}

// ============================================
// Result Types
// ============================================

export interface RuleResult {
  ruleId: string;
  category: RuleCategory;
  element: Element;
  selector: string;
  xpath: string;
  message: string;
  impact: ImpactLevel;
  data?: Record<string, any>;
}

export interface EvaluationSummary {
  aimScore?: number;
  errors: number;
  alerts: number;
  features: number;
  structure: number;
  aria: number;
  contrastErrors: number;
}

export interface EvaluationResults {
  success: boolean;
  timestamp: number;
  url: string;
  title: string;
  categories: {
    error: RuleResult[];
    errors?: RuleResult[]; // Alias for compatibility
    alert: RuleResult[];
    alerts?: RuleResult[]; // Alias for compatibility
    feature: RuleResult[];
    features?: RuleResult[]; // Alias for compatibility
    structure: RuleResult[];
    aria: RuleResult[];
    contrast: RuleResult[];
  };
  statistics: EvaluationStatistics;
  summary: EvaluationSummary;
  aimScore: number;
}

export interface EvaluationStatistics {
  totalElements: number;
  pageTitle: string;
  errors: number;
  alerts: number;
  features: number;
  structure: number;
  aria: number;
  contrast: number;
  totalIssues: number;
}

// ============================================
// Icon Types
// ============================================

export interface IconInfo {
  id: string;
  name: string;
  category: RuleCategory;
  iconPath: string;
  description: string;
}

export interface IconPosition {
  top: number;
  left: number;
  element: Element;
}

export interface IconInstance {
  rule: AccessibilityRule;
  result: RuleResult;
  position: IconPosition;
  visible: boolean;
}

// ============================================
// Tab/Extension State Types
// ============================================

export interface TabState {
  tabId: number;
  isActive: boolean;
  hasResults: boolean;
  results?: EvaluationResults;
  sidebarState: SidebarState;
}

export interface ExtensionState {
  tabs?: Map<number, TabState>;
  activeTabId?: number;
  activeTabs: Set<number>;
  injectedTabs: Set<number>;
  sidebarLoadedTabs: Set<number>;
}

// ============================================
// Additional Types for Analyzer
// ============================================

export interface TooltipData {
  ruleId: string;
  title: string;
  description: string;
  impact: ImpactLevel;
  element: Element;
  position: { x: number; y: number };
}

export interface RuleResultItem extends RuleResult {
  index: number;
  visible: boolean;
}

// ============================================
// Color/Contrast Types
// ============================================

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface ContrastResult {
  ratio: number;
  foreground: RgbColor;
  background: RgbColor;
  passesAA: boolean;
  passesAAA: boolean;
  isLargeText: boolean;
}

// ============================================
// Navigation Order Types
// ============================================

export interface NavigationOrderItem {
  index: number;
  element: Element;
  tagName: string;
  type?: string;
  text: string;
  tabIndex: number;
  isNative: boolean;
}

export interface NavigationOrder {
  items: NavigationOrderItem[];
  totalCount: number;
}

// ============================================
// Outline/Structure Types
// ============================================

export interface HeadingOutlineItem {
  level: number;
  text: string;
  element: Element;
  hasError: boolean;
  errorMessage?: string;
}

export interface LandmarkOutlineItem {
  role: string;
  label?: string;
  element: Element;
}

export interface PageOutline {
  headings: HeadingOutlineItem[];
  landmarks: LandmarkOutlineItem[];
  regions: LandmarkOutlineItem[];
}

// ============================================
// Event Types
// ============================================

export interface ExtensionEvent {
  type: string;
  timestamp: number;
  data?: any;
}

export interface IconClickEvent extends ExtensionEvent {
  type: 'iconClick';
  data: {
    ruleId: string;
    element: Element;
    result: RuleResult;
  };
}

export interface ResultHoverEvent extends ExtensionEvent {
  type: 'resultHover';
  data: {
    ruleId: string;
    element: Element;
    highlight: boolean;
  };
}

// ============================================
// Config Types
// ============================================

export interface ExtensionConfig {
  debug: boolean;
  extensionUrl: string;
  platform: 'extension';
  browser: 'chrome' | 'firefox' | 'edge';
  isSidebar: boolean;
}

// ============================================
// DOM Utility Types
// ============================================

export interface ElementInfo {
  tagName: string;
  id?: string;
  classes: string[];
  attributes: Record<string, string>;
  textContent: string;
  accessibleName: string;
  role?: string;
  isVisible: boolean;
  isInteractive: boolean;
}

export interface BoundingRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

// ============================================
// Ignore List Types
// ============================================

export type IgnorePatternType = 'selector' | 'domain' | 'rule' | 'element';

export interface IgnorePattern {
  id: string;
  type: IgnorePatternType;
  pattern: string;
  reason?: string;
  createdAt: number;
  enabled: boolean;
}

// ============================================
// Custom Rule Types
// ============================================

export type CustomRuleCondition = 
  | 'exists' 
  | 'not-exists' 
  | 'attribute-equals' 
  | 'attribute-contains' 
  | 'attribute-missing'
  | 'text-contains'
  | 'text-empty';

export interface CustomRule {
  id: string;
  name: string;
  category: RuleCategory;
  selector: string;
  condition: CustomRuleCondition;
  conditionValue?: string;
  attribute?: string;
  message: string;
  impact: ImpactLevel;
  enabled: boolean;
  createdAt: number;
}

// ============================================
// Site Profile Types
// ============================================

export interface SiteProfile {
  domain: string;
  ignorePatterns: string[];
  customRules: string[];
  lastUsed: number;
}

// ============================================
// Extension Settings Types
// ============================================

export interface ExtensionSettings {
  ignorePatterns: IgnorePattern[];
  customRules: CustomRule[];
  siteProfiles: SiteProfile[];
  globalIgnoreEnabled: boolean;
  defaultWcagLevel: WcagLevel;
  showNewIn22Badge: boolean;
}

// ============================================
// WCAG 2.2 Compliance Types
// ============================================

export type WcagPrinciple = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

export type AutomationLevel = 'full' | 'partial' | 'manual';

export interface WcagCriterion {
  id: string;
  name: string;
  level: WcagLevel;
  principle: WcagPrinciple;
  guideline: string;
  description: string;
  url: string;
  techniques: string[];
  relatedRules: string[];
  canAutomate: AutomationLevel;
  isNew22: boolean;
}

export type CriterionStatus = 'passed' | 'failed' | 'manual' | 'not-applicable' | 'not-tested';

export interface ComplianceResult {
  criterion: WcagCriterion;
  status: CriterionStatus;
  issueCount: number;
  issues: RuleResult[];
  notes?: string;
}

export interface ComplianceReport {
  wcagVersion: '2.2';
  targetLevel: WcagLevel;
  timestamp: number;
  url: string;
  results: ComplianceResult[];
  summary: {
    passed: number;
    failed: number;
    manual: number;
    notApplicable: number;
    total: number;
    percentage: number;
  };
}

// ============================================
// Screen Reader Preview Types
// ============================================

export type ScreenReaderNodeType = 
  | 'landmark' 
  | 'heading' 
  | 'link' 
  | 'button' 
  | 'form' 
  | 'image' 
  | 'list' 
  | 'table' 
  | 'text'
  | 'navigation'
  | 'region';

export interface AccessibleNode {
  role: string;
  name: string;
  description?: string;
  value?: string;
  states: string[];
  properties: Record<string, string>;
  level?: number;
  children: AccessibleNode[];
  selector: string;
  issues: string[];
}

export interface ScreenReaderOutput {
  type: ScreenReaderNodeType;
  content: string;
  announcement: string;
  selector: string;
  depth: number;
  hasIssue: boolean;
  issueMessage?: string;
}

// ============================================
// Quick Fix Types
// ============================================

export type PlaceholderType = 'text' | 'select' | 'auto';

export interface FixPlaceholder {
  key: string;
  label: string;
  type: PlaceholderType;
  options?: string[];
  defaultValue?: string;
  autoGenerate?: string; // Function name to call
}

export interface FixExample {
  before: string;
  after: string;
  explanation: string;
}

export interface QuickFix {
  ruleId: string;
  title: string;
  description: string;
  template: string;
  placeholders: FixPlaceholder[];
  examples: FixExample[];
  wcagCriteria: string[];
  learnMoreUrl: string;
}

export interface GeneratedFix {
  ruleId: string;
  currentCode: string;
  suggestedCode: string;
  placeholders: Record<string, string>;
  canAutocomplete: boolean;
}
