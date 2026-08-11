"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 lg:pt-40">
      <div className="cyber-grid absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
          >
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Threat Defense
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="gradient-text">CyberGuard AI</span>
            <br />
            <span className="mt-2 block text-3xl sm:text-4xl lg:text-5xl">
              {APP_TAGLINE}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-slate-300"
          >
            Detect phishing, scan malware, monitor threats, and get AI-driven
            security recommendations — built for individuals and enterprise teams.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg" variant="gradient">
              <Link href="/register">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-medium text-white">
                  Live Threat Monitor
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Phishing blocked", value: "847", color: "text-cyan-400" },
                { label: "Malware quarantined", value: "126", color: "text-violet-400" },
                { label: "Security score", value: "78/100", color: "text-blue-400" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[Shield, Eye, Zap].map((Icon, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }}
                  className="flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-500/20"
                >
                  <Icon className="h-6 w-6 text-cyan-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
