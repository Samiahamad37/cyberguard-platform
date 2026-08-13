import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { analyzePhishingEmail } from "@/lib/server/phishing";
import { createAlert } from "@/lib/server/platform-data";

const schema = z.object({ content: z.string().min(20) });

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  try {
    const body = schema.parse(await request.json());
    const result = analyzePhishingEmail(body.content);
    if (result.riskLevel === "critical" || result.riskLevel === "high") {
      await createAlert({
        title: "Phishing content detected",
        description: `AI threat score ${result.threatScore}. ${result.aiExplanation.slice(0, 160)}`,
        riskLevel: result.riskLevel,
        source: "Phishing Detection",
        category: "Phishing",
      });
    }
    return NextResponse.json(result);
  } catch {
    return jsonError("Paste a longer email sample for analysis", 400);
  }
}
