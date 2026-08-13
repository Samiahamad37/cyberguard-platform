"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { AlertCard } from "@/components/dashboard/alert-card";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Alert, AlertStatus, RiskLevel } from "@/types";
import { BellOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { RiskBadge } from "@/components/shared/risk-badge";
import { fetchAlerts, updateAlert } from "@/services/platform.service";
import { toast } from "sonner";

const RISK_FILTERS: Array<RiskLevel | "all"> = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<RiskLevel | "all">("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Alert | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAlerts()
      .then((data) => {
        if (!cancelled) setAlerts(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load alerts");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchesQuery =
        !query ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.category.toLowerCase().includes(query.toLowerCase());
      const matchesRisk = risk === "all" || a.riskLevel === risk;
      const matchesStatus = status === "all" || a.status === status;
      return matchesQuery && matchesRisk && matchesStatus;
    });
  }, [alerts, query, risk, status]);

  const counts = useMemo(() => {
    return {
      critical: alerts.filter((a) => a.riskLevel === "critical").length,
      high: alerts.filter((a) => a.riskLevel === "high").length,
      medium: alerts.filter((a) => a.riskLevel === "medium").length,
      low: alerts.filter((a) => a.riskLevel === "low").length,
    };
  }, [alerts]);

  const setStatusFor = async (id: string, next: AlertStatus) => {
    try {
      const updated = await updateAlert(id, next);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSelected(updated);
      toast.success(`Alert marked ${next}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Alerts Center"
          description="Filter, search, and triage security alerts by severity"
        />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Alerts Center"
          description="Filter, search, and triage security alerts by severity"
        />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Alerts Center"
        description="Filter, search, and triage security alerts by severity"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["critical", counts.critical],
            ["high", counts.high],
            ["medium", counts.medium],
            ["low", counts.low],
          ] as const
        ).map(([level, count]) => (
          <button
            key={level}
            type="button"
            onClick={() => setRisk(level)}
            className="rounded-xl border border-border glass-panel p-4 text-left transition hover:border-cyan-500/40"
          >
            <RiskBadge level={level} />
            <p className="mt-3 text-2xl font-bold">{count}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {level} alerts
            </p>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search alerts..."
          className="flex-1"
        />
        <Select
          value={risk}
          onValueChange={(v) => setRisk(v as RiskLevel | "all")}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Risk level" />
          </SelectTrigger>
          <SelectContent>
            {RISK_FILTERS.map((r) => (
              <SelectItem key={r} value={r} className="capitalize">
                {r === "all" ? "All risks" : r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["all", "open", "acknowledged", "resolved", "dismissed"].map(
              (s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            setRisk("all");
            setStatus("all");
          }}
        >
          Reset
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No alerts match your filters"
          description="Try adjusting search keywords or risk level filters."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onClick={() => setSelected(alert)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.source} · {selected.category}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <RiskBadge level={selected.riskLevel} />
                  <span className="capitalize text-muted-foreground">
                    {selected.status}
                  </span>
                </div>
                <p className="text-muted-foreground">{selected.description}</p>
                <p className="text-xs text-muted-foreground">
                  Detected {formatDate(selected.timestamp)}
                </p>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatusFor(selected.id, "acknowledged")}
                >
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  variant="cyan"
                  onClick={() => setStatusFor(selected.id, "resolved")}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setStatusFor(selected.id, "dismissed")}
                >
                  Dismiss
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
