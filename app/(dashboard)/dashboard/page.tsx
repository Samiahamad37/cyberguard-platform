"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SecurityScoreGauge } from "@/components/dashboard/security-score-gauge";
import { AlertCard } from "@/components/dashboard/alert-card";
import { ThreatTimeline } from "@/components/dashboard/threat-timeline";
import { ActivityChart } from "@/components/charts/activity-chart";
import { RiskPieChart } from "@/components/charts/risk-pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import {
  fetchDashboard,
  type DashboardOverview,
} from "@/services/platform.service";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboard()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load dashboard");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader
          title="Security Overview"
          description="Real-time posture across devices, threats, and alerts"
        />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader
          title="Security Overview"
          description="Real-time posture across devices, threats, and alerts"
        />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Security Overview"
        description="Real-time posture across devices, threats, and alerts"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric, i) => (
          <MetricCard key={metric.label} metric={metric} index={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Security Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <SecurityScoreGauge score={data.securityScore} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Security Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart data={data.activity} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskPieChart data={data.riskDistribution} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Threat Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ThreatTimeline events={data.timeline} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
