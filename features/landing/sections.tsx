"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Bug,
  Check,
  GlobeLock,
  MailWarning,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQ_ITEMS, PRICING_PLANS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: MailWarning,
    title: "Phishing Detection",
    description:
      "Analyze emails, URLs, and screenshots with AI threat scoring and fake domain detection.",
  },
  {
    icon: Bug,
    title: "Malware Scanner",
    description:
      "Scan files, hashes, and URLs against multi-engine reputation and AI heuristics.",
  },
  {
    icon: GlobeLock,
    title: "Website Security",
    description:
      "Inspect HTTPS, SSL, domain reputation, and vulnerability signals for any site.",
  },
  {
    icon: Bot,
    title: "AI Security Assistant",
    description:
      "Ask security questions and get guided incident response in natural language.",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Enterprise-grade protection",
    text: "Defense workflows inspired by leading SOC platforms, tailored for modern teams.",
  },
  {
    icon: Sparkles,
    title: "AI that explains itself",
    text: "Every scan includes clear reasoning and prioritized remediation steps.",
  },
  {
    icon: Users,
    title: "Built for every role",
    text: "From solo professionals to security analysts — actionable insights without noise.",
  },
];

const testimonials = [
  {
    quote:
      "CyberGuard AI cut our phishing triage time in half. The explanations are clear enough for non-technical staff.",
    author: "Jordan Lee",
    role: "CISO, Northwind Health",
  },
  {
    quote:
      "The malware hash lookup and AI assistant feel like having a junior analyst on call 24/7.",
    author: "Priya Shah",
    role: "Security Engineer, Lattice Cloud",
  },
  {
    quote:
      "We rolled this out company-wide for awareness and scanning. The dashboard is genuinely useful.",
    author: "Marcus Chen",
    role: "IT Director, Helix Retail",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Security tools powered by AI
          </h2>
          <p className="mt-3 text-slate-400">
            Everything you need to detect, analyze, and respond to cyber threats.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full border-white/10 bg-slate-900/60">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20">
                    <feature.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection() {
  return (
    <section id="benefits" className="px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Why teams choose CyberGuard AI
          </h2>
          <p className="mt-3 text-slate-400">
            Modern SaaS experience with SOC-ready workflows and API-ready
            architecture for future integrations.
          </p>
          <div className="mt-8 space-y-6">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                  <b.icon className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{b.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-violet-600/20 p-8">
          <ul className="space-y-4">
            {[
              "Dark-mode enterprise dashboard",
              "Mock-ready API service layer",
              "Threat intelligence & CVE placeholders",
              "Session & 2FA authentication UI",
              "Exportable security reports",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-200">
                <Check className="h-5 w-5 text-cyan-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-slate-400">
            Start free. Upgrade when your security needs grow.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "border-white/10 bg-slate-900/60",
                plan.highlighted &&
                  "border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
              )}
            >
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <p className="text-sm text-slate-400">{plan.description}</p>
                <div className="pt-4">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-slate-400">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.highlighted ? "gradient" : "outline"}
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-center text-3xl font-bold text-white sm:text-4xl">
          Trusted by security teams
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.author} className="border-white/10 bg-slate-900/60">
              <CardContent className="pt-6">
                <p className="text-slate-300">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6">
                  <p className="font-medium text-white">{t.author}</p>
                  <p className="text-sm text-slate-400">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-center text-3xl font-bold text-white sm:text-4xl">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
              <AccordionTrigger className="text-white">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-400">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function FooterSection() {
  return (
    <footer className="border-t border-white/10 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <p className="font-bold text-white">{APP_NAME}</p>
          <p className="mt-1 text-sm text-slate-500">
            © {new Date().getFullYear()} CyberGuard AI. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-slate-400">
          <Link href="/login" className="hover:text-white">
            Login
          </Link>
          <Link href="/register" className="hover:text-white">
            Register
          </Link>
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
        </div>
      </div>
    </footer>
  );
}
