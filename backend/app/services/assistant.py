import re
import uuid
from datetime import datetime, timezone

from app.schemas.security import ChatMessage

KNOWLEDGE_BASE: list[tuple[list[re.Pattern[str]], str]] = [
    (
        [
            re.compile(r"email.*safe", re.I),
            re.compile(r"is this email", re.I),
            re.compile(r"phishing", re.I),
            re.compile(r"suspicious email", re.I),
        ],
        "To assess email safety, look for: (1) unexpected urgency or threats, (2) mismatched "
        "sender domains, (3) links that don't match the claimed brand, (4) requests for "
        "credentials or payments. Paste the email into **Phishing Detection** for a full AI "
        "threat score, keyword analysis, and recommended actions. When in doubt — don't click, "
        "report it.",
    ),
    (
        [
            re.compile(r"improve.*security", re.I),
            re.compile(r"harden", re.I),
            re.compile(r"best practice", re.I),
            re.compile(r"how can i improve", re.I),
        ],
        "Here are high-impact improvements for your security posture:\n\n"
        "1. **Enforce phishing-resistant MFA** (passkeys / hardware keys) on privileged accounts\n"
        "2. **Patch critical CVEs** within 48 hours — check Threat Intelligence for active exploits\n"
        "3. **Isolate at-risk devices** shown in Device Management\n"
        "4. **Run weekly phishing simulations** and security awareness training\n"
        "5. **Enable real-time protection** and auto-quarantine in Security Preferences\n"
        "6. **Review Alerts Center daily** for open critical/high items\n\n"
        "Your current security score is 78 — addressing the IoT camera risk and SSL expiry would "
        "likely push you above 85.",
    ),
    (
        [
            re.compile(r"vulnerabilit", re.I),
            re.compile(r"cve", re.I),
            re.compile(r"explain.*vuln", re.I),
        ],
        "A vulnerability is a weakness in software or configuration that attackers can exploit. "
        "CVEs (Common Vulnerabilities and Exposures) uniquely identify published flaws.\n\n"
        "**Severity guide:**\n"
        "- **Critical** — remote code execution / full compromise; patch immediately\n"
        "- **High** — significant impact with known exploit paths\n"
        "- **Medium** — requires conditions or limited impact\n"
        "- **Low** — informational hardening opportunities\n\n"
        "Check the Threat Intelligence CVE feed for actively exploited issues relevant to your "
        "stack. Use Website Scanner for host-specific findings.",
    ),
    (
        [
            re.compile(r"after.*phishing", re.I),
            re.compile(r"got phished", re.I),
            re.compile(r"clicked.*link", re.I),
            re.compile(r"what should i do", re.I),
        ],
        "If you may have fallen for a phishing attack, act quickly:\n\n"
        "1. **Disconnect** from the network if malware is suspected\n"
        "2. **Change passwords** for the targeted account from a clean device\n"
        "3. **Revoke sessions / OAuth tokens** (Microsoft, Google, etc.)\n"
        "4. **Enable MFA** if not already active\n"
        "5. **Notify your security team** and file an incident\n"
        "6. **Scan the device** with Malware Scanner / endpoint protection\n"
        "7. **Monitor** bank and email for unauthorized activity\n"
        "8. **Check Have I Been Pwned** style breach monitoring for credential exposure\n\n"
        "I can walk you through any of these steps — tell me what happened.",
    ),
    (
        [
            re.compile(r"alert", re.I),
            re.compile(r"analyze.*alert", re.I),
            re.compile(r"security alert", re.I),
        ],
        "To analyze a security alert, share the alert title, source, and any IOCs (IPs, hashes, URLs). "
        "Typical triage steps:\n\n"
        "1. Confirm **severity and blast radius**\n"
        "2. Validate whether it's a **true positive**\n"
        "3. Contain (isolate host, block IOC)\n"
        "4. Eradicate root cause\n"
        "5. Recover and document lessons learned\n\n"
        "Open **Alerts Center** to filter critical/high items, or paste alert details here for "
        "AI-assisted triage guidance.",
    ),
    (
        [re.compile(r"ransomware", re.I)],
        "Ransomware encrypts files and demands payment. Prevention priorities: immutable backups, "
        "least privilege, email filtering, patch management, and EDR. If infected: isolate systems, "
        "do not pay unless advised by incident responders and legal counsel, restore from clean "
        "backups, and rotate credentials. LockBit remains highly active — see Threat Intelligence "
        "for trends.",
    ),
    (
        [re.compile(r"mfa|2fa|two.factor", re.I)],
        "Multi-factor authentication dramatically reduces account takeover risk. Prefer "
        "phishing-resistant methods (FIDO2/passkeys, hardware security keys) over SMS OTP. "
        "Enable 2FA in Settings → Security Preferences, and require it for all admin roles on "
        "Enterprise plans.",
    ),
]

DEFAULT_RESPONSE = (
    "I'm CyberGuard AI, your security assistant. I can help with phishing analysis, "
    "vulnerability explanations, incident response steps, and hardening guidance.\n\n"
    "Try asking:\n"
    "- *Is this email safe?*\n"
    "- *How can I improve my security?*\n"
    "- *Explain this vulnerability*\n"
    "- *What should I do after a phishing attack?*\n"
    "- *Analyze this security alert*\n\n"
    "You can also use the dedicated scanners in the sidebar for deeper automated analysis."
)


def reply(user_content: str, history: list[ChatMessage] | None = None) -> ChatMessage:
    _ = history  # reserved for future LLM context
    matched = DEFAULT_RESPONSE
    for patterns, response in KNOWLEDGE_BASE:
        if any(p.search(user_content) for p in patterns):
            matched = response
            break

    return ChatMessage(
        id=str(uuid.uuid4()),
        role="assistant",
        content=matched,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
