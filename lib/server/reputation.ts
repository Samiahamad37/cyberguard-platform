/*
 * Optional external reputation lookups. Each function returns null when its
 * API key env var is not set, so callers fall back to heuristic analysis.
 *  - VIRUSTOTAL_API_KEY          → VirusTotal v3 (file hashes, URLs)
 *  - GOOGLE_SAFE_BROWSING_API_KEY → Safe Browsing Lookup API v4 (URLs)
 */

const TIMEOUT_MS = 10_000;

export type VtStats = { malicious: number; suspicious: number; harmless: number; undetected: number };

export type VtResult =
  | { found: false }
  | {
      found: true;
      stats: VtStats;
      detections: { engine: string; result: string }[];
      label?: string;
      link: string;
    };

type VtAttributes = {
  last_analysis_stats?: Partial<VtStats>;
  last_analysis_results?: Record<string, { category: string; result: string | null; engine_name?: string }>;
  popular_threat_classification?: { suggested_threat_label?: string };
};

function vtParse(attrs: VtAttributes, link: string): VtResult {
  const s = attrs.last_analysis_stats || {};
  const stats: VtStats = {
    malicious: s.malicious ?? 0,
    suspicious: s.suspicious ?? 0,
    harmless: s.harmless ?? 0,
    undetected: s.undetected ?? 0,
  };
  const detections = Object.entries(attrs.last_analysis_results || {})
    .filter(([, r]) => r.category === "malicious" || r.category === "suspicious")
    .slice(0, 12)
    .map(([engine, r]) => ({ engine: r.engine_name || engine, result: r.result || r.category }));
  return {
    found: true,
    stats,
    detections,
    label: attrs.popular_threat_classification?.suggested_threat_label,
    link,
  };
}

async function vtGet(path: string, key: string) {
  const res = await fetch(`https://www.virustotal.com/api/v3/${path}`, {
    headers: { "x-apikey": key, accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`VirusTotal returned HTTP ${res.status}`);
  const json = (await res.json()) as { data?: { attributes?: VtAttributes } };
  return json.data?.attributes ?? {};
}

export async function virusTotalFile(hash: string): Promise<VtResult | null> {
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) return null;
  const attrs = await vtGet(`files/${encodeURIComponent(hash)}`, key);
  if (!attrs) return { found: false };
  return vtParse(attrs, `https://www.virustotal.com/gui/file/${hash}`);
}

export async function virusTotalUrl(url: string): Promise<VtResult | null> {
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) return null;
  const id = Buffer.from(url).toString("base64url");
  const attrs = await vtGet(`urls/${id}`, key);
  if (!attrs) return { found: false };
  return vtParse(attrs, `https://www.virustotal.com/gui/url/${id}`);
}

export type SafeBrowsingResult = { matches: { url: string; threatType: string }[] };

export async function safeBrowsingLookup(urls: string[]): Promise<SafeBrowsingResult | null> {
  const key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!key || urls.length === 0) return null;
  const res = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "cyberguard-platform", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: urls.slice(0, 500).map((url) => ({ url })),
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Safe Browsing returned HTTP ${res.status}`);
  const json = (await res.json()) as { matches?: { threat: { url: string }; threatType: string }[] };
  return { matches: (json.matches || []).map((m) => ({ url: m.threat.url, threatType: m.threatType })) };
}
