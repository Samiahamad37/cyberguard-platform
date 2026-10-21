import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import type {
  Alert,
  AlertStatus,
  ChartDataPoint,
  Device,
  DeviceScanResult,
  RiskLevel,
  SecurityMetric,
  SecurityReport,
  ThreatTimelineEvent,
} from "@/types";
import { probeHost } from "@/lib/server/device-scan";

/*
 * Per-user security data: alerts, devices, and timeline events.
 *
 * Postgres (Neon) whenever DATABASE_URL is set (tables cyberguard_alerts,
 * cyberguard_devices, cyberguard_timeline, each keyed by user_id). Without
 * DATABASE_URL a local JSON file is used instead (dev only; ephemeral on Vercel).
 * New users start with no data: everything here is created by the user's own
 * scans and actions.
 */

const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

declare global {
  // eslint-disable-next-line no-var
  var __cgPlatformTablesReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __cgPlatformFileCache: FileDb | undefined;
}

function ensureTables() {
  if (!sql) return Promise.resolve();
  if (!globalThis.__cgPlatformTablesReady) {
    globalThis.__cgPlatformTablesReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS cyberguard_alerts (
          id          TEXT PRIMARY KEY,
          user_id     TEXT NOT NULL,
          title       TEXT NOT NULL,
          description TEXT NOT NULL,
          risk_level  TEXT NOT NULL,
          status      TEXT NOT NULL DEFAULT 'open',
          source      TEXT NOT NULL,
          category    TEXT NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          resolved_at TIMESTAMPTZ
        )`;
      await sql`CREATE INDEX IF NOT EXISTS cyberguard_alerts_user_idx ON cyberguard_alerts (user_id, created_at DESC)`;
      await sql`
        CREATE TABLE IF NOT EXISTS cyberguard_devices (
          id               TEXT PRIMARY KEY,
          user_id          TEXT NOT NULL,
          name             TEXT NOT NULL,
          os               TEXT NOT NULL DEFAULT '',
          type             TEXT NOT NULL DEFAULT 'desktop',
          ip_address       TEXT NOT NULL,
          status           TEXT NOT NULL DEFAULT 'offline',
          risk_level       TEXT NOT NULL DEFAULT 'info',
          last_scan        TIMESTAMPTZ,
          last_scan_result JSONB,
          created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS cyberguard_devices_user_idx ON cyberguard_devices (user_id)`;
      await sql`
        CREATE TABLE IF NOT EXISTS cyberguard_timeline (
          id          TEXT PRIMARY KEY,
          user_id     TEXT NOT NULL,
          title       TEXT NOT NULL,
          description TEXT NOT NULL,
          risk_level  TEXT NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS cyberguard_timeline_user_idx ON cyberguard_timeline (user_id, created_at DESC)`;
    })().catch((err) => {
      globalThis.__cgPlatformTablesReady = undefined;
      throw err;
    });
  }
  return globalThis.__cgPlatformTablesReady;
}

/* ------------------------------------------------------------------ */
/* Row shapes                                                           */
/* ------------------------------------------------------------------ */

type AlertRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  risk_level: RiskLevel;
  status: AlertStatus;
  source: string;
  category: string;
  created_at: string | Date;
  updated_at: string | Date;
  resolved_at: string | Date | null;
};

type DeviceRow = {
  id: string;
  user_id: string;
  name: string;
  os: string;
  type: Device["type"];
  ip_address: string;
  status: Device["status"];
  risk_level: RiskLevel;
  last_scan: string | Date | null;
  last_scan_result: DeviceScanResult | null;
  created_at: string | Date;
};

type TimelineRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  risk_level: RiskLevel;
  created_at: string | Date;
};

const iso = (d: string | Date | null | undefined) =>
  d ? new Date(d).toISOString() : "";

function toAlert(r: AlertRow): Alert {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    riskLevel: r.risk_level,
    status: r.status,
    source: r.source,
    category: r.category,
    timestamp: iso(r.created_at),
    resolvedAt: r.resolved_at ? iso(r.resolved_at) : undefined,
  };
}

function toDevice(r: DeviceRow): Device {
  return {
    id: r.id,
    name: r.name,
    os: r.os,
    type: r.type,
    ipAddress: r.ip_address,
    status: r.status,
    riskLevel: r.risk_level,
    lastScan: iso(r.last_scan),
    lastScanResult: r.last_scan_result ?? undefined,
  };
}

function toTimeline(r: TimelineRow): ThreatTimelineEvent {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    riskLevel: r.risk_level,
    timestamp: iso(r.created_at),
  };
}

/* ------------------------------------------------------------------ */
/* JSON file fallback (no DATABASE_URL) — local dev only                */
/* ------------------------------------------------------------------ */

type FileDb = { alerts: AlertRow[]; devices: DeviceRow[]; timeline: TimelineRow[] };

function filePath() {
  if (process.env.VERCEL) return path.join("/tmp", "cyberguard-platform-v2.json");
  return path.join(process.cwd(), "data", "platform-v2.json");
}

async function readFileDb(): Promise<FileDb> {
  if (globalThis.__cgPlatformFileCache) return globalThis.__cgPlatformFileCache;
  try {
    const parsed = JSON.parse(await fs.readFile(filePath(), "utf8")) as FileDb;
    globalThis.__cgPlatformFileCache = parsed;
    return parsed;
  } catch {
    const empty: FileDb = { alerts: [], devices: [], timeline: [] };
    globalThis.__cgPlatformFileCache = empty;
    return empty;
  }
}

async function writeFileDb(db: FileDb) {
  globalThis.__cgPlatformFileCache = db;
  const file = filePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
}

const byNewest = <T extends { created_at: string | Date }>(a: T, b: T) =>
  +new Date(b.created_at) - +new Date(a.created_at);

/* ------------------------------------------------------------------ */
/* Low-level data access                                                */
/* ------------------------------------------------------------------ */

async function alertRows(userId: string): Promise<AlertRow[]> {
  if (sql) {
    await ensureTables();
    return (await sql`
      SELECT * FROM cyberguard_alerts WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT 1000`) as AlertRow[];
  }
  const db = await readFileDb();
  return db.alerts.filter((a) => a.user_id === userId).sort(byNewest);
}

async function deviceRows(userId: string): Promise<DeviceRow[]> {
  if (sql) {
    await ensureTables();
    return (await sql`
      SELECT * FROM cyberguard_devices WHERE user_id = ${userId}
      ORDER BY created_at ASC`) as DeviceRow[];
  }
  const db = await readFileDb();
  return db.devices
    .filter((d) => d.user_id === userId)
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
}

async function timelineRows(userId: string, limit = 20): Promise<TimelineRow[]> {
  if (sql) {
    await ensureTables();
    return (await sql`
      SELECT * FROM cyberguard_timeline WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT ${limit}`) as TimelineRow[];
  }
  const db = await readFileDb();
  return db.timeline.filter((t) => t.user_id === userId).sort(byNewest).slice(0, limit);
}

async function addTimelineEvent(
  userId: string,
  event: { title: string; description: string; riskLevel: RiskLevel; at?: string }
) {
  const row: TimelineRow = {
    id: `tl-${randomUUID()}`,
    user_id: userId,
    title: event.title,
    description: event.description,
    risk_level: event.riskLevel,
    created_at: event.at ?? new Date().toISOString(),
  };
  if (sql) {
    await ensureTables();
    await sql`
      INSERT INTO cyberguard_timeline (id, user_id, title, description, risk_level, created_at)
      VALUES (${row.id}, ${row.user_id}, ${row.title}, ${row.description}, ${row.risk_level}, ${row.created_at})`;
    return;
  }
  const db = await readFileDb();
  db.timeline.push(row);
  await writeFileDb(db);
}

/* ------------------------------------------------------------------ */
/* Scoring                                                              */
/* ------------------------------------------------------------------ */

function computeScore(alerts: Alert[], devices: Device[]) {
  const open = alerts.filter((a) => a.status === "open" || a.status === "acknowledged");
  const n = (lvl: RiskLevel) => open.filter((a) => a.riskLevel === lvl).length;
  const atRisk = devices.filter((d) => d.status === "at_risk").length;
  const score = 100 - n("critical") * 15 - n("high") * 8 - n("medium") * 3 - n("low") * 1 - atRisk * 5;
  return Math.max(0, Math.min(100, score));
}

function overallRisk(score: number): { label: string; riskLevel: RiskLevel } {
  if (score < 55) return { label: "Critical", riskLevel: "critical" };
  if (score < 70) return { label: "High", riskLevel: "high" };
  if (score < 85) return { label: "Medium", riskLevel: "medium" };
  return { label: "Low", riskLevel: "low" };
}

function safeTimeZone(tz?: string | null) {
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/** Alerts raised and resolved per day over the last 7 days (in the viewer's time zone). */
function activityLast7Days(alerts: Alert[], tz: string): ChartDataPoint[] {
  const dayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dayName = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" });
  const days: { key: string; name: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    days.push({ key: dayKey.format(d), name: dayName.format(d) });
  }
  return days.map(({ key, name }) => ({
    name,
    threats: alerts.filter((a) => dayKey.format(new Date(a.timestamp)) === key).length,
    resolved: alerts.filter(
      (a) => a.resolvedAt && dayKey.format(new Date(a.resolvedAt)) === key
    ).length,
  }));
}

function riskDistributionOf(alerts: Alert[]): ChartDataPoint[] {
  return [
    { name: "Critical", value: alerts.filter((a) => a.riskLevel === "critical").length },
    { name: "High", value: alerts.filter((a) => a.riskLevel === "high").length },
    { name: "Medium", value: alerts.filter((a) => a.riskLevel === "medium").length },
    { name: "Low", value: alerts.filter((a) => a.riskLevel === "low").length },
  ];
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export async function getDashboardOverview(userId: string, timeZone?: string | null) {
  const [alerts, devices, timeline] = await Promise.all([
    alertRows(userId).then((r) => r.map(toAlert)),
    deviceRows(userId).then((r) => r.map(toDevice)),
    timelineRows(userId, 10).then((r) => r.map(toTimeline)),
  ]);
  const score = computeScore(alerts, devices);
  const risk = overallRisk(score);
  const activeThreats = alerts.filter(
    (a) =>
      (a.status === "open" || a.status === "acknowledged") &&
      (a.riskLevel === "critical" || a.riskLevel === "high")
  ).length;
  const onlineDevices = devices.filter(
    (d) => d.status === "online" || d.status === "scanning"
  ).length;

  const metrics: SecurityMetric[] = [
    { label: "Security Score", value: score },
    {
      label: "Active Threats",
      value: activeThreats,
      riskLevel: activeThreats === 0 ? "low" : activeThreats > 5 ? "high" : "medium",
    },
    { label: "Devices Online", value: `${onlineDevices}/${devices.length}` },
    { label: "Risk Level", value: risk.label, riskLevel: risk.riskLevel },
  ];

  return {
    securityScore: score,
    metrics,
    recentAlerts: alerts.slice(0, 5),
    timeline,
    activity: activityLast7Days(alerts, safeTimeZone(timeZone)),
    riskDistribution: riskDistributionOf(alerts),
    counts: { alerts: alerts.length, devices: devices.length },
  };
}

export async function listAlerts(userId: string) {
  return (await alertRows(userId)).map(toAlert);
}

export async function updateAlertStatus(userId: string, id: string, status: AlertStatus) {
  let updated: Alert | null = null;
  if (sql) {
    await ensureTables();
    const rows = (await sql`
      UPDATE cyberguard_alerts SET
        status = ${status},
        updated_at = NOW(),
        resolved_at = CASE WHEN ${status}::text = 'resolved' THEN COALESCE(resolved_at, NOW()) ELSE NULL END
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *`) as AlertRow[];
    updated = rows[0] ? toAlert(rows[0]) : null;
  } else {
    const db = await readFileDb();
    const row = db.alerts.find((a) => a.id === id && a.user_id === userId);
    if (row) {
      row.status = status;
      row.updated_at = new Date().toISOString();
      row.resolved_at =
        status === "resolved" ? row.resolved_at ?? new Date().toISOString() : null;
      await writeFileDb(db);
      updated = toAlert(row);
    }
  }
  if (updated) {
    await addTimelineEvent(userId, {
      title: `Alert ${status}`,
      description: updated.title,
      riskLevel: "info",
    });
  }
  return updated;
}

export async function createAlert(input: {
  userId: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  source: string;
  category: string;
}) {
  const now = new Date().toISOString();
  const row: AlertRow = {
    id: `alt-${randomUUID()}`,
    user_id: input.userId,
    title: input.title,
    description: input.description,
    risk_level: input.riskLevel,
    status: "open",
    source: input.source,
    category: input.category,
    created_at: now,
    updated_at: now,
    resolved_at: null,
  };
  if (sql) {
    await ensureTables();
    await sql`
      INSERT INTO cyberguard_alerts (id, user_id, title, description, risk_level, status, source, category, created_at, updated_at)
      VALUES (${row.id}, ${row.user_id}, ${row.title}, ${row.description}, ${row.risk_level}, ${row.status}, ${row.source}, ${row.category}, ${now}, ${now})`;
  } else {
    const db = await readFileDb();
    db.alerts.push(row);
    await writeFileDb(db);
  }
  await addTimelineEvent(input.userId, {
    title: input.title,
    description: input.description,
    riskLevel: input.riskLevel,
    at: now,
  });
  return toAlert(row);
}

export async function listDevices(userId: string) {
  return (await deviceRows(userId)).map(toDevice);
}

async function getDeviceRow(userId: string, id: string): Promise<DeviceRow | null> {
  if (sql) {
    await ensureTables();
    const rows = (await sql`
      SELECT * FROM cyberguard_devices WHERE id = ${id} AND user_id = ${userId} LIMIT 1`) as DeviceRow[];
    return rows[0] ?? null;
  }
  const db = await readFileDb();
  return db.devices.find((d) => d.id === id && d.user_id === userId) ?? null;
}

export type DeviceInput = {
  name: string;
  os: string;
  type: Device["type"];
  ipAddress: string;
};

export async function createDevice(userId: string, input: DeviceInput) {
  const row: DeviceRow = {
    id: `dev-${randomUUID()}`,
    user_id: userId,
    name: input.name.trim(),
    os: input.os.trim(),
    type: input.type,
    ip_address: input.ipAddress.trim(),
    status: "offline",
    risk_level: "info",
    last_scan: null,
    last_scan_result: null,
    created_at: new Date().toISOString(),
  };
  if (sql) {
    await ensureTables();
    await sql`
      INSERT INTO cyberguard_devices (id, user_id, name, os, type, ip_address, status, risk_level, created_at)
      VALUES (${row.id}, ${row.user_id}, ${row.name}, ${row.os}, ${row.type}, ${row.ip_address}, ${row.status}, ${row.risk_level}, ${row.created_at})`;
  } else {
    const db = await readFileDb();
    db.devices.push(row);
    await writeFileDb(db);
  }
  await addTimelineEvent(userId, {
    title: "Device added",
    description: `${row.name} (${row.ip_address}) added to inventory.`,
    riskLevel: "info",
  });
  return toDevice(row);
}

export async function updateDevice(userId: string, id: string, patch: Partial<DeviceInput>) {
  if (sql) {
    await ensureTables();
    const rows = (await sql`
      UPDATE cyberguard_devices SET
        name = COALESCE(${patch.name?.trim() ?? null}, name),
        os = COALESCE(${patch.os?.trim() ?? null}, os),
        type = COALESCE(${patch.type ?? null}, type),
        ip_address = COALESCE(${patch.ipAddress?.trim() ?? null}, ip_address)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *`) as DeviceRow[];
    return rows[0] ? toDevice(rows[0]) : null;
  }
  const db = await readFileDb();
  const row = db.devices.find((d) => d.id === id && d.user_id === userId);
  if (!row) return null;
  if (patch.name !== undefined) row.name = patch.name.trim();
  if (patch.os !== undefined) row.os = patch.os.trim();
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.ipAddress !== undefined) row.ip_address = patch.ipAddress.trim();
  await writeFileDb(db);
  return toDevice(row);
}

/**
 * Real reachability check: TCP connects to common ports on the device's
 * hostname/IP from this server. No fabricated results.
 */
export async function scanDevice(userId: string, id: string) {
  const row = await getDeviceRow(userId, id);
  if (!row) return null;

  const result = await probeHost(row.ip_address);
  const status: Device["status"] = !result.reachable
    ? "offline"
    : result.riskLevel === "high" || result.riskLevel === "critical"
      ? "at_risk"
      : "online";
  const now = result.scannedAt;

  if (sql) {
    await ensureTables();
    await sql`
      UPDATE cyberguard_devices SET
        status = ${status},
        risk_level = ${result.riskLevel},
        last_scan = ${now},
        last_scan_result = ${JSON.stringify(result)}::jsonb
      WHERE id = ${id} AND user_id = ${userId}`;
  } else {
    const db = await readFileDb();
    const r = db.devices.find((d) => d.id === id && d.user_id === userId);
    if (r) {
      r.status = status;
      r.risk_level = result.riskLevel;
      r.last_scan = now;
      r.last_scan_result = result;
      await writeFileDb(db);
    }
  }

  const exposed = result.openPorts.filter((p) => p.risky);
  if (exposed.length > 0) {
    await createAlert({
      userId,
      title: `Exposed services on ${row.name}`,
      description: `${row.name} (${row.ip_address}) accepts connections on ${exposed
        .map((p) => `${p.port}/${p.service}`)
        .join(", ")}. Restrict these ports to trusted networks.`,
      riskLevel: result.riskLevel,
      source: "Device Scan",
      category: "Network",
    });
  } else {
    await addTimelineEvent(userId, {
      title: `Device scan: ${row.name}`,
      description: result.reachable
        ? `Reachable; open ports: ${result.openPorts.map((p) => p.port).join(", ") || "none"}.`
        : result.error
          ? `Scan failed: ${result.error}`
          : `No response on ${result.checkedPorts.length} common ports.`,
      riskLevel: "info",
      at: now,
    });
  }

  return { ...toDevice(row), status, riskLevel: result.riskLevel, lastScan: now, lastScanResult: result };
}

export async function removeDevice(userId: string, id: string) {
  let removed: DeviceRow | null = null;
  if (sql) {
    await ensureTables();
    const rows = (await sql`
      DELETE FROM cyberguard_devices WHERE id = ${id} AND user_id = ${userId} RETURNING *`) as DeviceRow[];
    removed = rows[0] ?? null;
  } else {
    const db = await readFileDb();
    removed = db.devices.find((d) => d.id === id && d.user_id === userId) ?? null;
    if (removed) {
      db.devices = db.devices.filter((d) => d !== removed);
      await writeFileDb(db);
    }
  }
  if (!removed) return false;
  await addTimelineEvent(userId, {
    title: "Device removed",
    description: `${removed.name} (${removed.ip_address}) removed from inventory.`,
    riskLevel: "info",
  });
  return true;
}

/** Deletes every alert, device and timeline row belonging to a user. */
export async function deleteUserData(userId: string) {
  if (sql) {
    await ensureTables();
    await sql`DELETE FROM cyberguard_alerts WHERE user_id = ${userId}`;
    await sql`DELETE FROM cyberguard_devices WHERE user_id = ${userId}`;
    await sql`DELETE FROM cyberguard_timeline WHERE user_id = ${userId}`;
    return;
  }
  const db = await readFileDb();
  db.alerts = db.alerts.filter((a) => a.user_id !== userId);
  db.devices = db.devices.filter((d) => d.user_id !== userId);
  db.timeline = db.timeline.filter((t) => t.user_id !== userId);
  await writeFileDb(db);
}

export async function getSecurityReport(userId: string, timeZone?: string | null) {
  const [alerts, devices] = await Promise.all([
    alertRows(userId).then((r) => r.map(toAlert)),
    deviceRows(userId).then((r) => r.map(toDevice)),
  ]);
  const score = computeScore(alerts, devices);
  const risk = overallRisk(score);
  const open = alerts.filter((a) => a.status === "open" || a.status === "acknowledged");
  const openSevere = open.filter((a) => a.riskLevel === "critical" || a.riskLevel === "high");
  const atRisk = devices.filter((d) => d.status === "at_risk");
  const offline = devices.filter((d) => d.status === "offline" && d.lastScan);
  const neverScanned = devices.filter((d) => !d.lastScan);
  const count = (lvl: RiskLevel) => alerts.filter((a) => a.riskLevel === lvl).length;

  const threatSummary =
    alerts.length === 0 && devices.length === 0
      ? "No security data yet. Run a website, phishing, or malware scan, or add devices to your inventory, and this report will summarise what was found."
      : `You have ${alerts.length} alert${alerts.length === 1 ? "" : "s"} in total, ${open.length} still open (${openSevere.length} critical/high). ` +
        `${devices.length} device${devices.length === 1 ? "" : "s"} in inventory, ${atRisk.length} at risk.`;

  const riskAnalysis =
    alerts.length === 0 && devices.length === 0
      ? "Not enough data to assess risk yet."
      : `Overall risk is ${risk.label} (score ${score}/100), based on your open alerts and device scan results.` +
        (openSevere.length > 0
          ? ` The biggest drivers are ${openSevere.length} open critical/high alert${openSevere.length === 1 ? "" : "s"}.`
          : " No critical or high alerts are open.");

  const recommendations: string[] = [
    ...atRisk.slice(0, 2).map((d) => {
      const ports = d.lastScanResult?.openPorts.filter((p) => p.risky).map((p) => p.port) ?? [];
      return `Restrict exposed services on ${d.name} (${d.ipAddress})${ports.length ? `: ports ${ports.join(", ")}` : ""}.`;
    }),
    ...open
      .filter((a) => a.riskLevel === "critical")
      .slice(0, 2)
      .map((a) => `Resolve critical alert: ${a.title}`),
    ...open
      .filter((a) => a.riskLevel === "high")
      .slice(0, 1)
      .map((a) => `Investigate high alert: ${a.title}`),
    ...(neverScanned.length > 0
      ? [`Run a scan on ${neverScanned.length} device${neverScanned.length === 1 ? "" : "s"} that ha${neverScanned.length === 1 ? "s" : "ve"} never been scanned.`]
      : []),
    ...(offline.length > 0
      ? [`Check ${offline.length} device${offline.length === 1 ? "" : "s"} that did not respond to the last scan.`]
      : []),
    ...(alerts.length === 0 ? ["Scan your public websites with the Website Scanner to check TLS and security headers."] : []),
    ...(devices.length === 0 ? ["Add the devices you manage under Devices so they can be checked."] : []),
  ].slice(0, 5);

  const report: SecurityReport = {
    id: `rpt-${new Date().toISOString().slice(0, 10)}`,
    title: "Security Posture Report",
    generatedAt: new Date().toISOString(),
    overallScore: score,
    threatSummary,
    riskAnalysis,
    recommendations,
    alertsCount: {
      critical: count("critical"),
      high: count("high"),
      medium: count("medium"),
      low: count("low"),
      info: count("info"),
    },
  };

  return {
    report,
    activity: activityLast7Days(alerts, safeTimeZone(timeZone)),
    riskDistribution: riskDistributionOf(alerts),
  };
}

/** Compact summary used by the assistant to answer questions about the user's own data. */
export async function getUserSecuritySummary(userId: string) {
  const [alerts, devices] = await Promise.all([listAlerts(userId), listDevices(userId)]);
  const score = computeScore(alerts, devices);
  return {
    score,
    risk: overallRisk(score).label,
    openAlerts: alerts.filter((a) => a.status === "open" || a.status === "acknowledged"),
    devices,
  };
}
