"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface ActivityChartProps {
  data: ChartDataPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const has = (key: "threats" | "blocked" | "resolved") =>
    data.some((d) => typeof d[key] === "number");
  const total = data.reduce(
    (sum, d) => sum + (d.threats ?? 0) + (d.blocked ?? 0) + (d.resolved ?? 0),
    0
  );
  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
        <p className="font-medium">No activity in the last 7 days</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Alerts raised and resolved by your scans will be charted here.
        </p>
      </div>
    );
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="threats" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="blocked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 12,
            }}
          />
          <Legend />
          {has("threats") && (
            <Area
              type="monotone"
              dataKey="threats"
              name="Alerts raised"
              stroke="#f87171"
              fill="url(#threats)"
              strokeWidth={2}
            />
          )}
          {has("blocked") && (
            <Area
              type="monotone"
              dataKey="blocked"
              stroke="#22d3ee"
              fill="url(#blocked)"
              strokeWidth={2}
            />
          )}
          {has("resolved") && (
            <Area
              type="monotone"
              dataKey="resolved"
              name="Resolved"
              stroke="#34d399"
              fill="url(#resolved)"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
