"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type SiteBackgroundProps = {
  className?: string;
  /** Slightly darker for forms/auth */
  intensity?: "default" | "strong";
};

export function SiteBackground({
  className,
  intensity = "default",
}: SiteBackgroundProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
      aria-hidden
    >
      <Image
        src="/images/site-bg.png"
        alt=""
        fill
        priority
        unoptimized
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className={cn(
          "absolute inset-0",
          intensity === "strong"
            ? "bg-slate-950/55"
            : "bg-slate-950/40"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-transparent to-slate-950/45" />
    </div>
  );
}
