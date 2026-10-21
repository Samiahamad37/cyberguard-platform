import { NextRequest, NextResponse } from "next/server";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { removeDevice, scanDevice, updateDevice } from "@/lib/server/platform-data";
import { deviceSchema } from "@/lib/server/device-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  const { id } = await context.params;
  const url = new URL(request.url);
  if (url.searchParams.get("action") === "scan") {
    const device = await scanDevice(user.id, id);
    if (!device) return jsonError("Device not found", 404);
    return NextResponse.json(device);
  }
  return jsonError("Unknown action", 400);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  const { id } = await context.params;
  let patch;
  try {
    patch = deviceSchema.partial().parse(await request.json());
  } catch {
    return jsonError("Invalid device details", 400);
  }
  const device = await updateDevice(user.id, id, patch);
  if (!device) return jsonError("Device not found", 404);
  return NextResponse.json(device);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  const { id } = await context.params;
  const ok = await removeDevice(user.id, id);
  if (!ok) return jsonError("Device not found", 404);
  return NextResponse.json({ success: true });
}
