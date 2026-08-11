from typing import Literal

from pydantic import BaseModel, Field


RiskLevel = Literal["critical", "high", "medium", "low", "info"]


class UrlReputation(BaseModel):
    url: str
    score: int
    status: Literal["safe", "suspicious", "malicious"]


class PhishingAnalysisResult(BaseModel):
    threatScore: int
    phishingProbability: int
    suspiciousKeywords: list[str]
    fakeDomainDetected: bool
    fakeDomains: list[str]
    urlReputation: list[UrlReputation]
    aiExplanation: str
    recommendedActions: list[str]
    riskLevel: RiskLevel


class PhishingEmailRequest(BaseModel):
    content: str = Field(min_length=20)


class PhishingUrlRequest(BaseModel):
    url: str = Field(min_length=4)


class Detection(BaseModel):
    engine: str
    result: str


class MalwareScanResult(BaseModel):
    malwareRisk: int
    fileReputation: Literal["trusted", "unknown", "suspicious", "malicious"]
    virusDetected: bool
    detections: list[Detection]
    aiAnalysis: str
    threatCategory: str
    riskLevel: RiskLevel
    hash: str | None = None
    fileName: str | None = None


class HashScanRequest(BaseModel):
    hash: str = Field(min_length=32, max_length=64)


class UrlScanRequest(BaseModel):
    url: str = Field(min_length=4)


class SslInfo(BaseModel):
    issuer: str
    validFrom: str
    validTo: str
    grade: str
    protocol: str


class CertificateInfo(BaseModel):
    subject: str
    san: list[str]
    signatureAlgorithm: str


class OpenPort(BaseModel):
    port: int
    service: str
    status: str


class Vulnerability(BaseModel):
    cve: str
    severity: RiskLevel
    description: str


class WebsiteScanResult(BaseModel):
    url: str
    httpsStatus: bool
    sslInfo: SslInfo
    domainReputation: int
    certificateInfo: CertificateInfo
    openPorts: list[OpenPort]
    knownVulnerabilities: list[Vulnerability]
    securityRecommendations: list[str]
    overallScore: int


class WebsiteScanRequest(BaseModel):
    url: str = Field(min_length=4)


class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: str


class ChatRequest(BaseModel):
    content: str = Field(min_length=1)
    history: list[ChatMessage] = []


class ThreatIntelItem(BaseModel):
    id: str
    name: str
    type: Literal["malware", "ransomware", "apt", "phishing", "botnet"]
    severity: RiskLevel
    description: str
    firstSeen: str
    lastSeen: str
    countries: list[str] | None = None


class HighRiskIP(BaseModel):
    ip: str
    country: str
    abuseScore: int
    categories: list[str]
    lastReported: str


class ThreatIntelResponse(BaseModel):
    latestThreats: list[ThreatIntelItem]
    malwareFamilies: list[dict]
    ransomwareTrends: list[dict]
    highRiskIPs: list[HighRiskIP]
    attackStatistics: list[dict]
    cveFeed: list[dict]
