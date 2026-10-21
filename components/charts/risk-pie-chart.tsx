"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/types";

const COLORS = ["#f87171", "#fb923c", "#fbbf24", "#34d399"];

interface RiskPieChartProps {
  data: ChartDataPoint[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function RiskPieChart({
  data,
  emptyTitle = "No alerts yet",
  emptyDescription = "Run a scan to get started.",
}: RiskPieChartProps) {
  const total = data.reduce((sum, d) => sum + (d.value ?? 0), 0);
  if (total === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 12,
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
