import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { analyzePhishingUrl } from "@/lib/server/phishing";
import { createAlert } from "@/lib/server/platform-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ url: z.string().min(4).max(2048) });

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  let url: string;
  try {
    url = schema.parse(await request.json()).url;
  } catch {
    return jsonError("Enter a valid URL", 400);
  }
  try {
    const result = await analyzePhishingUrl(url);
    if (result.riskLevel === "critical" || result.riskLevel === "high") {
      await createAlert({
        userId: user.id,
        title: "Suspicious phishing URL",
        description: `${url.slice(0, 200)} — ${result.signals.slice(0, 3).join("; ")}`,
        riskLevel: result.riskLevel,
        source: "Phishing Detection",
        category: "Phishing",
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("phishing url analysis failed", err);
    return jsonError("URL analysis failed", 500);
  }
}
