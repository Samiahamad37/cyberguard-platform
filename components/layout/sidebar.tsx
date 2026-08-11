"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  Globe,
  MailWarning,
  Bug,
  GlobeLock,
  Bot,
  Monitor,
  FileBarChart,
  Settings,
  Shield,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV, APP_NAME } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

const iconMap = {
  LayoutDashboard,
  Bell,
  Globe,
  MailWarning,
  Bug,
  GlobeLock,
  Bot,
  Monitor,
  FileBarChart,
  Settings,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, sidebarMobileOpen, setSidebarMobileOpen } =
    useUIStore();
  const logout = useAuthStore((s) => s.logout);

  const content = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center gap-2 border-b border-border px-4",
          sidebarCollapsed && "justify-center px-2"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
          <Shield className="h-5 w-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="truncate font-bold">{APP_NAME}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              Enterprise Security
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {DASHBOARD_NAV.map((section) => (
          <div key={section.title} className="mb-6">
            {!sidebarCollapsed && (
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground",
            sidebarCollapsed && "justify-center px-0"
          )}
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed && "Sign out"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen shrink-0 border-r border-border glass-panel transition-all duration-300 lg:sticky lg:top-0 lg:block",
          sidebarCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {content}
      </aside>

      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 glass-panel">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
