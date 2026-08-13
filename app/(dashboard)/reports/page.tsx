"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecurityScoreGauge } from "@/components/dashboard/security-score-gauge";
import { RiskPieChart } from "@/components/charts/risk-pie-chart";
import { ActivityChart } from "@/components/charts/activity-chart";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { formatDate } from "@/lib/utils";
import { RiskBadge } from "@/components/shared/risk-badge";
import type { ChartDataPoint, RiskLevel, SecurityReport } from "@/types";
import { fetchReport } from "@/services/platform.service";

export default function ReportsPage() {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [activity, setActivity] = useState<ChartDataPoint[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<ChartDataPoint[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReport()
      .then((data) => {
        if (cancelled) return;
        setReport(data.report);
        setActivity(data.activity);
        setRiskDistribution(data.riskDistribution);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load report");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader
          title="Security Reports"
          description="Executive summary of posture, threats, and recommendations"
        />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div>
        <PageHeader
          title="Security Reports"
          description="Executive summary of posture, threats, and recommendations"
        />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Security Reports"
        description="Executive summary of posture, threats, and recommendations"
        actions={
          <Button
            variant="gradient"
            onClick={() =>
              toast.success("Report data loaded from API — PDF export coming soon")
            }
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <FileText className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold">{report.title}</h3>
              <p className="text-sm text-muted-foreground">
                Generated {formatDate(report.generatedAt)}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Report ID: {report.id}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overall Security Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SecurityScoreGauge score={report.overallScore} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Threat Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {report.threatSummary}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {(Object.entries(report.alertsCount) as [RiskLevel, number][])
                .filter(([, count]) => count > 0)
                .map(([level, count]) => (
                  <div
                    key={level}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <RiskBadge level={level} />
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {report.riskAnalysis}
            </p>
            <div className="mt-6">
              <RiskPieChart data={riskDistribution} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activity} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <li
                key={rec}
                className="flex gap-3 rounded-lg border border-border bg-muted/20 p-4 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
