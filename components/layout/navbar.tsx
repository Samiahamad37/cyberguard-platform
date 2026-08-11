"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Bell, Shield, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { APP_NAME } from "@/lib/constants";
import { useTheme } from "next-themes";

export function DashboardNavbar() {
  const pathname = usePathname();
  const { setSidebarMobileOpen, toggleSidebar } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  const title =
    pathname
      ?.split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border glass-panel">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <h1 className="text-lg font-semibold capitalize">{title}</h1>
        </div>

        <div className="hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search threats, alerts..."
              className="h-9 pl-9"
              aria-label="Global search"
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Link href="/alerts">
          <Button variant="ghost" size="icon" className="relative" aria-label="Alerts">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>
        </Link>

        <Link href="/settings" className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2) || "CG"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}

export function LandingNavbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">{APP_NAME}</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-slate-300 hover:text-white">
            Features
          </a>
          <a href="#benefits" className="text-sm text-slate-300 hover:text-white">
            Benefits
          </a>
          <a href="#pricing" className="text-sm text-slate-300 hover:text-white">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-slate-300 hover:text-white">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
