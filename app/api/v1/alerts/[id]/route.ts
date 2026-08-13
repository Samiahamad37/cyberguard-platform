import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isErrorResponse, jsonError, requireUser } from "@/lib/server/http";
import { updateAlertStatus } from "@/lib/server/platform-data";

const schema = z.object({
  status: z.enum(["open", "acknowledged", "resolved", "dismissed"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(request);
  if (isErrorResponse(user)) return user;

  try {
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    const updated = await updateAlertStatus(id, body.status);
    if (!updated) return jsonError("Alert not found", 404);
    return NextResponse.json(updated);
  } catch {
    return jsonError("Invalid status", 400);
  }
}
