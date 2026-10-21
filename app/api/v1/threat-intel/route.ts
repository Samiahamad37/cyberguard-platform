import { NextRequest, NextResponse } from "next/server";
import { isErrorResponse, requireUser } from "@/lib/server/http";
import { getThreatIntelligence } from "@/lib/server/threat-intel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  return NextResponse.json(await getThreatIntelligence());
}
