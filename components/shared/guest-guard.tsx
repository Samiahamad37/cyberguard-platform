"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const ALLOW_WHEN_AUTHENTICATED = new Set(["/two-factor"]);

/** Redirects already-authenticated users away from login/register. */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
    // Safety net so the page never sticks on Loading...
    const timeout = window.setTimeout(finish, 300);
    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, [storeHydrated]);

  const allowAuthenticated = ALLOW_WHEN_AUTHENTICATED.has(pathname);

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated && !allowAuthenticated) {
      router.replace("/dashboard");
    }
  }, [ready, isAuthenticated, allowAuthenticated, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (isAuthenticated && !allowAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
