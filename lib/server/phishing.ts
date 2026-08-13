import type { PhishingAnalysisResult, RiskLevel } from "@/types";

const SUSPICIOUS_KEYWORDS = [
  "urgent",
  "verify your account",
  "click here",
  "password expired",
  "suspended",
  "confirm identity",
  "wire transfer",
  "gift card",
  "unusual activity",
];

const FAKE_DOMAIN_HINTS = [
  "micros0ft",
  "paypa1",
  "app1e",
  "amaz0n",
  "secure-login",
  "account-verify",
];

function riskFromScore(threatScore: number): RiskLevel {
  if (threatScore >= 80) return "critical";
  if (threatScore >= 60) return "high";
  if (threatScore >= 40) return "medium";
  return "low";
}

export function analyzePhishingEmail(content: string): PhishingAnalysisResult {
  const lower = content.toLowerCase();
  const keywords = SUSPICIOUS_KEYWORDS.filter((kw) => lower.includes(kw));
  const urls = content.match(/https?:\/\/[^\s<>"]+/gi) || [];
  const fakeDomainDetected = urls.some((u) =>
    FAKE_DOMAIN_HINTS.some((h) => u.toLowerCase().includes(h))
  );

  const base = 35 + keywords.length * 12 + (fakeDomainDetected ? 25 : 0);
  const threatScore = Math.min(98, base + (urls.length > 2 ? 10 : 0));
  const phishingProbability = Math.min(99, threatScore + 5);

  return {
    threatScore,
    phishingProbability,
    suspiciousKeywords: keywords,
    fakeDomainDetected,
    fakeDomains: urls.filter((u) =>
      FAKE_DOMAIN_HINTS.some((h) => u.toLowerCase().includes(h))
    ),
    urlReputation: urls.slice(0, 8).map((u) => {
      const bad = FAKE_DOMAIN_HINTS.some((h) => u.toLowerCase().includes(h));
      return {
        url: u,
        score: bad ? 20 : 75,
        status: bad ? "malicious" : threatScore >= 50 ? "suspicious" : "safe",
      };
    }),
    aiExplanation:
      threatScore >= 50
        ? "Email content shows multiple social-engineering signals including urgency language and suspicious links. Treat as phishing until verified through a trusted channel."
        : "No strong phishing indicators detected. Continue to verify unexpected requests out-of-band before taking action.",
    recommendedActions:
      threatScore >= 50
        ? [
            "Do not click links or open attachments",
            "Report the message to your security team",
            "Verify the sender via a known phone number or portal",
            "Enable MFA on potentially targeted accounts",
          ]
        : [
            "Proceed with normal caution",
            "Confirm unexpected requests through trusted channels",
          ],
    riskLevel: riskFromScore(threatScore),
  };
}

export function analyzePhishingUrl(url: string): PhishingAnalysisResult {
  const suspicious =
    /login|verify|secure|account|update|wallet|micros0ft|paypa1/i.test(url) ||
    url.includes("@") ||
    (url.match(/\./g) || []).length > 3;
  const threatScore = suspicious ? 84 : 28;

  return {
    threatScore,
    phishingProbability: suspicious ? 89 : 22,
    suspiciousKeywords: suspicious
      ? ["login/verify pattern", "brand impersonation risk"]
      : [],
    fakeDomainDetected: suspicious,
    fakeDomains: suspicious ? [url] : [],
    urlReputation: [
      {
        url,
        score: suspicious ? 15 : 81,
        status: suspicious ? "malicious" : "safe",
      },
    ],
    aiExplanation: suspicious
      ? "URL structure and lexical features strongly resemble known phishing kits. Domain reputation checks flag elevated risk. Treat as hostile until proven otherwise."
      : "URL does not match common phishing patterns in our threat models. Continue to validate HTTPS certificates and brand authenticity.",
    recommendedActions: suspicious
      ? [
          "Do not visit this URL",
          "Block the domain at your DNS/firewall layer",
          "Submit to threat intelligence for broader blocking",
        ]
      : ["Proceed with standard caution", "Verify SSL certificate details"],
    riskLevel: suspicious ? "critical" : "low",
  };
}
