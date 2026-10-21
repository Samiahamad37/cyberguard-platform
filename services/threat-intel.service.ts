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
    dueDate?: string;
    ransomware?: boolean;
    url?: string;
  }[];
  /** Sections that need an optional API key, mapped to the env var that enables them. */
  requiresApiKey: { highRiskIPs?: string; malwareFamilies?: string };
  errors: Record<string, string>;
  sources: {
    kev: {
      name: string;
      url: string;
      catalogVersion: string;
      dateReleased: string;
      count: number;
      fetchedAt: string;
    } | null;
  };
}

export async function fetchThreatIntelligence(): Promise<ThreatIntelligencePayload> {
  const { data } = await apiClient.get<ThreatIntelligencePayload>("/threat-intel");
  return data;
}
