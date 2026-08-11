"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/shared/risk-badge";
import type { SecurityMetric } from "@/types";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: SecurityMetric;
  index?: number;
}

export function MetricCard({ metric, index = 0 }: MetricCardProps) {
  const TrendIcon =
    metric.trend === "up"
      ? ArrowUpRight
      : metric.trend === "down"
        ? ArrowDownRight
        : Minus;

  const trendPositive =
    metric.label === "Active Threats"
      ? metric.trend === "down"
      : metric.trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </CardTitle>
          {metric.riskLevel && <RiskBadge level={metric.riskLevel} />}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{metric.value}</div>
          {typeof metric.change === "number" && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs",
                trendPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              <span>
                {metric.change > 0 ? "+" : ""}
                {metric.change} from last week
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
