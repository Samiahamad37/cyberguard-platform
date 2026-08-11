import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types";

const variantMap: Record<
  RiskLevel,
  "critical" | "high" | "medium" | "low" | "info"
> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <Badge variant={variantMap[level]} className="capitalize">
      {level}
    </Badge>
  );
}
