import type { WebsiteScanResult } from "@/types";
import { apiClient } from "@/lib/api-client";

export async function scanWebsite(url: string): Promise<WebsiteScanResult> {
  const { data } = await apiClient.post<WebsiteScanResult>("/website/scan", {
    url,
  });
  return data;
}
