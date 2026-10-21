import { z } from "zod";

export const deviceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  os: z.string().trim().max(100).default(""),
  type: z.enum(["desktop", "laptop", "mobile", "server", "iot"]),
  ipAddress: z
    .string()
    .trim()
    .min(1)
    .max(253)
    .regex(/^[a-zA-Z0-9.:\-\[\]]+$/, "Enter an IP address or hostname"),
});
