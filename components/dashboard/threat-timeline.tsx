"use client";

import { motion } from "framer-motion";
import type { ThreatTimelineEvent } from "@/types";
import { RiskBadge } from "@/components/shared/risk-badge";
import { formatRelativeTime } from "@/lib/utils";

interface ThreatTimelineProps {
  events: ThreatTimelineEvent[];
}

export function ThreatTimeline({ events }: ThreatTimelineProps) {
  return (
    <ol className="relative space-y-0 border-l border-border ml-3">
      {events.map((event, index) => (
        <motion.li
          key={event.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="mb-6 ml-6"
        >
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-cyan-400 bg-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={event.riskLevel} />
            <time className="text-xs text-muted-foreground">
              {formatRelativeTime(event.timestamp)}
            </time>
          </div>
          <h4 className="mt-2 font-medium">{event.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.description}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}
