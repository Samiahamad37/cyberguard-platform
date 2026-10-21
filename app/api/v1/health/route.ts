import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Quick deployment check: shows whether the database and auth secret are configured.
// Never returns the secret values themselves.
export async function GET() {
  return NextResponse.json({
    ok: true,
    userStorage: process.env.DATABASE_URL ? "postgres" : "temporary-file",
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    authSecretConfigured: Boolean(process.env.AUTH_SECRET),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    environment: process.env.VERCEL_ENV ?? "local",
  });
}
