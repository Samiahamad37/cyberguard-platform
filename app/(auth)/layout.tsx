import Link from "next/link";
import { Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="cyber-grid absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
