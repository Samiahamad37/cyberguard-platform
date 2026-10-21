import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

// Quick deployment check: shows whether the database and auth secret are configured
// and whether the database is reachable. Never returns secret values.
export async function GET() {
  const url = process.env.DATABASE_URL || "";
  let database: { reachable: boolean; users?: number; error?: string } = {
    reachable: false,
  };
  if (url) {
    try {
      const sql = neon(url);
      const rows = (await sql`SELECT to_regclass('public.cyberguard_users') AS t`) as { t: string | null }[];
      let users: number | undefined;
      if (rows[0]?.t) {
        const c = (await sql`SELECT count(*)::int AS n FROM cyberguard_users`) as { n: number }[];
        users = c[0]?.n;
      }
      database = { reachable: true, users };
    } catch (err) {
      database = {
        reachable: false,
        error: String((err as Error)?.message || err)
          .replace(/postgres(ql)?:\/\/[^\s"']+/gi, "[url hidden]")
          .slice(0, 300),
      };
    }
  }
  return NextResponse.json({
    ok: true,
    userStorage: url ? "postgres" : "temporary-file",
    databaseConfigured: Boolean(url),
    databaseUrlLooksQuoted: /^["']|["']$/.test(url.trim()),
    databaseUrlHasSpaces: url !== url.trim(),
    database,
    authSecretConfigured: Boolean(process.env.AUTH_SECRET),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    environment: process.env.VERCEL_ENV ?? "local",
  });
}
