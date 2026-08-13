import { randomUUID } from "crypto";
import type { ChatMessage } from "@/types";

const KNOWLEDGE: { patterns: RegExp[]; response: string }[] = [
  {
    patterns: [/email.*safe/i, /is this email/i, /phishing/i, /suspicious email/i],
    response:
      "To assess email safety, look for: (1) unexpected urgency or threats, (2) mismatched sender domains, (3) links that don't match the claimed brand, (4) requests for credentials or payments. Paste the email into **Phishing Detection** for a full AI threat score.",
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
  "I'm CyberGuard AI, your security assistant. Ask about phishing, vulnerabilities, incident response, or hardening — or use the scanners in the sidebar.";

export function assistantReply(content: string): ChatMessage {
  const match = KNOWLEDGE.find((entry) =>
    entry.patterns.some((p) => p.test(content))
  );
  return {
    id: randomUUID(),
    role: "assistant",
    content: match?.response ?? DEFAULT,
    timestamp: new Date().toISOString(),
  };
}
