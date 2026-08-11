"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Badge } from "@/components/ui/badge";
import type { Alert } from "@/types";
import { formatRelativeTime, getRiskBg, cn } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
  onClick?: () => void;
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-cyan-500/40",
        getRiskBg(alert.riskLevel)
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={alert.riskLevel} />
            <Badge variant="outline" className="capitalize text-[10px]">
              {alert.status}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(alert.timestamp)}
            </span>
          </div>
          <h4 className="mt-2 truncate font-medium">{alert.title}</h4>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {alert.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {alert.source} · {alert.category}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
