import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker local hosting only — Vercel ignores/omits this
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
};

export default nextConfig;
