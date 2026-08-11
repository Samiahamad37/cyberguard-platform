import type { PhishingAnalysisResult } from "@/types";
import { sleep } from "@/lib/utils";

/**
 * Phishing analysis service — mock implementation.
 * Future: POST /api/v1/phishing/analyze → FastAPI + OpenAI + URLScan + Safe Browsing
 */
export async function analyzePhishingEmail(
  content: string
): Promise<PhishingAnalysisResult> {
  await sleep(1600);

  const lower = content.toLowerCase();
  const suspiciousKeywords = [
    "urgent",
    "verify your account",
    "click here",
    "password expired",
    "suspended",
    "confirm identity",
    "wire transfer",
    "gift card",
    "unusual activity",
  ].filter((kw) => lower.includes(kw));

  const urlRegex = /https?:\/\/[^\s<>"]+/gi;
  const urls = content.match(urlRegex) || [];
  const fakeDomainHints = [
    "micros0ft",
    "paypa1",
    "app1e",
    "amaz0n",
    "secure-login",
    "account-verify",
  ];
  const fakeDomainDetected = urls.some((u) =>
    fakeDomainHints.some((h) => u.toLowerCase().includes(h))
  );

  const baseScore = 35 + suspiciousKeywords.length * 12 + (fakeDomainDetected ? 25 : 0);
  const threatScore = Math.min(98, baseScore + (urls.length > 2 ? 10 : 0));
  const phishingProbability = Math.min(99, threatScore + 5);

  let riskLevel: PhishingAnalysisResult["riskLevel"] = "low";
  if (threatScore >= 80) riskLevel = "critical";
  else if (threatScore >= 60) riskLevel = "high";
  else if (threatScore >= 40) riskLevel = "medium";

  return {
    threatScore,
    phishingProbability,
    suspiciousKeywords:
      suspiciousKeywords.length > 0
        ? suspiciousKeywords
        : ["No high-confidence keywords detected"],
    fakeDomainDetected,
    fakeDomains: fakeDomainDetected
      ? urls.filter((u) =>
          fakeDomainHints.some((h) => u.toLowerCase().includes(h))
        )
      : [],
    urlReputation: urls.slice(0, 5).map((url) => ({
      url,
      score: fakeDomainDetected ? 12 : 72,
      status: (fakeDomainDetected
        ? "malicious"
        : threatScore > 50
          ? "suspicious"
          : "safe") as "safe" | "suspicious" | "malicious",
    })),
    aiExplanation:
      threatScore >= 60
        ? "This message exhibits multiple phishing indicators including urgency language, suspicious link structures, and brand impersonation patterns. The AI model classifies this as a likely credential-harvesting attempt. Do not click links or provide credentials."
        : "The content shows limited phishing signals. Some linguistic patterns warrant caution, but overall risk appears moderate to low. Verify sender authenticity through a secondary channel before taking action.",
    recommendedActions:
      threatScore >= 60
        ? [
            "Do not click any links or download attachments",
            "Report the email to your security team",
            "Mark as phishing in your email client",
            "If credentials were entered, reset passwords immediately",
            "Enable phishing-resistant MFA on affected accounts",
          ]
        : [
            "Verify the sender via an alternate trusted channel",
            "Hover over links to inspect destinations before clicking",
            "Keep this email quarantined until verified",
          ],
    riskLevel,
  };
}

export async function analyzePhishingUrl(
  url: string
): Promise<PhishingAnalysisResult> {
  await sleep(1400);

  const suspicious =
    /login|verify|secure|account|update| ent|micros0ft|paypa1/i.test(url) ||
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
