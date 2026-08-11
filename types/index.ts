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
}

export interface Device {
  id: string;
  name: string;
  os: string;
  lastScan: string;
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

export interface PhishingAnalysisResult {
  threatScore: number;
  phishingProbability: number;
  suspiciousKeywords: string[];
  fakeDomainDetected: boolean;
  fakeDomains: string[];
  urlReputation: {
    url: string;
    score: number;
    status: "safe" | "suspicious" | "malicious";
  }[];
  aiExplanation: string;
  recommendedActions: string[];
  riskLevel: RiskLevel;
}

export interface MalwareScanResult {
  malwareRisk: number;
  fileReputation: "trusted" | "unknown" | "suspicious" | "malicious";
  virusDetected: boolean;
  detections: { engine: string; result: string }[];
  aiAnalysis: string;
  threatCategory: string;
  riskLevel: RiskLevel;
  hash?: string;
  fileName?: string;
}

export interface WebsiteScanResult {
  url: string;
  httpsStatus: boolean;
  sslInfo: {
    issuer: string;
    validFrom: string;
    validTo: string;
    grade: string;
    protocol: string;
  };
  domainReputation: number;
  certificateInfo: {
    subject: string;
    san: string[];
    signatureAlgorithm: string;
  };
  openPorts: { port: number; service: string; status: string }[];
  knownVulnerabilities: {
    cve: string;
    severity: RiskLevel;
    description: string;
  }[];
  securityRecommendations: string[];
  overallScore: number;
}

export interface ThreatIntelItem {
  id: string;
  name: string;
  type: "malware" | "ransomware" | "apt" | "phishing" | "botnet";
  severity: RiskLevel;
  description: string;
  firstSeen: string;
  lastSeen: string;
  countries?: string[];
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
