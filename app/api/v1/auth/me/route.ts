import { NextRequest, NextResponse } from "next/server";
import { isErrorResponse, requireUser } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  return NextResponse.json(user);
}
