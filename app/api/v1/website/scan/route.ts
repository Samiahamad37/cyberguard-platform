import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { scanWebsite, WebsiteScanError } from "@/lib/server/website";
import { createAlert } from "@/lib/server/platform-data";
import type { RiskLevel } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const schema = z.object({ url: z.string().min(4).max(2048) });

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return jsonError("Enter a valid URL", 400);
  }

  try {
    const result = await scanWebsite(body.url);
    const worst: RiskLevel | null = result.findings.some((f) => f.severity === "critical")
      ? "critical"
      : result.findings.some((f) => f.severity === "high") || result.overallScore < 50
        ? "high"
        : null;
    if (worst) {
      const top = result.findings
        .filter((f) => f.severity === "critical" || f.severity === "high")
        .map((f) => f.title);
      await createAlert({
        userId: user.id,
        title: `Website security issues: ${new URL(result.url).hostname}`,
        description: `Scan scored ${result.overallScore}/100 (grade ${result.grade}).${
          top.length ? ` ${top.slice(0, 3).join("; ")}.` : ""
        }`,
        riskLevel: worst,
        source: "Website Scanner",
        category: "Infrastructure",
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof WebsiteScanError) return jsonError(err.message, 422);
    console.error("website scan failed", err);
    return jsonError("Website scan failed", 500);
  }
}
