import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createToken,
  hashPassword,
  toPublicUser,
} from "@/lib/server/auth";
import { createUser } from "@/lib/server/users";
import { jsonError } from "@/lib/server/http";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const passwordHash = await hashPassword(body.password);
    const user = await createUser({
      name: body.name,
      email: body.email,
      passwordHash,
    });
    const access_token = await createToken(user.id);
    return NextResponse.json(
      { access_token, token_type: "bearer", user: toPublicUser(user) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input", 400);
    }
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return jsonError("An account with this email already exists", 409);
    }
    return jsonError("Registration failed", 500);
  }
}
