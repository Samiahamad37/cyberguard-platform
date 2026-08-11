"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { BarTrendChart } from "@/components/charts/bar-trend-chart";
import { RiskPieChart } from "@/components/charts/risk-pie-chart";
import { Progress } from "@/components/ui/progress";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import {
  fetchThreatIntelligence,
  type ThreatIntelligencePayload,
} from "@/services/threat-intel.service";
import { formatRelativeTime } from "@/lib/utils";
import type { RiskLevel } from "@/types";

export default function ThreatIntelligencePage() {
  const [data, setData] = useState<ThreatIntelligencePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchThreatIntelligence()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load threat intel");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader
          title="Threat Intelligence"
          description="Latest threats, malware families, ransomware trends, and CVE feed"
        />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader
          title="Threat Intelligence"
          description="Latest threats, malware families, ransomware trends, and CVE feed"
        />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const {
    latestThreats,
    malwareFamilies,
    ransomwareTrends,
    highRiskIPs,
    attackStatistics,
    cveFeed,
  } = data;

  return (
    <div>
      <PageHeader
        title="Threat Intelligence"
        description="Latest threats, malware families, ransomware trends, and CVE feed"
      />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Latest Threats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestThreats.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-border bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold">{t.name}</h4>
                  <RiskBadge level={t.severity} />
                  <Badge variant="outline" className="capitalize">
                    {t.type}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Last seen {formatRelativeTime(t.lastSeen)}
                  {t.countries ? ` · ${t.countries.join(", ")}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Malware Families</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {malwareFamilies.map((m) => (
              <div key={m.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="text-cyan-400">{m.trend}</span>
                </div>
                <Progress value={m.activity} indicatorClassName="bg-violet-500" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ransomware Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <BarTrendChart data={ransomwareTrends} color="#f87171" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attack Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskPieChart data={attackStatistics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High-Risk IP Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highRiskIPs.map((ip) => (
              <div
                key={ip.ip}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300">{ip.ip}</span>
                  <Badge variant="critical">{ip.abuseScore}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ip.country} · {ip.categories.join(", ")} ·{" "}
                  {formatRelativeTime(ip.lastReported)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Threat Heat Map (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
              <div className="text-center">
                <p className="font-medium">Global threat heat map</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placeholder for geographic attack density visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>CVE Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cveFeed.map((cve) => (
              <div
                key={cve.cve}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm">{cve.cve}</span>
                  <RiskBadge level={cve.severity as RiskLevel} />
                </div>
                <p className="mt-1 text-sm font-medium">{cve.product}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cve.description}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Published {cve.published}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
