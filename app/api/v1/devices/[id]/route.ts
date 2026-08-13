import { NextRequest, NextResponse } from "next/server";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { removeDevice, scanDevice } from "@/lib/server/platform-data";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  const { id } = await context.params;
  const url = new URL(request.url);
  if (url.searchParams.get("action") === "scan") {
    const device = await scanDevice(id);
    if (!device) return jsonError("Device not found", 404);
    return NextResponse.json(device);
  }
  return jsonError("Unknown action", 400);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(_request);
  if (isErrorResponse(user)) return user;
  const { id } = await context.params;
  const ok = await removeDevice(id);
  if (!ok) return jsonError("Device not found", 404);
  return NextResponse.json({ success: true });
}
