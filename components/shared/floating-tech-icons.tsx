"use client";

import { motion } from "framer-motion";
import {
  Globe2,
  Laptop,
  Lightbulb,
  Monitor,
  RadioTower,
  Search,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons = [
  {
    Icon: Monitor,
    className: "left-[6%] top-[18%]",
    size: "h-10 w-10 sm:h-12 sm:w-12",
    duration: 7,
    delay: 0,
  },
  {
    Icon: Laptop,
    className: "right-[10%] top-[22%]",
    size: "h-9 w-9 sm:h-11 sm:w-11",
    duration: 8,
    delay: 0.6,
  },
  {
    Icon: Wifi,
    className: "right-[14%] top-[48%]",
    size: "h-8 w-8 sm:h-10 sm:w-10",
    duration: 6.5,
    delay: 1.1,
  },
  {
    Icon: RadioTower,
    className: "left-[12%] bottom-[22%]",
    size: "h-9 w-9 sm:h-11 sm:w-11",
    duration: 9,
    delay: 0.3,
  },
  {
    Icon: Lightbulb,
    className: "left-[46%] top-[12%]",
    size: "h-8 w-8 sm:h-9 sm:w-9",
    duration: 7.5,
    delay: 1.4,
  },
  {
    Icon: Globe2,
    className: "right-[22%] top-[12%]",
    size: "h-9 w-9 sm:h-10 sm:w-10",
    duration: 8.5,
    delay: 0.9,
  },
  {
    Icon: Search,
    className: "left-[28%] top-[55%]",
    size: "h-7 w-7 sm:h-8 sm:w-8",
    duration: 6.8,
    delay: 1.8,
  },
  {
    Icon: Wifi,
    className: "left-[58%] bottom-[18%]",
    size: "h-7 w-7 sm:h-8 sm:w-8",
    duration: 7.2,
    delay: 0.4,
  },
];

export function FloatingTechIcons({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[1] overflow-hidden",
        className
      )}
      aria-hidden
    >
      {icons.map(({ Icon, className: pos, size, duration, delay }, i) => (
        <motion.div
          key={i}
          className={cn("absolute", pos)}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: [0.35, 0.85, 0.45, 0.9, 0.35],
            y: [0, -18, 8, -12, 0],
            x: [0, 10, -8, 6, 0],
            rotate: [0, 4, -3, 2, 0],
            scale: [1, 1.08, 0.96, 1.05, 1],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="rounded-full border border-cyan-300/35 bg-slate-950/35 p-3 shadow-[0_0_28px_rgba(34,211,238,0.25)] backdrop-blur-[2px] sm:p-3.5">
            <Icon className={cn(size, "text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.65)]")} />
          </div>
        </motion.div>
      ))}

      {/* Soft drifting particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={`dot-${i}`}
          className="absolute h-1 w-1 rounded-full bg-cyan-200/70"
          style={{
            left: `${8 + ((i * 7) % 84)}%`,
            top: `${12 + ((i * 11) % 70)}%`,
          }}
          animate={{
            opacity: [0.15, 0.9, 0.2],
            y: [0, -24 - (i % 5) * 4, 0],
            scale: [1, 1.6, 1],
          }}
          transition={{
            duration: 4 + (i % 5),
            delay: i * 0.25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
