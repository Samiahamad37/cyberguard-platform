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
          description="Actively exploited vulnerabilities from the CISA KEV catalog, plus optional connected feeds"
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
          description="Actively exploited vulnerabilities from the CISA KEV catalog, plus optional connected feeds"
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
    requiresApiKey,
    errors,
    sources,
  } = data;

  return (
    <div>
      <PageHeader
        title="Threat Intelligence"
        description="Actively exploited vulnerabilities from the CISA KEV catalog, plus optional connected feeds"
      />

      {sources?.kev ? (
        <p className="mb-4 text-xs text-muted-foreground">
          Source:{" "}
          <a
            href={sources.kev.url}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline"
          >
            {sources.kev.name}
          </a>{" "}
          · catalog {sources.kev.catalogVersion} · {sources.kev.count.toLocaleString()} entries
        </p>
      ) : errors?.kev ? (
        <p className="mb-4 text-sm text-red-400">{errors.kev}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Latest Threats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Most recent KEV entries known to be used in ransomware campaigns
            </p>
            {latestThreats.length === 0 && <NoData />}
            {latestThreats.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-border bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold">
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {t.name}
                      </a>
                    ) : (
                      t.name
                    )}
                  </h4>
                  <RiskBadge level={t.severity} />
                  <Badge variant="outline" className="capitalize">
                    {t.type}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Added to KEV {formatRelativeTime(t.lastSeen)}
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
            {requiresApiKey?.malwareFamilies ? (
              <ConnectSource envVar={requiresApiKey.malwareFamilies} provider="abuse.ch MalwareBazaar" />
            ) : malwareFamilies.length === 0 ? (
              <NoData message={errors?.malwareFamilies} />
            ) : null}
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
            <p className="mb-2 text-xs text-muted-foreground">
              Ransomware-linked KEV entries by month added
            </p>
            <BarTrendChart data={ransomwareTrends} color="#f87171" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attack Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-muted-foreground">
              Most-exploited vendors in KEV, last 12 months
            </p>
            <RiskPieChart
              data={attackStatistics}
              emptyTitle="No data available"
              emptyDescription="The KEV feed could not be loaded."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High-Risk IP Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requiresApiKey?.highRiskIPs ? (
              <ConnectSource envVar={requiresApiKey.highRiskIPs} provider="AbuseIPDB" />
            ) : highRiskIPs.length === 0 ? (
              <NoData message={errors?.highRiskIPs} />
            ) : null}
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
            {cveFeed.length === 0 && <NoData />}
            {cveFeed.map((cve) => (
              <div
                key={cve.cve}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {cve.url ? (
                    <a
                      href={cve.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sm hover:underline"
                    >
                      {cve.cve}
                    </a>
                  ) : (
                    <span className="font-mono text-sm">{cve.cve}</span>
                  )}
                  {cve.ransomware && <Badge variant="critical">Ransomware</Badge>}
                  <RiskBadge level={cve.severity as RiskLevel} />
                </div>
                <p className="mt-1 text-sm font-medium">{cve.product}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cve.description}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Added {cve.published}
                  {cve.dueDate ? ` · CISA due date ${cve.dueDate}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConnectSource({ envVar, provider }: { envVar: string; provider: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
      <p className="font-medium">Connect a data source</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a {provider} key as <span className="font-mono text-xs">{envVar}</span> to
        show live data here.
      </p>
    </div>
  );
}

function NoData({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {message || "No data available right now."}
    </div>
  );
}
