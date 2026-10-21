import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { analyzePhishingEmail } from "@/lib/server/phishing";
import { createAlert } from "@/lib/server/platform-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ content: z.string().min(20).max(200_000) });

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  let content: string;
  try {
    content = schema.parse(await request.json()).content;
  } catch {
    return jsonError("Paste a longer email sample for analysis", 400);
  }
  try {
    const result = await analyzePhishingEmail(content);
    if (result.riskLevel === "critical" || result.riskLevel === "high") {
      await createAlert({
        userId: user.id,
        title: "Phishing content detected",
        description: `Threat score ${result.threatScore}/100. ${result.signals.slice(0, 3).join("; ")}`,
        riskLevel: result.riskLevel,
        source: "Phishing Detection",
        category: "Phishing",
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("phishing analysis failed", err);
    return jsonError("Analysis failed", 500);
  }
}
