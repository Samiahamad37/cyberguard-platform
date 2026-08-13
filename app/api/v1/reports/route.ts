import { NextRequest, NextResponse } from "next/server";
import { isErrorResponse, requireUser } from "@/lib/server/http";
import {
  getDashboardOverview,
  getSecurityReport,
} from "@/lib/server/platform-data";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  const [report, overview] = await Promise.all([
    getSecurityReport(),
    getDashboardOverview(),
  ]);
  return NextResponse.json({
    report,
    activity: overview.activity,
    riskDistribution: overview.riskDistribution,
  });
}
