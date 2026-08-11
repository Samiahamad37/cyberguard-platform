import type {
  Alert,
  ChartDataPoint,
  Device,
  SecurityMetric,
  ThreatTimelineEvent,
} from "@/types";

export const securityScore = 78;

export const dashboardMetrics: SecurityMetric[] = [
  { label: "Security Score", value: 78, change: 4, trend: "up" },
  { label: "Active Threats", value: 12, change: -3, trend: "down", riskLevel: "high" },
  { label: "Protected Devices", value: 8, change: 1, trend: "up" },
  { label: "Risk Level", value: "Medium", riskLevel: "medium" },
];

export const recentAlerts: Alert[] = [
  {
    id: "alt-001",
    title: "Suspicious login from new location",
    description: "Login attempt detected from São Paulo, BR using unrecognized device.",
    riskLevel: "high",
    status: "open",
    source: "Identity Protection",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    category: "Authentication",
  },
  {
    id: "alt-002",
    title: "Phishing email blocked",
    description: "Credential-harvesting message mimicking Microsoft 365 sign-in.",
    riskLevel: "critical",
    status: "acknowledged",
    source: "Email Gateway",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    category: "Phishing",
  },
  {
    id: "alt-003",
    title: "Outdated SSL certificate detected",
    description: "portal.acme-internal.dev certificate expires in 6 days.",
    riskLevel: "medium",
    status: "open",
    source: "Website Scanner",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    category: "Infrastructure",
  },
  {
    id: "alt-004",
    title: "Malware signature match",
    description: "Trojan.GenericKD.48291 quarantined on LAPTOP-DEV-04.",
    riskLevel: "critical",
    status: "resolved",
    source: "Endpoint Protection",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    category: "Malware",
  },
  {
    id: "alt-005",
    title: "Unusual outbound traffic",
    description: "Device DESKTOP-SOC-01 contacted high-risk IP 185.220.101.42.",
    riskLevel: "high",
    status: "open",
    source: "Network Monitor",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    category: "Network",
  },
];

export const threatTimeline: ThreatTimelineEvent[] = [
  {
    id: "tl-1",
    title: "Ransomware campaign surge",
    description: "LockBit variant activity up 34% in the last 24 hours.",
    riskLevel: "critical",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "tl-2",
    title: "Credential stuffing wave",
    description: "2,400 failed auth attempts blocked across corporate SSO.",
    riskLevel: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "tl-3",
    title: "Zero-day advisory",
    description: "CVE-2024-XXXX actively exploited in the wild — patch recommended.",
    riskLevel: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "tl-4",
    title: "Phishing kit takedown",
    description: "Hosting provider removed 12 malicious domains used in BEC campaigns.",
    riskLevel: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

export const activityChartData: ChartDataPoint[] = [
  { name: "Mon", threats: 18, blocked: 42, resolved: 15 },
  { name: "Tue", threats: 24, blocked: 51, resolved: 20 },
  { name: "Wed", threats: 14, blocked: 38, resolved: 22 },
  { name: "Thu", threats: 31, blocked: 67, resolved: 28 },
  { name: "Fri", threats: 22, blocked: 55, resolved: 19 },
  { name: "Sat", threats: 9, blocked: 21, resolved: 11 },
  { name: "Sun", threats: 12, blocked: 29, resolved: 14 },
];

export const riskDistribution: ChartDataPoint[] = [
  { name: "Critical", value: 4 },
  { name: "High", value: 11 },
  { name: "Medium", value: 23 },
  { name: "Low", value: 48 },
];

export const mockDevices: Device[] = [
  {
    id: "dev-001",
    name: "LAPTOP-CEO-01",
    os: "Windows 11 Pro",
    lastScan: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "online",
    riskLevel: "low",
    ipAddress: "10.0.1.24",
    type: "laptop",
  },
  {
    id: "dev-002",
    name: "DESKTOP-SOC-01",
    os: "Windows 11 Enterprise",
    lastScan: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: "at_risk",
    riskLevel: "high",
    ipAddress: "10.0.1.88",
    type: "desktop",
  },
  {
    id: "dev-003",
    name: "MBP-ENG-07",
    os: "macOS Sequoia",
    lastScan: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: "online",
    riskLevel: "low",
    ipAddress: "10.0.2.15",
    type: "laptop",
  },
  {
    id: "dev-004",
    name: "SERVER-WEB-02",
    os: "Ubuntu 22.04 LTS",
    lastScan: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "scanning",
    riskLevel: "medium",
    ipAddress: "10.0.0.12",
    type: "server",
  },
  {
    id: "dev-005",
    name: "IPHONE-14-MK",
    os: "iOS 18.2",
    lastScan: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    status: "offline",
    riskLevel: "low",
    ipAddress: "10.0.3.41",
    type: "mobile",
  },
  {
    id: "dev-006",
    name: "IOT-CAM-LOBBY",
    os: "Embedded Linux",
    lastScan: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
    status: "at_risk",
    riskLevel: "critical",
    ipAddress: "10.0.4.7",
    type: "iot",
  },
];
