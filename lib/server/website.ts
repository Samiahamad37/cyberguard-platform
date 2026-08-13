import type { WebsiteScanResult } from "@/types";

export function scanWebsite(url: string): WebsiteScanResult {
  let raw = url.trim();
  if (!raw.includes("://")) raw = `https://${raw}`;

  let hostname = raw;
  try {
    hostname = new URL(raw).hostname;
  } catch {
    hostname = raw.replace(/^https?:\/\//, "").split("/")[0];
  }

  const httpsStatus = raw.startsWith("https://");
  const domainReputation = httpsStatus ? 76 : 34;
  const overallScore = httpsStatus ? 72 : 38;

  return {
    url: raw,
    httpsStatus,
    sslInfo: {
      issuer: httpsStatus ? "Let's Encrypt Authority X3" : "None",
      validFrom: "2025-03-01",
      validTo: "2026-03-01",
      grade: httpsStatus ? "A-" : "F",
      protocol: httpsStatus ? "TLS 1.3" : "N/A",
    },
    domainReputation,
    certificateInfo: {
      subject: `CN=${hostname}`,
      san: [`DNS:${hostname}`, `DNS:www.${hostname}`],
      signatureAlgorithm: "SHA256-RSA",
    },
    openPorts: [
      { port: 80, service: "HTTP", status: "open" },
      { port: 443, service: "HTTPS", status: httpsStatus ? "open" : "closed" },
      { port: 22, service: "SSH", status: "filtered" },
      { port: 3389, service: "RDP", status: "closed" },
    ],
    knownVulnerabilities: httpsStatus
      ? [
          {
            cve: "CVE-2024-XXXX",
            severity: "medium",
            description: "Outdated server banner may disclose version information.",
          },
        ]
      : [
          {
            cve: "N/A-HTTPS-MISSING",
            severity: "critical",
            description: "Site does not enforce HTTPS — traffic can be intercepted.",
          },
          {
            cve: "CVE-2025-19882",
            severity: "high",
            description: "Potential path traversal if running vulnerable Apache versions.",
          },
        ],
    securityRecommendations: [
      httpsStatus
        ? "Enable HSTS to enforce HTTPS for all visitors"
        : "Immediately enable HTTPS with a valid certificate",
      "Implement Content-Security-Policy headers",
      "Disable directory listing and verbose error pages",
      "Keep server software patched against latest CVEs",
      "Restrict management ports (SSH/RDP) to VPN or allowlists",
      "Enable WAF rules for common OWASP Top 10 attacks",
    ],
    overallScore,
  };
}
