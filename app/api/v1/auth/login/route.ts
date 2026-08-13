import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createToken,
  toPublicUser,
  verifyPassword,
} from "@/lib/server/auth";
import { findUserByEmail } from "@/lib/server/users";
import { jsonError } from "@/lib/server/http";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const user = await findUserByEmail(body.email);
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }
    const access_token = await createToken(user.id);
    return NextResponse.json({
      access_token,
      token_type: "bearer",
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input", 400);
    }
    return jsonError("Login failed", 500);
  }
}
