import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/server/http";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    return NextResponse.json({
      message: `If an account exists for ${body.email}, a reset link has been sent.`,
    });
  } catch {
    return jsonError("Enter a valid email address", 400);
  }
}
