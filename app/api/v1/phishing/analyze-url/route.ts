import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { analyzePhishingUrl } from "@/lib/server/phishing";
import { createAlert } from "@/lib/server/platform-data";

const schema = z.object({ url: z.string().min(4) });

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  try {
    const body = schema.parse(await request.json());
    const result = analyzePhishingUrl(body.url);
    if (result.riskLevel === "critical" || result.riskLevel === "high") {
      await createAlert({
        title: "Malicious phishing URL detected",
        description: `Flagged URL: ${body.url}`,
        riskLevel: result.riskLevel,
        source: "Phishing Detection",
        category: "Phishing",
      });
    }
    return NextResponse.json(result);
  } catch {
    return jsonError("Enter a valid URL", 400);
  }
}
