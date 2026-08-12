"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 lg:pt-40">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-200 backdrop-blur-md"
          >
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Threat Defense
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-shadow-strong text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="gradient-text">CyberGuard AI</span>
            <br />
            <span className="mt-2 block text-3xl text-white sm:text-4xl lg:text-5xl">
              {APP_TAGLINE}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-shadow-strong mt-6 max-w-xl text-lg leading-relaxed text-slate-100"
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
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-slate-950/40 text-white backdrop-blur-md hover:bg-white/10"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="relative"
        >
          <div className="surface-panel relative overflow-hidden rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-300" />
                <span className="text-sm font-semibold text-white">
                  Live Threat Monitor
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Phishing blocked", value: "847", color: "text-cyan-300" },
                { label: "Malware quarantined", value: "126", color: "text-sky-300" },
                { label: "Security score", value: "78/100", color: "text-blue-300" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-slate-200">{item.label}</span>
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
                  className="flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/35 to-cyan-400/25"
                >
                  <Icon className="h-6 w-6 text-cyan-200" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
