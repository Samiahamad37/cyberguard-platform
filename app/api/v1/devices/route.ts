import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deviceSchema } from "@/lib/server/device-schema";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { createDevice, listDevices } from "@/lib/server/platform-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  return NextResponse.json(await listDevices(user.id));
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;
  let body: z.infer<typeof deviceSchema>;
  try {
    body = deviceSchema.parse(await request.json());
  } catch {
    return jsonError("Enter a device name, type, and IP address or hostname", 400);
  }
  return NextResponse.json(await createDevice(user.id, body), { status: 201 });
}
