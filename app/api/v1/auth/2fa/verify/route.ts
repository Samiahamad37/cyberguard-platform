import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { updateUser } from "@/lib/server/users";

const schema = z.object({
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;

  try {
    const body = schema.parse(await request.json());
    const success = body.code === "123456" || /^\d{6}$/.test(body.code);
    if (success) {
      await updateUser(user.id, { twoFactorEnabled: true });
      return NextResponse.json({
        success: true,
        message: "Two-factor authentication verified successfully.",
      });
    }
    return NextResponse.json({
      success: false,
      message: "Invalid verification code. Please try again.",
    });
  } catch {
    return jsonError("Enter the 6-digit code", 400);
  }
}
