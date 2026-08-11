import { apiClient } from "@/lib/api-client";
import type { HighRiskIP, ThreatIntelItem } from "@/types";

export interface ThreatIntelligencePayload {
  latestThreats: ThreatIntelItem[];
  malwareFamilies: { name: string; activity: number; trend: string }[];
  ransomwareTrends: { name: string; value: number }[];
  highRiskIPs: HighRiskIP[];
  attackStatistics: { name: string; value: number }[];
  cveFeed: {
    cve: string;
    severity: string;
    product: string;
    description: string;
    published: string;
  }[];
}

export async function fetchThreatIntelligence(): Promise<ThreatIntelligencePayload> {
  const { data } = await apiClient.get<ThreatIntelligencePayload>("/threat-intel");
  return data;
}
