"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

/** Requires a logged-in session (used on 2FA after login). */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeHydrated = useAuthStore((s) => s.hasHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);

    if (useAuthStore.persist.hasHydrated() || storeHydrated) {
      finish();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(finish);
    const timeout = window.setTimeout(finish, 300);
    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, [storeHydrated]);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
