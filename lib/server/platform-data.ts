import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  Alert,
  AlertStatus,
  ChartDataPoint,
  Device,
  RiskLevel,
  SecurityMetric,
  SecurityReport,
  ThreatTimelineEvent,
} from "@/types";

type PlatformDb = {
  alerts: Alert[];
  devices: Device[];
  timeline: ThreatTimelineEvent[];
  activity: ChartDataPoint[];
};

declare global {
  // eslint-disable-next-line no-var
  var __cgPlatformCache: PlatformDb | undefined;
}

function dbPath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "cyberguard-platform.json");
  }
  return path.join(process.cwd(), "data", "platform.json");
}

function minutesAgo(m: number) {
  return new Date(Date.now() - m * 60_000).toISOString();
}

function seed(): PlatformDb {
  return {
    alerts: [
      {
        id: "alt-001",
        title: "Suspicious login from new location",
        description:
          "Login attempt detected from São Paulo, BR using unrecognized device.",
        riskLevel: "high",
        status: "open",
        source: "Identity Protection",
        timestamp: minutesAgo(18),
        category: "Authentication",
      },
      {
        id: "alt-002",
        title: "Phishing email blocked",
        description:
          "Credential-harvesting message mimicking Microsoft 365 sign-in.",
        riskLevel: "critical",
        status: "acknowledged",
        source: "Email Gateway",
        timestamp: minutesAgo(45),
        category: "Phishing",
      },
      {
        id: "alt-003",
        title: "Outdated SSL certificate detected",
        description: "portal.acme-internal.dev certificate expires in 6 days.",
        riskLevel: "medium",
        status: "open",
        source: "Website Scanner",
        timestamp: minutesAgo(120),
        category: "Infrastructure",
      },
      {
        id: "alt-004",
        title: "Malware signature match",
        description: "Trojan.GenericKD.48291 quarantined on LAPTOP-DEV-04.",
        riskLevel: "critical",
        status: "resolved",
        source: "Endpoint Protection",
        timestamp: minutesAgo(240),
        category: "Malware",
      },
      {
        id: "alt-005",
        title: "Unusual outbound traffic",
        description:
          "Device DESKTOP-SOC-01 contacted high-risk IP 185.220.101.42.",
        riskLevel: "high",
        status: "open",
        source: "Network Monitor",
        timestamp: minutesAgo(360),
        category: "Network",
      },
      {
        id: "alt-006",
        title: "Weak password policy detected",
        description: "3 accounts using passwords shorter than policy minimum.",
        riskLevel: "low",
        status: "open",
        source: "Identity Protection",
        timestamp: minutesAgo(480),
        category: "Authentication",
      },
      {
        id: "alt-007",
        title: "Unpatched CVE on web server",
        description: "CVE-2025-21415 may affect SERVER-WEB-02.",
        riskLevel: "critical",
        status: "open",
        source: "Vulnerability Scanner",
        timestamp: minutesAgo(600),
        category: "Vulnerability",
      },
      {
        id: "alt-008",
        title: "USB device connected",
        description: "Unknown USB mass storage mounted on LAPTOP-CEO-01.",
        riskLevel: "medium",
        status: "dismissed",
        source: "Endpoint Protection",
        timestamp: minutesAgo(720),
        category: "Endpoint",
      },
      {
        id: "alt-009",
        title: "DNS tunneling suspected",
        description: "Abnormally long DNS queries from IOT-CAM-LOBBY.",
        riskLevel: "high",
        status: "open",
        source: "Network Monitor",
        timestamp: minutesAgo(50),
        category: "Network",
      },
      {
        id: "alt-010",
        title: "Security training overdue",
        description:
          "4 users have not completed quarterly phishing awareness training.",
        riskLevel: "low",
        status: "open",
        source: "Compliance",
        timestamp: minutesAgo(1440),
        category: "Compliance",
      },
    ],
    devices: [
      {
        id: "dev-001",
        name: "LAPTOP-CEO-01",
        os: "Windows 11 Pro",
        lastScan: minutesAgo(45),
        status: "online",
        riskLevel: "low",
        ipAddress: "10.0.1.24",
        type: "laptop",
      },
      {
        id: "dev-002",
        name: "DESKTOP-SOC-01",
        os: "Windows 11 Enterprise",
        lastScan: minutesAgo(12),
        status: "at_risk",
        riskLevel: "high",
        ipAddress: "10.0.1.88",
        type: "desktop",
      },
      {
        id: "dev-003",
        name: "MBP-ENG-07",
        os: "macOS Sequoia",
        lastScan: minutesAgo(180),
        status: "online",
        riskLevel: "low",
        ipAddress: "10.0.2.15",
        type: "laptop",
      },
      {
        id: "dev-004",
        name: "SERVER-WEB-02",
        os: "Ubuntu 22.04 LTS",
        lastScan: minutesAgo(60),
        status: "scanning",
        riskLevel: "medium",
        ipAddress: "10.0.0.12",
        type: "server",
      },
      {
        id: "dev-005",
        name: "IPHONE-14-MK",
        os: "iOS 18.2",
        lastScan: minutesAgo(400),
        status: "offline",
        riskLevel: "low",
        ipAddress: "10.0.3.41",
        type: "mobile",
      },
      {
        id: "dev-006",
        name: "IOT-CAM-LOBBY",
        os: "Embedded Linux",
        lastScan: minutesAgo(900),
        status: "at_risk",
        riskLevel: "critical",
        ipAddress: "10.0.4.7",
        type: "iot",
      },
    ],
    timeline: [
      {
        id: "tl-1",
        title: "Ransomware campaign surge",
        description: "LockBit variant activity up 34% in the last 24 hours.",
        riskLevel: "critical",
        timestamp: minutesAgo(30),
      },
      {
        id: "tl-2",
        title: "Credential stuffing wave",
        description: "2,400 failed auth attempts blocked across corporate SSO.",
        riskLevel: "high",
        timestamp: minutesAgo(90),
      },
      {
        id: "tl-3",
        title: "Zero-day advisory",
        description:
          "CVE-2024-XXXX actively exploited in the wild — patch recommended.",
        riskLevel: "high",
        timestamp: minutesAgo(180),
      },
      {
        id: "tl-4",
        title: "Phishing kit takedown",
        description:
          "Hosting provider removed 12 malicious domains used in BEC campaigns.",
        riskLevel: "info",
        timestamp: minutesAgo(300),
      },
    ],
    activity: [
      { name: "Mon", threats: 18, blocked: 42, resolved: 15 },
      { name: "Tue", threats: 24, blocked: 51, resolved: 20 },
      { name: "Wed", threats: 14, blocked: 38, resolved: 22 },
      { name: "Thu", threats: 31, blocked: 67, resolved: 28 },
      { name: "Fri", threats: 22, blocked: 55, resolved: 19 },
      { name: "Sat", threats: 9, blocked: 21, resolved: 11 },
      { name: "Sun", threats: 12, blocked: 29, resolved: 14 },
    ],
  };
}

async function readDb(): Promise<PlatformDb> {
  if (globalThis.__cgPlatformCache) return globalThis.__cgPlatformCache;
  try {
    const raw = await fs.readFile(dbPath(), "utf8");
    const parsed = JSON.parse(raw) as PlatformDb;
    globalThis.__cgPlatformCache = parsed;
    return parsed;
  } catch {
    const seeded = seed();
    await writeDb(seeded);
    return seeded;
  }
}

async function writeDb(db: PlatformDb) {
  globalThis.__cgPlatformCache = db;
  const file = dbPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
}

function computeScore(alerts: Alert[], devices: Device[]) {
  const openCritical = alerts.filter(
    (a) => a.status === "open" && a.riskLevel === "critical"
  ).length;
  const openHigh = alerts.filter(
    (a) => a.status === "open" && a.riskLevel === "high"
  ).length;
  const atRiskDevices = devices.filter((d) => d.status === "at_risk").length;
  let score = 92 - openCritical * 8 - openHigh * 4 - atRiskDevices * 5;
  return Math.max(35, Math.min(98, score));
}

function overallRisk(score: number): { label: string; riskLevel: RiskLevel } {
  if (score < 55) return { label: "Critical", riskLevel: "critical" };
  if (score < 70) return { label: "High", riskLevel: "high" };
  if (score < 85) return { label: "Medium", riskLevel: "medium" };
  return { label: "Low", riskLevel: "low" };
}

export async function getDashboardOverview() {
  const db = await readDb();
  const score = computeScore(db.alerts, db.devices);
  const activeThreats = db.alerts.filter(
    (a) => a.status === "open" && (a.riskLevel === "critical" || a.riskLevel === "high")
  ).length;
  const protectedDevices = db.devices.filter((d) => d.status !== "offline").length;
  const risk = overallRisk(score);

  const metrics: SecurityMetric[] = [
    { label: "Security Score", value: score, change: 2, trend: "up" },
    {
      label: "Active Threats",
      value: activeThreats,
      change: -1,
      trend: "down",
      riskLevel: activeThreats > 5 ? "high" : "medium",
    },
    { label: "Protected Devices", value: protectedDevices, change: 0, trend: "stable" },
    { label: "Risk Level", value: risk.label, riskLevel: risk.riskLevel },
  ];

  const riskDistribution: ChartDataPoint[] = [
    {
      name: "Critical",
      value: db.alerts.filter((a) => a.riskLevel === "critical").length,
    },
    { name: "High", value: db.alerts.filter((a) => a.riskLevel === "high").length },
    {
      name: "Medium",
      value: db.alerts.filter((a) => a.riskLevel === "medium").length,
    },
    { name: "Low", value: db.alerts.filter((a) => a.riskLevel === "low").length },
  ];

  return {
    securityScore: score,
    metrics,
    recentAlerts: [...db.alerts]
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
      .slice(0, 5),
    timeline: db.timeline,
    activity: db.activity,
    riskDistribution,
  };
}

export async function listAlerts() {
  const db = await readDb();
  return [...db.alerts].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
  );
}

export async function updateAlertStatus(id: string, status: AlertStatus) {
  const db = await readDb();
  const idx = db.alerts.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  db.alerts[idx] = { ...db.alerts[idx], status };
  await writeDb(db);
  return db.alerts[idx];
}

export async function createAlert(input: {
  title: string;
  description: string;
  riskLevel: RiskLevel;
  source: string;
  category: string;
}) {
  const db = await readDb();
  const alert: Alert = {
    id: `alt-${randomUUID().slice(0, 8)}`,
    title: input.title,
    description: input.description,
    riskLevel: input.riskLevel,
    status: "open",
    source: input.source,
    timestamp: new Date().toISOString(),
    category: input.category,
  };
  db.alerts.unshift(alert);
  db.timeline.unshift({
    id: `tl-${randomUUID().slice(0, 8)}`,
    title: input.title,
    description: input.description,
    riskLevel: input.riskLevel,
    timestamp: alert.timestamp,
  });
  db.timeline = db.timeline.slice(0, 20);

  // bump today's activity
  const day = db.activity[db.activity.length - 1];
  if (day) {
    day.threats = (day.threats || 0) + 1;
    if (input.riskLevel === "critical" || input.riskLevel === "high") {
      day.blocked = (day.blocked || 0) + 1;
    }
  }

  await writeDb(db);
  return alert;
}

export async function listDevices() {
  const db = await readDb();
  return db.devices;
}

export async function scanDevice(id: string) {
  const db = await readDb();
  const idx = db.devices.findIndex((d) => d.id === id);
  if (idx < 0) return null;

  db.devices[idx] = {
    ...db.devices[idx],
    status: "scanning",
    lastScan: new Date().toISOString(),
  };
  await writeDb(db);

  // Simulate quick scan completion in same request for API simplicity
  const device = db.devices[idx];
  const finishedStatus =
    device.riskLevel === "critical" || device.riskLevel === "high"
      ? "at_risk"
      : "online";
  db.devices[idx] = {
    ...device,
    status: finishedStatus,
    lastScan: new Date().toISOString(),
  };
  await writeDb(db);

  if (finishedStatus === "at_risk") {
    await createAlert({
      title: `Device scan flagged ${device.name}`,
      description: `${device.name} (${device.ipAddress}) remains at ${device.riskLevel} risk after scan.`,
      riskLevel: device.riskLevel,
      source: "Endpoint Protection",
      category: "Endpoint",
    });
  }

  return db.devices[idx];
}

export async function removeDevice(id: string) {
  const db = await readDb();
  const before = db.devices.length;
  db.devices = db.devices.filter((d) => d.id !== id);
  if (db.devices.length === before) return false;
  await writeDb(db);
  return true;
}

export async function getSecurityReport(): Promise<SecurityReport> {
  const db = await readDb();
  const score = computeScore(db.alerts, db.devices);
  const open = db.alerts.filter((a) => a.status === "open");
  const alertsCount = {
    critical: db.alerts.filter((a) => a.riskLevel === "critical").length,
    high: db.alerts.filter((a) => a.riskLevel === "high").length,
    medium: db.alerts.filter((a) => a.riskLevel === "medium").length,
    low: db.alerts.filter((a) => a.riskLevel === "low").length,
    info: db.alerts.filter((a) => a.riskLevel === "info").length,
  };
  const atRisk = db.devices.filter((d) => d.status === "at_risk");

  return {
    id: `rpt-${new Date().toISOString().slice(0, 10)}`,
    title: "Security Posture Report",
    generatedAt: new Date().toISOString(),
    overallScore: score,
    threatSummary: `Environment has ${open.length} open alerts and ${atRisk.length} at-risk devices. Critical/high open alerts: ${
      open.filter((a) => a.riskLevel === "critical" || a.riskLevel === "high").length
    }.`,
    riskAnalysis: `Overall risk is ${overallRisk(score).label}. Focus on open critical alerts and devices marked at_risk. Continue monitoring identity and network anomalies.`,
    recommendations: [
      ...atRisk.slice(0, 2).map((d) => `Investigate and remediate ${d.name} (${d.ipAddress}).`),
      ...open
        .filter((a) => a.riskLevel === "critical")
        .slice(0, 2)
        .map((a) => `Resolve critical alert: ${a.title}`),
      "Enforce phishing-resistant MFA for privileged accounts.",
      "Keep endpoint and server patches current.",
    ].slice(0, 5),
    alertsCount,
  };
}
