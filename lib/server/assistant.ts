import { randomUUID } from "crypto";
import type { ChatMessage } from "@/types";
import { getUserSecuritySummary } from "@/lib/server/platform-data";

const KNOWLEDGE: { patterns: RegExp[]; response: string }[] = [
  {
    patterns: [/email.*safe/i, /is this email/i, /phishing/i, /suspicious email/i],
    response:
      "To assess email safety, look for: (1) unexpected urgency or threats, (2) mismatched sender domains, (3) links that don't match the claimed brand, (4) requests for credentials or payments. Paste the email into **Phishing Detection** for a heuristic threat score.",
  },
  {
    patterns: [/improve.*security/i, /harden/i, /best practice/i, /how can i improve/i],
    response:
      "High-impact improvements: enforce phishing-resistant MFA, patch critical CVEs quickly, isolate at-risk devices, run phishing simulations, enable real-time protection, and review Alerts Center daily.",
  },
  {
    patterns: [/vulnerabilit/i, /cve/i, /explain.*vuln/i],
    response:
      "A vulnerability is a weakness attackers can exploit. CVEs identify published flaws. Prioritize critical/high issues with known exploit paths and patch quickly.",
  },
  {
    patterns: [/after.*phishing/i, /got phished/i, /clicked.*link/i, /what should i do/i],
    response:
      "If you may have been phished: disconnect if malware is suspected, change passwords from a clean device, revoke sessions, enable MFA, notify security, scan the device, and monitor accounts.",
  },
  {
    patterns: [/ransomware/i],
    response:
      "Ransomware priorities: immutable backups, least privilege, email filtering, patching, and EDR. If infected, isolate systems, avoid paying unless advised by IR/legal, restore from clean backups, rotate credentials.",
  },
  {
    patterns: [/mfa|2fa|two.factor/i],
    response:
      "Prefer phishing-resistant MFA (passkeys / hardware keys) over SMS OTP. Enable 2FA for privileged accounts first.",
  },
];

const DEFAULT =
  "I'm CyberGuard AI, your security assistant. Ask about phishing, vulnerabilities, incident response, or hardening, ask for a summary of your alerts and devices, or use the scanners in the sidebar.";

const ABOUT_MY_DATA = [
  /\bmy (alerts?|devices?|status|posture|score)\b/i,
  /security score/i,
  /\b(summary|summari[sz]e|overview)\b/i,
  /what('s| is) (open|at risk)/i,
];

async function summaryReply(userId: string) {
  const s = await getUserSecuritySummary(userId);
  if (s.openAlerts.length === 0 && s.devices.length === 0) {
    return "You don't have any alerts or devices yet. Run a scan (Website Scanner, Phishing Detection or Malware Scanner) or add devices under **Devices**, and I can summarise the results here.";
  }
  const severe = s.openAlerts.filter((a) => a.riskLevel === "critical" || a.riskLevel === "high");
  const atRisk = s.devices.filter((d) => d.status === "at_risk");
  const lines = [
    `Your security score is **${s.score}/100** (${s.risk} risk).`,
    `Open alerts: ${s.openAlerts.length} (${severe.length} critical/high).`,
    `Devices: ${s.devices.length} in inventory, ${atRisk.length} at risk.`,
  ];
  if (severe.length) {
    lines.push("Top items to handle:");
    for (const a of severe.slice(0, 3)) lines.push(`- [${a.riskLevel}] ${a.title}`);
  }
  return lines.join("\n");
}

export async function assistantReply(content: string, userId?: string): Promise<ChatMessage> {
  let reply: string | undefined;
  if (userId && ABOUT_MY_DATA.some((p) => p.test(content))) {
    reply = await summaryReply(userId);
  }
  if (!reply) {
    const match = KNOWLEDGE.find((entry) =>
      entry.patterns.some((p) => p.test(content))
    );
    reply = match?.response ?? DEFAULT;
  }
  return {
    id: randomUUID(),
    role: "assistant",
    content: reply,
    timestamp: new Date().toISOString(),
  };
}
