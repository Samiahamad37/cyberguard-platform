import type { HighRiskIP, RiskLevel, ThreatIntelItem } from "@/types";

/*
 * Threat intelligence from real feeds.
 *  - CISA Known Exploited Vulnerabilities (KEV) catalog — public, no key.
 *  - AbuseIPDB blacklist — optional, needs ABUSEIPDB_API_KEY.
 *  - abuse.ch MalwareBazaar recent samples — optional, needs ABUSE_CH_AUTH_KEY.
 * Each source is cached in memory for 6 hours per server instance.
 */

const KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const CACHE_MS = 6 * 60 * 60 * 1000;

type KevEntry = {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: "Known" | "Unknown" | string;
  notes?: string;
  cwes?: string[];
};

type KevCatalog = {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: KevEntry[];
};

type Cached<T> = { at: number; value: T };

declare global {
  // eslint-disable-next-line no-var
  var __cgKevCache: Cached<KevCatalog> | undefined;
  // eslint-disable-next-line no-var
  var __cgAbuseIpCache: Cached<HighRiskIP[]> | undefined;
  // eslint-disable-next-line no-var
  var __cgMalwareBazaarCache: Cached<MalwareFamily[]> | undefined;
}

type MalwareFamily = { name: string; activity: number; trend: string };

async function getKev(): Promise<KevCatalog> {
  const c = globalThis.__cgKevCache;
  if (c && Date.now() - c.at < CACHE_MS) return c.value;
  try {
    const res = await fetch(KEV_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`CISA KEV returned HTTP ${res.status}`);
    const value = (await res.json()) as KevCatalog;
    globalThis.__cgKevCache = { at: Date.now(), value };
    return value;
  } catch (err) {
    if (c) return c.value; // serve stale on failure
    throw err;
  }
}

async function getAbuseIpBlacklist(key: string): Promise<HighRiskIP[]> {
  const c = globalThis.__cgAbuseIpCache;
  if (c && Date.now() - c.at < CACHE_MS) return c.value;
  const res = await fetch(
    "https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=90&limit=10",
    {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: { Key: key, Accept: "application/json" },
    }
  );
  if (!res.ok) throw new Error(`AbuseIPDB returned HTTP ${res.status}`);
  const json = (await res.json()) as {
    data: { ipAddress: string; countryCode?: string; abuseConfidenceScore: number; lastReportedAt: string }[];
  };
  const value: HighRiskIP[] = (json.data || []).slice(0, 10).map((d) => ({
    ip: d.ipAddress,
    country: d.countryCode || "—",
    abuseScore: d.abuseConfidenceScore,
    categories: ["AbuseIPDB blacklist"],
    lastReported: d.lastReportedAt,
  }));
  globalThis.__cgAbuseIpCache = { at: Date.now(), value };
  return value;
}

async function getMalwareBazaarFamilies(key: string): Promise<MalwareFamily[]> {
  const c = globalThis.__cgMalwareBazaarCache;
  if (c && Date.now() - c.at < CACHE_MS) return c.value;
  const res = await fetch("https://mb-api.abuse.ch/api/v1/", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    headers: { "Auth-Key": key, "Content-Type": "application/x-www-form-urlencoded" },
    body: "query=get_recent&selector=100",
  });
  if (!res.ok) throw new Error(`MalwareBazaar returned HTTP ${res.status}`);
  const json = (await res.json()) as { query_status: string; data?: { signature?: string | null }[] };
  const counts = new Map<string, number>();
  for (const s of json.data || []) {
    if (s.signature) counts.set(s.signature, (counts.get(s.signature) || 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = top[0]?.[1] || 1;
  const value = top.map(([name, n]) => ({
    name,
    activity: Math.round((n / max) * 100),
    trend: `${n} of last 100 samples`,
  }));
  globalThis.__cgMalwareBazaarCache = { at: Date.now(), value };
  return value;
}

const nvdUrl = (cve: string) => `https://nvd.nist.gov/vuln/detail/${cve}`;
const kevSeverity = (v: KevEntry): RiskLevel =>
  v.knownRansomwareCampaignUse === "Known" ? "critical" : "high";

export async function getThreatIntelligence() {
  const requiresApiKey: { highRiskIPs?: string; malwareFamilies?: string } = {};
  const errors: Record<string, string> = {};

  let kev: KevCatalog | null = null;
  try {
    kev = await getKev();
  } catch (err) {
    errors.kev = `Could not load the CISA KEV feed: ${(err as Error).message}`;
  }

  const sorted = kev
    ? [...kev.vulnerabilities].sort(
        (a, b) => b.dateAdded.localeCompare(a.dateAdded) || b.cveID.localeCompare(a.cveID)
      )
    : [];

  const cveFeed = sorted.slice(0, 10).map((v) => ({
    cve: v.cveID,
    severity: kevSeverity(v),
    product: `${v.vendorProject} ${v.product}`,
    description: v.shortDescription,
    published: v.dateAdded,
    dueDate: v.dueDate,
    ransomware: v.knownRansomwareCampaignUse === "Known",
    url: nvdUrl(v.cveID),
  }));

  const latestThreats: ThreatIntelItem[] = sorted
    .filter((v) => v.knownRansomwareCampaignUse === "Known")
    .slice(0, 6)
    .map((v) => ({
      id: v.cveID,
      name: `${v.cveID} · ${v.vulnerabilityName}`,
      type: "ransomware",
      severity: "critical",
      description: v.shortDescription,
      firstSeen: v.dateAdded,
      lastSeen: new Date(`${v.dateAdded}T00:00:00Z`).toISOString(),
      url: nvdUrl(v.cveID),
    }));

  // Ransomware-linked KEV additions per month, last 7 months.
  const months: { key: string; name: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({
      key: d.toISOString().slice(0, 7),
      name: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
    });
  }
  const ransomwareTrends = kev
    ? months.map((m) => ({
        name: m.name,
        value: kev!.vulnerabilities.filter(
          (v) => v.knownRansomwareCampaignUse === "Known" && v.dateAdded.startsWith(m.key)
        ).length,
      }))
    : [];

  // Top vendors among KEV additions in the last 12 months.
  const cutoff = new Date(Date.now() - 365 * 86_400_000).toISOString().slice(0, 10);
  const vendorCounts = new Map<string, number>();
  for (const v of sorted) {
    if (v.dateAdded < cutoff) break;
    vendorCounts.set(v.vendorProject, (vendorCounts.get(v.vendorProject) || 0) + 1);
  }
  const attackStatistics = [...vendorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  let highRiskIPs: HighRiskIP[] = [];
  const abuseKey = process.env.ABUSEIPDB_API_KEY;
  if (!abuseKey) requiresApiKey.highRiskIPs = "ABUSEIPDB_API_KEY";
  else {
    try {
      highRiskIPs = await getAbuseIpBlacklist(abuseKey);
    } catch (err) {
      errors.highRiskIPs = (err as Error).message;
    }
  }

  let malwareFamilies: MalwareFamily[] = [];
  const mbKey = process.env.ABUSE_CH_AUTH_KEY;
  if (!mbKey) requiresApiKey.malwareFamilies = "ABUSE_CH_AUTH_KEY";
  else {
    try {
      malwareFamilies = await getMalwareBazaarFamilies(mbKey);
    } catch (err) {
      errors.malwareFamilies = (err as Error).message;
    }
  }

  return {
    latestThreats,
    malwareFamilies,
    ransomwareTrends,
    highRiskIPs,
    attackStatistics,
    cveFeed,
    requiresApiKey,
    errors,
    sources: {
      kev: kev
        ? {
            name: "CISA Known Exploited Vulnerabilities",
            url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
            catalogVersion: kev.catalogVersion,
            dateReleased: kev.dateReleased,
            count: kev.count,
            fetchedAt: new Date(globalThis.__cgKevCache?.at ?? Date.now()).toISOString(),
          }
        : null,
    },
  };
}
