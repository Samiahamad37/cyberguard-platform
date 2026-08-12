"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { DashboardNavbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
