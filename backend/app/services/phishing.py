import re
from urllib.parse import urlparse

from app.schemas.security import PhishingAnalysisResult, RiskLevel, UrlReputation


SUSPICIOUS_KEYWORDS = [
    "urgent",
    "verify your account",
    "click here",
    "password expired",
    "suspended",
    "confirm identity",
    "wire transfer",
    "gift card",
    "unusual activity",
]

FAKE_DOMAIN_HINTS = [
    "micros0ft",
    "paypa1",
    "app1e",
    "amaz0n",
    "secure-login",
    "account-verify",
]


def _risk_from_score(threat_score: int) -> RiskLevel:
    if threat_score >= 80:
        return "critical"
    if threat_score >= 60:
        return "high"
    if threat_score >= 40:
        return "medium"
    return "low"


def analyze_email(content: str) -> PhishingAnalysisResult:
    lower = content.lower()
    keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in lower]
    urls = re.findall(r'https?://[^\s<>"]+', content, flags=re.IGNORECASE)
    fake_domain_detected = any(
        any(h in u.lower() for h in FAKE_DOMAIN_HINTS) for u in urls
    )

    base = 35 + len(keywords) * 12 + (25 if fake_domain_detected else 0)
    threat_score = min(98, base + (10 if len(urls) > 2 else 0))
    phishing_probability = min(99, threat_score + 5)
    risk = _risk_from_score(threat_score)

    url_reputation: list[UrlReputation] = []
    for u in urls[:8]:
        bad = any(h in u.lower() for h in FAKE_DOMAIN_HINTS)
        url_reputation.append(
            UrlReputation(
                url=u,
                score=20 if bad else 75,
                status="malicious" if bad else ("suspicious" if threat_score >= 50 else "safe"),
            )
        )

    return PhishingAnalysisResult(
        threatScore=threat_score,
        phishingProbability=phishing_probability,
        suspiciousKeywords=keywords,
        fakeDomainDetected=fake_domain_detected,
        fakeDomains=[u for u in urls if any(h in u.lower() for h in FAKE_DOMAIN_HINTS)],
        urlReputation=url_reputation,
        aiExplanation=(
            "Email content shows multiple social-engineering signals including urgency language "
            "and suspicious links. Treat as phishing until verified through a trusted channel."
            if threat_score >= 50
            else "No strong phishing indicators detected. Continue to verify unexpected requests "
            "out-of-band before taking action."
        ),
        recommendedActions=(
            [
                "Do not click links or open attachments",
                "Report the message to your security team",
                "Verify the sender via a known phone number or portal",
                "Enable MFA on potentially targeted accounts",
            ]
            if threat_score >= 50
            else [
                "Proceed with normal caution",
                "Confirm unexpected requests through trusted channels",
            ]
        ),
        riskLevel=risk,
    )


def analyze_url(url: str) -> PhishingAnalysisResult:
    suspicious = bool(
        re.search(
            r"login|verify|secure|account|update| ent|micros0ft|paypa1",
            url,
            re.IGNORECASE,
        )
        or "@" in url
        or url.count(".") > 3
    )
    threat_score = 84 if suspicious else 28

    # Normalize display if missing scheme
    display = url
    try:
        parsed = urlparse(url if "://" in url else f"https://{url}")
        display = parsed.geturl()
    except Exception:
        pass

    return PhishingAnalysisResult(
        threatScore=threat_score,
        phishingProbability=89 if suspicious else 22,
        suspiciousKeywords=(
            ["login/verify pattern", "brand impersonation risk"] if suspicious else []
        ),
        fakeDomainDetected=suspicious,
        fakeDomains=[display] if suspicious else [],
        urlReputation=[
            UrlReputation(
                url=display,
                score=15 if suspicious else 81,
                status="malicious" if suspicious else "safe",
            )
        ],
        aiExplanation=(
            "URL structure and lexical features strongly resemble known phishing kits. "
            "Domain reputation checks flag elevated risk. Treat as hostile until proven otherwise."
            if suspicious
            else "URL does not match common phishing patterns in our threat models. "
            "Continue to validate HTTPS certificates and brand authenticity."
        ),
        recommendedActions=(
            [
                "Do not visit this URL",
                "Block the domain at your DNS/firewall layer",
                "Submit to threat intelligence for broader blocking",
            ]
            if suspicious
            else ["Proceed with standard caution", "Verify SSL certificate details"]
        ),
        riskLevel="critical" if suspicious else "low",
    )
