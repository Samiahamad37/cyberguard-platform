import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { analyzePhishingEmail } from "@/lib/server/phishing";

const schema = z.object({ content: z.string().min(20) });

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  try {
    const body = schema.parse(await request.json());
    return NextResponse.json(analyzePhishingEmail(body.content));
  } catch {
    return jsonError("Paste a longer email sample for analysis", 400);
  }
}
