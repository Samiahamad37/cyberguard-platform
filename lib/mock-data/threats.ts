import type {
  Alert,
  HighRiskIP,
  SecurityReport,
  ThreatIntelItem,
} from "@/types";

export const latestThreats: ThreatIntelItem[] = [
  {
    id: "ti-001",
    name: "LockBit 4.0",
    type: "ransomware",
    severity: "critical",
    description:
      "Updated ransomware-as-a-service variant targeting enterprise Windows environments via phishing and RDP brute force.",
    firstSeen: "2024-11-12",
    lastSeen: new Date().toISOString(),
    countries: ["US", "DE", "GB", "AU"],
  },
  {
    id: "ti-002",
    name: "Emotet Reloaded",
    type: "malware",
    severity: "high",
    description:
      "Banking trojan resurfacing through malicious Office macros and thread-hijacked email replies.",
    firstSeen: "2024-09-03",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    countries: ["US", "FR", "JP"],
  },
  {
    id: "ti-003",
    name: "APT29 Phishing Wave",
    type: "apt",
    severity: "critical",
    description:
      "Spear-phishing campaign impersonating cloud vendors to harvest OAuth tokens.",
    firstSeen: "2025-01-18",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    countries: ["US", "CA", "NL"],
  },
  {
    id: "ti-004",
    name: "QakBot Infrastructure",
    type: "botnet",
    severity: "high",
    description:
      "New C2 clusters observed distributing loaders for secondary payloads.",
    firstSeen: "2024-12-01",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    countries: ["RU", "UA", "DE"],
  },
  {
    id: "ti-005",
    name: "Fake DocuSign Campaign",
    type: "phishing",
    severity: "medium",
    description:
      "Large-scale phishing using DocuSign lookalike domains and brand kits.",
    firstSeen: "2025-02-10",
    lastSeen: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    countries: ["US", "GB", "IN"],
  },
];

export const malwareFamilies = [
  { name: "LockBit", activity: 92, trend: "+12%" },
  { name: "Emotet", activity: 78, trend: "+8%" },
  { name: "QakBot", activity: 65, trend: "-3%" },
  { name: "RedLine Stealer", activity: 71, trend: "+15%" },
  { name: "AgentTesla", activity: 54, trend: "+2%" },
];

export const ransomwareTrends = [
  { name: "Jan", value: 42 },
  { name: "Feb", value: 48 },
  { name: "Mar", value: 55 },
  { name: "Apr", value: 51 },
  { name: "May", value: 63 },
  { name: "Jun", value: 71 },
  { name: "Jul", value: 68 },
];

export const highRiskIPs: HighRiskIP[] = [
  {
    ip: "185.220.101.42",
    country: "DE",
    abuseScore: 98,
    categories: ["Tor Exit", "Brute Force"],
    lastReported: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    ip: "45.33.32.156",
    country: "US",
    abuseScore: 87,
    categories: ["Scanning", "Malware C2"],
    lastReported: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },
  {
    ip: "103.27.238.94",
    country: "VN",
    abuseScore: 91,
    categories: ["Phishing Host", "Spam"],
    lastReported: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    ip: "91.219.237.220",
    country: "NL",
    abuseScore: 95,
    categories: ["Ransomware C2"],
    lastReported: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    ip: "194.26.29.118",
    country: "RU",
    abuseScore: 89,
    categories: ["Botnet", "DDoS"],
    lastReported: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export const attackStatistics = [
  { name: "Phishing", value: 34 },
  { name: "Malware", value: 22 },
  { name: "Ransomware", value: 14 },
  { name: "Brute Force", value: 18 },
  { name: "Exploit Kits", value: 12 },
];

export const cveFeed = [
  {
    cve: "CVE-2025-21415",
    severity: "critical" as const,
    product: "Microsoft Exchange",
    description: "Remote code execution via crafted email headers.",
    published: "2025-07-12",
  },
  {
    cve: "CVE-2025-19882",
    severity: "high" as const,
    product: "Apache HTTP Server",
    description: "Path traversal leading to arbitrary file read.",
    published: "2025-07-08",
  },
  {
    cve: "CVE-2025-17644",
    severity: "high" as const,
    product: "OpenSSL",
    description: "Memory corruption in TLS handshake processing.",
    published: "2025-06-29",
  },
  {
    cve: "CVE-2025-15301",
    severity: "medium" as const,
    product: "WordPress Core",
    description: "Stored XSS in comment moderation interface.",
    published: "2025-06-20",
  },
];

export const allAlerts: Alert[] = [
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
  {
    id: "alt-006",
    title: "Weak password policy detected",
    description: "3 accounts using passwords shorter than policy minimum.",
    riskLevel: "low",
    status: "open",
    source: "Identity Protection",
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    category: "Authentication",
  },
  {
    id: "alt-007",
    title: "Unpatched CVE on web server",
    description: "CVE-2025-21415 may affect SERVER-WEB-02.",
    riskLevel: "critical",
    status: "open",
    source: "Vulnerability Scanner",
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    category: "Vulnerability",
  },
  {
    id: "alt-008",
    title: "USB device connected",
    description: "Unknown USB mass storage mounted on LAPTOP-CEO-01.",
    riskLevel: "medium",
    status: "dismissed",
    source: "Endpoint Protection",
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    category: "Endpoint",
  },
  {
    id: "alt-009",
    title: "DNS tunneling suspected",
    description: "Abnormally long DNS queries from IOT-CAM-LOBBY.",
    riskLevel: "high",
    status: "open",
    source: "Network Monitor",
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    category: "Network",
  },
  {
    id: "alt-010",
    title: "Security training overdue",
    description: "4 users have not completed quarterly phishing awareness training.",
    riskLevel: "low",
    status: "open",
    source: "Compliance",
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    category: "Compliance",
  },
];

export const mockReport: SecurityReport = {
  id: "rpt-2025-08-01",
  title: "Monthly Security Posture Report",
  generatedAt: new Date().toISOString(),
  overallScore: 78,
  threatSummary:
    "Your environment blocked 303 threats this month. Phishing remains the top attack vector (34%), followed by malware (22%). Two critical endpoint incidents were successfully contained.",
  riskAnalysis:
    "Overall risk is Medium. Primary concerns include an at-risk IoT camera, one SOC workstation with suspicious outbound connections, and an approaching SSL certificate expiry. Identity anomalies warrant continued monitoring.",
  recommendations: [
    "Isolate and reimage IOT-CAM-LOBBY or apply latest firmware.",
    "Investigate DESKTOP-SOC-01 outbound traffic to 185.220.101.42.",
    "Renew SSL certificate for portal.acme-internal.dev within 6 days.",
    "Enforce phishing-resistant MFA for all privileged accounts.",
    "Schedule a full vulnerability scan of SERVER-WEB-02.",
  ],
  alertsCount: {
    critical: 3,
    high: 4,
    medium: 2,
    low: 2,
    info: 0,
  },
};
