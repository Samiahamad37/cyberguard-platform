import tls from "tls";
import https from "https";
import { X509Certificate } from "crypto";
import type {
  RiskLevel,
  SecurityHeaderCheck,
  WebsiteFinding,
  WebsiteScanResult,
} from "@/types";
import { isForbiddenAddress, isPrivateAddress, resolveHost } from "@/lib/server/net-guard";

const TIMEOUT_MS = 8000;

const HEADERS: { name: string; points: number; severity: RiskLevel; advice: string }[] = [
  {
    name: "Strict-Transport-Security",
    points: 15,
    severity: "medium",
    advice: "Add Strict-Transport-Security (e.g. max-age=31536000; includeSubDomains) so browsers always use HTTPS.",
  },
  {
    name: "Content-Security-Policy",
    points: 10,
    severity: "medium",
    advice: "Add a Content-Security-Policy to limit where scripts, styles and frames can load from.",
  },
  {
    name: "X-Frame-Options",
    points: 5,
    severity: "low",
    advice: "Add X-Frame-Options: DENY (or CSP frame-ancestors) to prevent clickjacking.",
  },
  {
    name: "X-Content-Type-Options",
    points: 5,
    severity: "low",
    advice: "Add X-Content-Type-Options: nosniff to stop MIME-type sniffing.",
  },
  {
    name: "Referrer-Policy",
    points: 5,
    severity: "low",
    advice: "Add Referrer-Policy (e.g. strict-origin-when-cross-origin) to limit leaked URLs.",
  },
  {
    name: "Permissions-Policy",
    points: 5,
    severity: "low",
    advice: "Add Permissions-Policy to disable browser features the site doesn't use (camera, geolocation, …).",
  },
];

export class WebsiteScanError extends Error {}

function normalizeUrl(input: string) {
  let raw = input.trim();
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new WebsiteScanError("Enter a valid URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new WebsiteScanError("Only http and https URLs can be scanned");
  }
  return u;
}

async function assertPublicHost(hostname: string) {
  const addrs = await resolveHost(hostname).catch(() => {
    throw new WebsiteScanError(`Could not resolve ${hostname}`);
  });
  if (addrs.some((a) => isForbiddenAddress(a) || isPrivateAddress(a))) {
    throw new WebsiteScanError("Only public websites can be scanned");
  }
}

type TlsInfo = {
  protocol: string;
  trusted: boolean;
  trustError?: string;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  san: string[];
  publicKey: string;
};

function dn(obj: Record<string, string | string[]> | undefined) {
  if (!obj) return "";
  const order = ["CN", "O", "OU", "L", "ST", "C"];
  return order
    .filter((k) => obj[k])
    .map((k) => `${k}=${Array.isArray(obj[k]) ? (obj[k] as string[]).join("+") : obj[k]}`)
    .join(", ");
}

function getTlsInfo(hostname: string, port = 443): Promise<TlsInfo> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: hostname,
      port,
      servername: hostname,
      rejectUnauthorized: false,
      ALPNProtocols: ["http/1.1"],
    });
    const fail = (err: Error) => {
      socket.destroy();
      reject(err);
    };
    socket.setTimeout(TIMEOUT_MS, () => fail(new Error("TLS handshake timed out")));
    socket.once("error", fail);
    socket.once("secureConnect", () => {
      try {
        const cert = socket.getPeerCertificate(false);
        if (!cert || !cert.raw) throw new Error("No certificate presented");
        let publicKey = "Unknown";
        try {
          const x = new X509Certificate(cert.raw);
          const k = x.publicKey;
          const d = k.asymmetricKeyDetails;
          if (k.asymmetricKeyType === "ec") publicKey = `EC ${d?.namedCurve ?? ""}`.trim();
          else if (k.asymmetricKeyType === "rsa") publicKey = `RSA ${d?.modulusLength ?? cert.bits}-bit`;
          else publicKey = String(k.asymmetricKeyType ?? "Unknown").toUpperCase();
        } catch {
          /* ignore */
        }
        const info: TlsInfo = {
          protocol: (socket.getProtocol() || "unknown").replace("TLSv", "TLS "),
          trusted: socket.authorized,
          trustError: socket.authorized
            ? undefined
            : String(socket.authorizationError || "Certificate not trusted"),
          issuer: dn(cert.issuer as unknown as Record<string, string>),
          subject: dn(cert.subject as unknown as Record<string, string>),
          validFrom: new Date(cert.valid_from).toISOString(),
          validTo: new Date(cert.valid_to).toISOString(),
          san: (cert.subjectaltname || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          publicKey,
        };
        socket.end();
        resolve(info);
      } catch (err) {
        fail(err as Error);
      }
    });
  });
}

async function fetchWithTimeout(url: string, redirect: RequestRedirect) {
  return fetch(url, {
    redirect,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
    headers: {
      "user-agent": "CyberGuard-WebsiteScanner/1.0 (+security headers check)",
      accept: "text/html,*/*;q=0.8",
    },
  });
}

type BasicResponse = { status: number; url: string; headers: { get(name: string): string | null } };

/** Single GET that ignores certificate errors — used only to read headers from sites with a broken certificate. */
function insecureGet(url: string): Promise<BasicResponse> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        rejectUnauthorized: false,
        timeout: TIMEOUT_MS,
        headers: { "user-agent": "CyberGuard-WebsiteScanner/1.0 (+security headers check)" },
      },
      (res) => {
        res.resume();
        const h = res.headers;
        resolve({
          status: res.statusCode ?? 0,
          url,
          headers: {
            get: (name: string) => {
              const v = h[name.toLowerCase()];
              return v === undefined ? null : Array.isArray(v) ? v.join(", ") : String(v);
            },
          },
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("timed out after 8 seconds")));
    req.on("error", reject);
  });
}

function gradeFor(score: number) {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

/** Live scan: fetches the site, inspects TLS certificate and security headers. */
export async function scanWebsite(input: string): Promise<WebsiteScanResult> {
  const target = normalizeUrl(input);
  await assertPublicHost(target.hostname);

  const httpsUrl = new URL(target.toString());
  httpsUrl.protocol = "https:";
  const httpUrl = new URL(target.toString());
  httpUrl.protocol = "http:";
  httpUrl.port = "";

  const [mainRes, httpRes, tlsRes] = await Promise.allSettled([
    fetchWithTimeout(target.toString(), "follow"),
    fetchWithTimeout(httpUrl.toString(), "manual"),
    getTlsInfo(httpsUrl.hostname, Number(httpsUrl.port) || 443),
  ]);

  const tlsInfo = tlsRes.status === "fulfilled" ? tlsRes.value : null;

  let res: BasicResponse;
  if (mainRes.status === "fulfilled") {
    res = mainRes.value;
  } else if (tlsInfo && !tlsInfo.trusted) {
    // Certificate problem: still read the headers so the report is complete.
    try {
      res = await insecureGet(httpsUrl.toString());
    } catch (err) {
      throw new WebsiteScanError(`Could not reach ${target.hostname}: ${(err as Error).message}`);
    }
  } else {
    const reason = mainRes.reason as Error & { cause?: { code?: string; message?: string } };
    const detail = reason?.name === "TimeoutError"
      ? "timed out after 8 seconds"
      : reason?.cause?.code || reason?.cause?.message || reason?.message || "request failed";
    throw new WebsiteScanError(`Could not reach ${target.hostname}: ${detail}`);
  }

  const finalUrl = res.url || target.toString();
  const finalIsHttps = finalUrl.startsWith("https://");
  const httpsStatus = Boolean(tlsInfo) && (finalIsHttps || target.protocol === "https:");

  let redirectsToHttps: boolean | null = null;
  if (httpRes.status === "fulfilled") {
    const r = httpRes.value;
    const loc = r.headers.get("location") || "";
    redirectsToHttps = r.status >= 300 && r.status < 400 && /^https:\/\//i.test(new URL(loc || "/", httpUrl).toString());
  }

  // Security headers from the final response.
  const headerChecks: SecurityHeaderCheck[] = HEADERS.map((h) => {
    const value = res.headers.get(h.name);
    return { name: h.name, present: Boolean(value), value: value ? value.slice(0, 300) : undefined };
  });
  const csp = res.headers.get("content-security-policy") || "";
  const frameAncestors = /frame-ancestors/i.test(csp);

  const findings: WebsiteFinding[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // TLS / HTTPS (max 50)
  let daysRemaining: number | null = null;
  if (!tlsInfo) {
    findings.push({
      id: "no-https",
      title: "HTTPS not available",
      severity: "critical",
      description: `Could not complete a TLS handshake with ${httpsUrl.hostname}:443${
        tlsRes.status === "rejected" ? ` (${(tlsRes.reason as Error)?.message})` : ""
      }. Traffic to this site can be read or modified in transit.`,
    });
    recommendations.push("Enable HTTPS with a certificate from a trusted CA (e.g. Let's Encrypt).");
  } else {
    daysRemaining = Math.floor((+new Date(tlsInfo.validTo) - Date.now()) / 86_400_000);
    if (tlsInfo.trusted) score += 25;
    else {
      findings.push({
        id: "untrusted-cert",
        title: "Certificate not trusted",
        severity: "critical",
        description: `Browsers will warn visitors: ${tlsInfo.trustError}.`,
      });
      recommendations.push("Install a valid certificate chain issued by a trusted CA for this hostname.");
    }
    if (daysRemaining < 0) {
      findings.push({ id: "cert-expired", title: "Certificate expired", severity: "critical", description: `Expired on ${tlsInfo.validTo.slice(0, 10)}.` });
      recommendations.push("Renew the TLS certificate immediately.");
    } else if (daysRemaining < 14) {
      findings.push({ id: "cert-expiring", title: "Certificate expires soon", severity: "medium", description: `Expires in ${daysRemaining} day(s), on ${tlsInfo.validTo.slice(0, 10)}.` });
      recommendations.push("Renew the TLS certificate and automate renewal.");
      score += 2;
    } else score += 5;

    if (tlsInfo.protocol === "TLS 1.3") score += 10;
    else if (tlsInfo.protocol === "TLS 1.2") score += 7;
    else {
      findings.push({ id: "old-tls", title: `Outdated protocol (${tlsInfo.protocol})`, severity: "high", description: "TLS 1.0/1.1 are deprecated and vulnerable." });
      recommendations.push("Disable TLS 1.0/1.1 and enable TLS 1.2 and 1.3.");
    }
  }

  if (redirectsToHttps === true) score += 10;
  else if (tlsInfo) {
    findings.push({
      id: "no-https-redirect",
      title: "HTTP does not redirect to HTTPS",
      severity: "medium",
      description: redirectsToHttps === null
        ? "The plain-HTTP version of the site could not be checked."
        : "Visitors who type the address without https:// stay on an unencrypted connection.",
    });
    if (redirectsToHttps === false) recommendations.push("Redirect all http:// requests to https:// with a 301.");
  }

  // Headers (max 45; X-Frame-Options also satisfied by CSP frame-ancestors)
  for (const h of HEADERS) {
    const present = headerChecks.find((c) => c.name === h.name)?.present ||
      (h.name === "X-Frame-Options" && frameAncestors);
    if (present) score += h.points;
    else {
      findings.push({
        id: `missing-${h.name.toLowerCase()}`,
        title: `Missing ${h.name} header`,
        severity: h.severity,
        description: h.advice,
      });
      recommendations.push(h.advice);
    }
  }
  if (!tlsInfo) score = Math.min(score, 20); // no HTTPS caps the score

  score = Math.max(0, Math.min(100, Math.round((score / 95) * 100)));
  const grade = gradeFor(score);

  if (recommendations.length === 0) {
    recommendations.push("No issues found in the checks performed. Re-scan after deployments to catch regressions.");
  }

  return {
    url: target.toString(),
    finalUrl,
    httpStatus: res.status,
    scannedAt: new Date().toISOString(),
    httpsStatus,
    redirectsToHttps,
    sslInfo: {
      issuer: tlsInfo?.issuer || "None",
      validFrom: tlsInfo ? tlsInfo.validFrom.slice(0, 10) : "—",
      validTo: tlsInfo ? tlsInfo.validTo.slice(0, 10) : "—",
      daysRemaining,
      trusted: tlsInfo?.trusted ?? false,
      trustError: tlsInfo?.trustError,
      grade,
      protocol: tlsInfo?.protocol || "N/A",
    },
    certificateInfo: {
      subject: tlsInfo?.subject || "—",
      san: tlsInfo?.san ?? [],
      signatureAlgorithm: tlsInfo?.publicKey || "—",
    },
    securityHeaders: headerChecks,
    findings,
    openPorts: [],
    knownVulnerabilities: [],
    securityRecommendations: recommendations,
    overallScore: score,
    grade,
  };
}
