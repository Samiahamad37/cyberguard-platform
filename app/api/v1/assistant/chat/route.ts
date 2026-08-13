import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { assistantReply } from "@/lib/server/assistant";

const schema = z.object({
  content: z.string().min(1),
  history: z.array(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  try {
    const body = schema.parse(await request.json());
    return NextResponse.json(assistantReply(body.content));
  } catch {
    return jsonError("Message is required", 400);
  }
}
