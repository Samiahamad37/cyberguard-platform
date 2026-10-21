export type RiskLevel = "critical" | "high" | "medium" | "low" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved" | "dismissed";
export type DeviceStatus = "online" | "offline" | "scanning" | "at_risk";
export type ScanStatus = "idle" | "scanning" | "completed" | "failed";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "analyst" | "viewer";
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface SecurityMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: "up" | "down" | "stable";
  riskLevel?: RiskLevel;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  status: AlertStatus;
  source: string;
  timestamp: string;
  category: string;
  resolvedAt?: string;
}

export interface DeviceScanResult {
  target: string;
  resolvedAddress?: string;
  reachable: boolean;
  checkedPorts: number[];
  openPorts: { port: number; service: string; risky: boolean }[];
  riskLevel: RiskLevel;
  scannedAt: string;
  durationMs: number;
  error?: string;
}

export interface Device {
  id: string;
  name: string;
  os: string;
  /** ISO timestamp of the last scan, or "" if never scanned. */
  lastScan: string;
  lastScanResult?: DeviceScanResult;
  status: DeviceStatus;
  riskLevel: RiskLevel;
  ipAddress: string;
  type: "desktop" | "laptop" | "mobile" | "server" | "iot";
}

export interface ThreatTimelineEvent {
  id: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  timestamp: string;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  threats?: number;
  blocked?: number;
  resolved?: number;
}

/** How a scan result was produced. "heuristic" = local rules only, no external lookups. */
export type AnalysisMethod = "heuristic" | "heuristic+threat-intel";

export interface PhishingAnalysisResult {
  threatScore: number;
  phishingProbability: number;
  suspiciousKeywords: string[];
  fakeDomainDetected: boolean;
  fakeDomains: string[];
  /** Only filled from real reputation sources (Google Safe Browsing / VirusTotal). */
  urlReputation: {
    url: string;
    source: string;
    status: "safe" | "suspicious" | "malicious" | "unknown";
    detail?: string;
  }[];
  /** Heuristic signals that contributed to the score. */
  signals: string[];
  aiExplanation: string;
  recommendedActions: string[];
  riskLevel: RiskLevel;
  analysisMethod: AnalysisMethod;
  sources: string[];
}

export interface MalwareScanResult {
  malwareRisk: number;
  fileReputation: "trusted" | "unknown" | "suspicious" | "malicious";
  virusDetected: boolean;
  /** Real antivirus engine verdicts (VirusTotal). Empty for heuristic-only analysis. */
  detections: { engine: string; result: string }[];
  engineStats?: { malicious: number; suspicious: number; harmless: number; undetected: number };
  signals: string[];
  aiAnalysis: string;
  threatCategory: string;
  riskLevel: RiskLevel;
  hash?: string;
  fileName?: string;
  analysisMethod: AnalysisMethod;
  sources: string[];
  /** Set when a lookup could not run because an optional API key is missing. */
  requiresApiKey?: string;
}

export interface SecurityHeaderCheck {
  name: string;
  present: boolean;
  value?: string;
}

export interface WebsiteFinding {
  id: string;
  title: string;
  severity: RiskLevel;
  description: string;
}

export interface WebsiteScanResult {
  url: string;
  finalUrl: string;
  httpStatus: number | null;
  scannedAt: string;
  httpsStatus: boolean;
  redirectsToHttps: boolean | null;
  sslInfo: {
    issuer: string;
    validFrom: string;
    validTo: string;
    daysRemaining: number | null;
    trusted: boolean;
    trustError?: string;
    grade: string;
    protocol: string;
  };
  certificateInfo: {
    subject: string;
    san: string[];
    /** Public key algorithm and size, e.g. "EC prime256v1" or "RSA 2048-bit". */
    signatureAlgorithm: string;
  };
  securityHeaders: SecurityHeaderCheck[];
  findings: WebsiteFinding[];
  /** Not scanned (empty). Kept for API compatibility. */
  openPorts: { port: number; service: string; status: string }[];
  /** Not scanned (empty). Kept for API compatibility. */
  knownVulnerabilities: {
    cve: string;
    severity: RiskLevel;
    description: string;
  }[];
  securityRecommendations: string[];
  overallScore: number;
  grade: string;
}

export interface ThreatIntelItem {
  id: string;
  name: string;
  type: "malware" | "ransomware" | "apt" | "phishing" | "botnet" | "vulnerability";
  severity: RiskLevel;
  description: string;
  firstSeen: string;
  lastSeen: string;
  countries?: string[];
  url?: string;
}

export interface HighRiskIP {
  ip: string;
  country: string;
  abuseScore: number;
  categories: string[];
  lastReported: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface SecurityReport {
  id: string;
  title: string;
  generatedAt: string;
  overallScore: number;
  threatSummary: string;
  riskAnalysis: string;
  recommendations: string[];
  alertsCount: Record<RiskLevel, number>;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  criticalOnly: boolean;
  weeklyDigest: boolean;
  threatIntelUpdates: boolean;
}

export interface SecurityPreferences {
  autoScan: boolean;
  realTimeProtection: boolean;
  quarantineSuspicious: boolean;
  shareAnonymousTelemetry: boolean;
}
