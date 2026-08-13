import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { analyzePhishingUrl } from "@/lib/server/phishing";

const schema = z.object({ url: z.string().min(4) });

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  try {
    const body = schema.parse(await request.json());
    return NextResponse.json(analyzePhishingUrl(body.url));
  } catch {
    return jsonError("Enter a valid URL", 400);
  }
}
