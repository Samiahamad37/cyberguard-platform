import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "@/lib/server/users";
import { toPublicUser, verifyToken, type AuthUser } from "@/lib/server/auth";

export function jsonError(detail: string, status: number) {
  return NextResponse.json({ detail }, { status });
}

export async function requireUser(
  request: NextRequest
): Promise<AuthUser | NextResponse> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return jsonError("Not authenticated", 401);

  const userId = await verifyToken(token);
  if (!userId) return jsonError("Invalid or expired token", 401);

  const user = await findUserById(userId);
  if (!user) return jsonError("User not found", 401);

  return toPublicUser(user);
}

export function isErrorResponse(
  value: AuthUser | NextResponse
): value is NextResponse {
  return value instanceof NextResponse;
}
