export function getThreatIntelligence() {
  const now = Date.now();
  const iso = (hoursAgo: number) =>
    new Date(now - hoursAgo * 3600_000).toISOString();

  return {
    latestThreats: [
      {
        id: "ti-001",
        name: "LockBit 4.0",
        type: "ransomware",
        severity: "critical",
        description:
          "Updated ransomware-as-a-service variant targeting enterprise Windows environments via phishing and RDP brute force.",
        firstSeen: "2024-11-12",
        lastSeen: iso(0),
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
        lastSeen: iso(6),
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
        lastSeen: iso(2),
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
        lastSeen: iso(12),
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
        lastSeen: iso(1.5),
        countries: ["US", "GB", "IN"],
      },
    ],
    malwareFamilies: [
      { name: "LockBit", activity: 92, trend: "+12%" },
      { name: "Emotet", activity: 78, trend: "+8%" },
      { name: "QakBot", activity: 65, trend: "-3%" },
      { name: "RedLine Stealer", activity: 71, trend: "+15%" },
      { name: "AgentTesla", activity: 54, trend: "+2%" },
    ],
    ransomwareTrends: [
      { name: "Jan", value: 42 },
      { name: "Feb", value: 48 },
      { name: "Mar", value: 55 },
      { name: "Apr", value: 51 },
      { name: "May", value: 63 },
      { name: "Jun", value: 71 },
      { name: "Jul", value: 68 },
    ],
    highRiskIPs: [
      {
        ip: "185.220.101.42",
        country: "DE",
        abuseScore: 98,
        categories: ["Tor Exit", "Brute Force"],
        lastReported: iso(0.4),
      },
      {
        ip: "45.33.32.156",
        country: "US",
        abuseScore: 87,
        categories: ["Scanning", "Malware C2"],
        lastReported: iso(1.3),
      },
      {
        ip: "103.27.238.94",
        country: "VN",
        abuseScore: 91,
        categories: ["Phishing Host", "Spam"],
        lastReported: iso(0.7),
      },
      {
        ip: "91.219.237.220",
        country: "NL",
        abuseScore: 95,
        categories: ["Ransomware C2"],
        lastReported: iso(0.25),
      },
      {
        ip: "194.26.29.118",
        country: "RU",
        abuseScore: 89,
        categories: ["Botnet", "DDoS"],
        lastReported: iso(2),
      },
    ],
    attackStatistics: [
      { name: "Phishing", value: 34 },
      { name: "Malware", value: 22 },
      { name: "Ransomware", value: 14 },
      { name: "Brute Force", value: 18 },
      { name: "Exploit Kits", value: 12 },
    ],
    cveFeed: [
      {
        cve: "CVE-2025-21415",
        severity: "critical",
        product: "Microsoft Exchange",
        description: "Remote code execution via crafted email headers.",
        published: "2025-07-12",
      },
      {
        cve: "CVE-2025-19882",
        severity: "high",
        product: "Apache HTTP Server",
        description: "Path traversal leading to arbitrary file read.",
        published: "2025-07-08",
      },
      {
        cve: "CVE-2025-17644",
        severity: "high",
        product: "OpenSSL",
        description: "Memory corruption in TLS handshake processing.",
        published: "2025-06-29",
      },
      {
        cve: "CVE-2025-15301",
        severity: "medium",
        product: "WordPress Core",
        description: "Stored XSS in comment moderation interface.",
        published: "2025-06-20",
      },
    ],
  };
}
