"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Unlock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { scanWebsite } from "@/services/website.service";
import type { WebsiteScanResult } from "@/types";

export default function WebsiteScannerPage() {
  const [url, setUrl] = useState("https://");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WebsiteScanResult | null>(null);

  const handleScan = async () => {
    if (!url.includes(".")) {
      toast.error("Enter a valid website URL");
      return;
    }
    setLoading(true);
    try {
      const res = await scanWebsite(url);
      setResult(res);
      toast.success("Website scan complete");
    } catch {
      toast.error("Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Website Security Scanner"
        description="Inspect HTTPS, SSL, domain reputation, and known vulnerabilities"
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
          <Button variant="gradient" onClick={handleScan} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Scan Website
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3">
                {result.httpsStatus ? (
                  <Lock className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Unlock className="h-5 w-5 text-red-400" />
                )}
                <div>
                  <p className="font-medium">
                    HTTPS {result.httpsStatus ? "Enabled" : "Missing"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {result.url}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Overall Security Score</span>
                  <span className="font-semibold">{result.overallScore}/100</span>
                </div>
                <Progress value={result.overallScore} indicatorClassName="bg-cyan-500" />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Domain Reputation</span>
                  <span className="font-semibold">
                    {result.domainReputation}/100
                  </span>
                </div>
                <Progress
                  value={result.domainReputation}
                  indicatorClassName="bg-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">SSL Grade</p>
                  <p className="mt-1 text-xl font-bold text-cyan-400">
                    {result.sslInfo.grade}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Protocol</p>
                  <p className="mt-1 text-xl font-bold">
                    {result.sslInfo.protocol}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SSL & Certificate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Issuer" value={result.sslInfo.issuer} />
              <Row label="Valid From" value={result.sslInfo.validFrom} />
              <Row label="Valid To" value={result.sslInfo.validTo} />
              <Row label="Subject" value={result.certificateInfo.subject} />
              <Row
                label="Algorithm"
                value={result.certificateInfo.signatureAlgorithm}
              />
              <div>
                <p className="text-muted-foreground">SAN</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.certificateInfo.san.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Ports (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.openPorts.map((p) => (
                <div
                  key={p.port}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {p.port}/{p.service}
                  </span>
                  <Badge
                    variant={
                      p.status === "open"
                        ? "medium"
                        : p.status === "filtered"
                          ? "info"
                          : "success"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vulnerabilities & Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.knownVulnerabilities.map((v) => (
                <div
                  key={v.cve}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-2">
                    <RiskBadge level={v.severity} />
                    <span className="font-mono text-sm">{v.cve}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {v.description}
                  </p>
                </div>
              ))}
              <div>
                <h4 className="mb-2 text-sm font-medium">Recommendations</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {result.securityRecommendations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
