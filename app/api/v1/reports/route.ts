import { NextRequest, NextResponse } from "next/server";
import { isErrorResponse, requireUser } from "@/lib/server/http";
import { getSecurityReport } from "@/lib/server/platform-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  const tz = request.nextUrl.searchParams.get("tz");
  return NextResponse.json(await getSecurityReport(user.id, tz));
}
