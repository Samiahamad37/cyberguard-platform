import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { scanWebsite } from "@/lib/server/website";
import { createAlert } from "@/lib/server/platform-data";

const schema = z.object({ url: z.string().min(4) });

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  try {
    const body = schema.parse(await request.json());
    const result = scanWebsite(body.url);
    if (!result.httpsStatus || result.overallScore < 50) {
      await createAlert({
        title: "Website security issues found",
        description: `Scan of ${result.url} scored ${result.overallScore}/100.`,
        riskLevel: result.httpsStatus ? "medium" : "critical",
        source: "Website Scanner",
        category: "Infrastructure",
      });
    }
    return NextResponse.json(result);
  } catch {
    return jsonError("Enter a valid URL", 400);
  }
}
