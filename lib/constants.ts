export const APP_NAME = "CyberGuard AI";
export const APP_TAGLINE = "Protect Your Digital World with AI";
export const APP_DESCRIPTION =
  "Intelligent cybersecurity assistant that helps detect, analyze, and respond to cyber threats using Artificial Intelligence.";

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#benefits", label: "Benefits" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export const DASHBOARD_NAV = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/alerts", label: "Alerts Center", icon: "Bell" },
      { href: "/threat-intelligence", label: "Threat Intel", icon: "Globe" },
    ],
  },
  {
    title: "Security Tools",
    items: [
      { href: "/phishing", label: "Phishing Detection", icon: "MailWarning" },
      { href: "/malware", label: "Malware Scanner", icon: "Bug" },
      { href: "/website-scanner", label: "Website Scanner", icon: "GlobeLock" },
      { href: "/ai-assistant", label: "AI Assistant", icon: "Bot" },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/devices", label: "Devices", icon: "Monitor" },
      { href: "/reports", label: "Reports", icon: "FileBarChart" },
      { href: "/settings", label: "Settings", icon: "Settings" },
    ],
  },
] as const;

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: 0,
    description: "Essential protection for individuals",
    features: [
      "Phishing email analysis",
      "URL reputation checks",
      "Basic threat alerts",
      "AI assistant (20 queries/day)",
      "1 protected device",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: 29,
    description: "Advanced security for professionals",
    features: [
      "Everything in Starter",
      "Malware file scanning",
      "Website security scanner",
      "Threat intelligence feed",
      "AI assistant (unlimited)",
      "5 protected devices",
      "Security reports",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 99,
    description: "Full-scale protection for teams",
    features: [
      "Everything in Professional",
      "Unlimited devices",
      "API access",
      "SSO & 2FA enforcement",
      "Custom threat models",
      "Priority support",
      "Dedicated SOC integration",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "How does CyberGuard AI detect phishing?",
    answer:
      "Our AI models analyze email content, sender reputation, URL structures, domain authenticity, and linguistic patterns associated with social engineering. Results include a threat score and actionable recommendations.",
  },
  {
    question: "Is my scanned data stored securely?",
    answer:
      "Yes. Uploaded files and emails are processed in isolated sandboxes, encrypted in transit and at rest, and automatically purged after analysis unless you explicitly save a report.",
  },
  {
    question: "Which threat intelligence sources do you use?",
    answer:
      "CyberGuard AI integrates with industry sources including VirusTotal, AbuseIPDB, URLScan.io, Have I Been Pwned, Shodan, and Google Safe Browsing — plus proprietary AI models.",
  },
  {
    question: "Can I integrate CyberGuard AI with my existing SOC?",
    answer:
      "Enterprise plans include REST API access, webhook alerts, and SIEM-friendly exports so you can pipe findings into tools like Splunk, Elastic, or Microsoft Sentinel.",
  },
  {
    question: "Does CyberGuard AI replace antivirus software?",
    answer:
      "CyberGuard AI complements endpoint protection. It specializes in AI-assisted analysis, phishing detection, threat intelligence, and security guidance — and works alongside traditional AV/EDR.",
  },
] as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
