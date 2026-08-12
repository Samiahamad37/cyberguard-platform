"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { GuestGuard } from "@/components/shared/guest-guard";
import { SiteBackground } from "@/components/shared/site-background";
import { FloatingTechIcons } from "@/components/shared/floating-tech-icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <SiteBackground intensity="strong" className="fixed inset-0" />
      <FloatingTechIcons className="fixed inset-0 opacity-80" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-cyan-500/30">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-shadow-strong text-xl font-bold text-white">
            {APP_NAME}
          </span>
        </Link>
        <div className="auth-form-shell">
          <GuestGuard>{children}</GuestGuard>
        </div>
      </div>
    </div>
  );
}
