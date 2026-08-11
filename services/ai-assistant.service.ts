import type { ChatMessage } from "@/types";
import { generateId, sleep } from "@/lib/utils";

/**
 * AI Security Assistant — mock conversational responses.
 * Future: OpenAI / custom FastAPI LLM endpoint with RAG over threat intel.
 */
const knowledgeBase: { patterns: RegExp[]; response: string }[] = [
  {
    patterns: [/email.*safe/i, /is this email/i, /phishing/i, /suspicious email/i],
    response:
      "To assess email safety, look for: (1) unexpected urgency or threats, (2) mismatched sender domains, (3) links that don't match the claimed brand, (4) requests for credentials or payments. Paste the email into **Phishing Detection** for a full AI threat score, keyword analysis, and recommended actions. When in doubt — don't click, report it.",
  },
  {
    patterns: [/improve.*security/i, /harden/i, /best practice/i, /how can i improve/i],
    response:
      "Here are high-impact improvements for your security posture:\n\n1. **Enforce phishing-resistant MFA** (passkeys / hardware keys) on privileged accounts\n2. **Patch critical CVEs** within 48 hours — check Threat Intelligence for active exploits\n3. **Isolate at-risk devices** shown in Device Management\n4. **Run weekly phishing simulations** and security awareness training\n5. **Enable real-time protection** and auto-quarantine in Security Preferences\n6. **Review Alerts Center daily** for open critical/high items\n\nYour current security score is 78 — addressing the IoT camera risk and SSL expiry would likely push you above 85.",
  },
  {
    patterns: [/vulnerabilit/i, /cve/i, /explain.*vuln/i],
    response:
      "A vulnerability is a weakness in software or configuration that attackers can exploit. CVEs (Common Vulnerabilities and Exposures) uniquely identify published flaws.\n\n**Severity guide:**\n- **Critical** — remote code execution / full compromise; patch immediately\n- **High** — significant impact with known exploit paths\n- **Medium** — requires conditions or limited impact\n- **Low** — informational hardening opportunities\n\nCheck the Threat Intelligence CVE feed for actively exploited issues relevant to your stack. Use Website Scanner for host-specific findings.",
  },
  {
    patterns: [/after.*phishing/i, /got phished/i, /clicked.*link/i, /what should i do/i],
    response:
      "If you may have fallen for a phishing attack, act quickly:\n\n1. **Disconnect** from the network if malware is suspected\n2. **Change passwords** for the targeted account from a clean device\n3. **Revoke sessions / OAuth tokens** (Microsoft, Google, etc.)\n4. **Enable MFA** if not already active\n5. **Notify your security team** and file an incident\n6. **Scan the device** with Malware Scanner / endpoint protection\n7. **Monitor** bank and email for unauthorized activity\n8. **Check Have I Been Pwned** style breach monitoring for credential exposure\n\nI can walk you through any of these steps — tell me what happened.",
  },
  {
    patterns: [/alert/i, /analyze.*alert/i, /security alert/i],
    response:
      "To analyze a security alert, share the alert title, source, and any IOCs (IPs, hashes, URLs). Typical triage steps:\n\n1. Confirm **severity and blast radius**\n2. Validate whether it's a **true positive**\n3. Contain (isolate host, block IOC)\n4. Eradicate root cause\n5. Recover and document lessons learned\n\nOpen **Alerts Center** to filter critical/high items, or paste alert details here for AI-assisted triage guidance.",
  },
  {
    patterns: [/ransomware/i],
    response:
      "Ransomware encrypts files and demands payment. Prevention priorities: immutable backups, least privilege, email filtering, patch management, and EDR. If infected: isolate systems, do not pay unless advised by incident responders and legal counsel, restore from clean backups, and rotate credentials. LockBit remains highly active — see Threat Intelligence for trends.",
  },
  {
    patterns: [/mfa|2fa|two.factor/i],
    response:
      "Multi-factor authentication dramatically reduces account takeover risk. Prefer phishing-resistant methods (FIDO2/passkeys, hardware security keys) over SMS OTP. Enable 2FA in Settings → Security Preferences, and require it for all admin roles on Enterprise plans.",
  },
];

const defaultResponse =
  "I'm CyberGuard AI, your security assistant. I can help with phishing analysis, vulnerability explanations, incident response steps, and hardening guidance.\n\nTry asking:\n- *Is this email safe?*\n- *How can I improve my security?*\n- *Explain this vulnerability*\n- *What should I do after a phishing attack?*\n- *Analyze this security alert*\n\nYou can also use the dedicated scanners in the sidebar for deeper automated analysis.";

export async function sendChatMessage(
  userContent: string,
  history: ChatMessage[] = []
): Promise<ChatMessage> {
  await sleep(900 + Math.random() * 600);

  void history; // reserved for future context-aware LLM calls

  const match = knowledgeBase.find((entry) =>
    entry.patterns.some((p) => p.test(userContent))
  );

  return {
    id: generateId(),
    role: "assistant",
    content: match?.response ?? defaultResponse,
    timestamp: new Date().toISOString(),
  };
}

export function createUserMessage(content: string): ChatMessage {
  return {
    id: generateId(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };
}
