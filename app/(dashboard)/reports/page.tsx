"use client";

import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecurityScoreGauge } from "@/components/dashboard/security-score-gauge";
import { RiskPieChart } from "@/components/charts/risk-pie-chart";
import { ActivityChart } from "@/components/charts/activity-chart";
import { mockReport } from "@/lib/mock-data/threats";
import { activityChartData, riskDistribution } from "@/lib/mock-data/dashboard";
import { formatDate } from "@/lib/utils";
import { RiskBadge } from "@/components/shared/risk-badge";
import type { RiskLevel } from "@/types";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Security Reports"
        description="Executive summary of posture, threats, and recommendations"
        actions={
          <Button
            variant="gradient"
            onClick={() =>
              toast.info("PDF export coming soon — FastAPI endpoint placeholder")
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
              <h3 className="font-semibold">{mockReport.title}</h3>
              <p className="text-sm text-muted-foreground">
                Generated {formatDate(mockReport.generatedAt)}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Report ID: {mockReport.id}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overall Security Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SecurityScoreGauge score={mockReport.overallScore} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Threat Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {mockReport.threatSummary}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {(Object.entries(mockReport.alertsCount) as [RiskLevel, number][])
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
              {mockReport.riskAnalysis}
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
            <ActivityChart data={activityChartData} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {mockReport.recommendations.map((rec, i) => (
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
