import type { PhishingAnalysisResult, RiskLevel } from "@/types";
import { safeBrowsingLookup, virusTotalUrl } from "@/lib/server/reputation";

/*
 * Phishing analysis of content the user submits. Local heuristics always run;
 * Google Safe Browsing and VirusTotal are consulted for URLs when their API
 * keys are configured. No reputation scores are invented.
 */

const SUSPICIOUS_KEYWORDS = [
  "urgent",
  "immediately",
  "verify your account",
  "click here",
  "password expired",
  "suspended",
  "confirm identity",
  "confirm your identity",
  "wire transfer",
  "gift card",
  "unusual activity",
  "unauthorized login",
  "final notice",
  "update your payment",
];

const LOOKALIKE_HINTS = [
  "micros0ft",
  "rnicrosoft",
  "paypa1",
  "app1e",
  "amaz0n",
  "g00gle",
  "faceb00k",
  "secure-login",
  "account-verify",
  "login-verify",
];

const SUSPICIOUS_TLDS = [".zip", ".mov", ".xyz", ".top", ".click", ".country", ".gq", ".tk", ".ml", ".cf"];

function riskFromScore(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/** Lexical URL signals. Returns the signals found and the points they add. */
function urlSignals(raw: string): { signals: string[]; points: number; lookalike: boolean } {
  const signals: string[] = [];
  let points = 0;
  let lookalike = false;
  let u: URL | null = null;
  try {
    u = new URL(raw.includes("://") ? raw : `http://${raw}`);
  } catch {
    return { signals: ["URL could not be parsed"], points: 10, lookalike };
  }
  const host = u.hostname.toLowerCase();
  const lower = raw.toLowerCase();

  if (LOOKALIKE_HINTS.some((h) => lower.includes(h))) {
    signals.push("Brand look-alike spelling in domain");
    points += 40;
    lookalike = true;
  }
  if (host.startsWith("xn--") || host.includes(".xn--")) {
    signals.push("Punycode (internationalised) domain");
    points += 20;
    lookalike = true;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    signals.push("Raw IP address instead of a domain name");
    points += 25;
  }
  if (raw.includes("@") && /^[a-z]+:\/\/[^/]*@/i.test(raw)) {
    signals.push("'@' in URL hides the real destination");
    points += 25;
  }
  if (host.split(".").length > 4) {
    signals.push("Unusually many subdomains");
    points += 15;
  }
  if (SUSPICIOUS_TLDS.some((t) => host.endsWith(t))) {
    signals.push("Top-level domain frequently abused for phishing");
    points += 15;
  }
  if (/(login|signin|verify|account|password|wallet|unlock|update)/i.test(u.pathname + u.search + host)) {
    signals.push("Credential-related words (login/verify/account)");
    points += 15;
  }
  if (u.protocol === "http:") {
    signals.push("Not using HTTPS");
    points += 10;
  }
  if (raw.length > 120) {
    signals.push("Very long URL");
    points += 5;
  }
  return { signals, points, lookalike };
}

type ExternalUrlCheck = {
  reputation: PhishingAnalysisResult["urlReputation"];
  sources: string[];
  maliciousUrls: Set<string>;
  notes: string[];
};

async function externalUrlChecks(urls: string[]): Promise<ExternalUrlCheck> {
  const out: ExternalUrlCheck = { reputation: [], sources: [], maliciousUrls: new Set(), notes: [] };
  if (urls.length === 0) return out;

  try {
    const sb = await safeBrowsingLookup(urls);
    if (sb) {
      out.sources.push("Google Safe Browsing");
      for (const url of urls) {
        const m = sb.matches.find((x) => x.url === url);
        out.reputation.push({
          url,
          source: "Google Safe Browsing",
          status: m ? "malicious" : "safe",
          detail: m ? m.threatType.replace(/_/g, " ").toLowerCase() : "No match on Safe Browsing lists",
        });
        if (m) out.maliciousUrls.add(url);
      }
    }
  } catch (err) {
    out.notes.push(`Safe Browsing lookup failed: ${(err as Error).message}`);
  }

  try {
    if (process.env.VIRUSTOTAL_API_KEY) {
      out.sources.push("VirusTotal");
      for (const url of urls.slice(0, 4)) {
        const vt = await virusTotalUrl(url);
        if (!vt) continue;
        if (!vt.found) {
          out.reputation.push({ url, source: "VirusTotal", status: "unknown", detail: "Not previously analysed by VirusTotal" });
          continue;
        }
        const bad = vt.stats.malicious;
        const status = bad >= 2 ? "malicious" : bad + vt.stats.suspicious > 0 ? "suspicious" : "safe";
        if (status === "malicious") out.maliciousUrls.add(url);
        const total = vt.stats.malicious + vt.stats.suspicious + vt.stats.harmless + vt.stats.undetected;
        out.reputation.push({
          url,
          source: "VirusTotal",
          status,
          detail: `${vt.stats.malicious}/${total} engines flag as malicious`,
        });
      }
    }
  } catch (err) {
    out.notes.push(`VirusTotal lookup failed: ${(err as Error).message}`);
  }
  return out;
}

function buildActions(score: number, external: boolean) {
  return score >= 50
    ? [
        "Do not click links or open attachments",
        "Report the message to your security team or email provider",
        "Verify the sender via a known phone number or official website",
        "Enable MFA on accounts that may be targeted",
      ]
    : [
        "No strong indicators found, but still verify unexpected requests through a trusted channel",
        ...(external ? [] : ["Heuristics can miss new phishing sites; check links before entering credentials"]),
      ];
}

export async function analyzePhishingEmail(content: string): Promise<PhishingAnalysisResult> {
  const lower = content.toLowerCase();
  const keywords = SUSPICIOUS_KEYWORDS.filter((kw) => lower.includes(kw));
  const urls = Array.from(new Set(content.match(/https?:\/\/[^\s<>"')]+/gi) || [])).slice(0, 20);

  const signals: string[] = [];
  let score = keywords.length * 10;
  if (keywords.length) signals.push(`${keywords.length} social-engineering phrase(s)`);

  const fakeDomains: string[] = [];
  let urlPoints = 0;
  for (const u of urls) {
    const s = urlSignals(u);
    if (s.lookalike) fakeDomains.push(u);
    urlPoints = Math.max(urlPoints, s.points);
    for (const sig of s.signals) if (!signals.includes(sig)) signals.push(sig);
  }
  score += Math.round(urlPoints * 0.8);
  if (/(password|ssn|social security|bank details|card number|pin)\b/i.test(content)) {
    signals.push("Asks for credentials or financial details");
    score += 15;
  }

  const ext = await externalUrlChecks(urls);
  if (ext.maliciousUrls.size > 0) {
    signals.unshift(`${ext.maliciousUrls.size} link(s) flagged by ${ext.sources.join(" / ")}`);
    score = Math.max(score, 90);
  }
  score = Math.min(100, score);
  const external = ext.sources.length > 0;

  const explanation =
    (signals.length === 0
      ? "No phishing indicators were found by the heuristic checks."
      : `Heuristic analysis found: ${signals.join("; ")}.`) +
    (external
      ? ` Links were also checked against ${ext.sources.join(" and ")}.`
      : " Links were not checked against a reputation service (no API key configured).") +
    (ext.notes.length ? ` ${ext.notes.join(" ")}` : "");

  return {
    threatScore: score,
    phishingProbability: score,
    suspiciousKeywords: keywords,
    fakeDomainDetected: fakeDomains.length > 0,
    fakeDomains,
    urlReputation: ext.reputation,
    signals,
    aiExplanation: explanation,
    recommendedActions: buildActions(score, external),
    riskLevel: riskFromScore(score),
    analysisMethod: external ? "heuristic+threat-intel" : "heuristic",
    sources: ["Heuristic analysis", ...ext.sources],
  };
}

export async function analyzePhishingUrl(url: string): Promise<PhishingAnalysisResult> {
  const s = urlSignals(url.trim());
  const normalized = url.includes("://") ? url.trim() : `http://${url.trim()}`;
  const ext = await externalUrlChecks([normalized]);
  let score = Math.min(100, s.points);
  const signals = [...s.signals];
  if (ext.maliciousUrls.size > 0) {
    signals.unshift(`Flagged by ${ext.sources.join(" / ")}`);
    score = Math.max(score, 95);
  }
  const external = ext.sources.length > 0;

  return {
    threatScore: score,
    phishingProbability: score,
    suspiciousKeywords: signals,
    fakeDomainDetected: s.lookalike,
    fakeDomains: s.lookalike ? [url] : [],
    urlReputation: ext.reputation,
    signals,
    aiExplanation:
      (signals.length
        ? `Heuristic analysis of the URL found: ${signals.join("; ")}.`
        : "The URL's structure doesn't match common phishing patterns.") +
      (external
        ? ` Also checked against ${ext.sources.join(" and ")}.`
        : " Not checked against a reputation service (no API key configured).") +
      (ext.notes.length ? ` ${ext.notes.join(" ")}` : ""),
    recommendedActions:
      score >= 60
        ? ["Do not visit this URL", "Block the domain at your DNS or firewall", "Report it to your email provider or security team"]
        : buildActions(score, external),
    riskLevel: riskFromScore(score),
    analysisMethod: external ? "heuristic+threat-intel" : "heuristic",
    sources: ["Heuristic analysis", ...ext.sources],
  };
}
