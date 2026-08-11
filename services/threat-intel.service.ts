import {
  attackStatistics,
  cveFeed,
  highRiskIPs,
  latestThreats,
  malwareFamilies,
  ransomwareTrends,
} from "@/lib/mock-data/threats";
import { sleep } from "@/lib/utils";

/**
 * Threat intelligence aggregation — mock.
 * Future: AbuseIPDB, VirusTotal, MISP, commercial TI feeds via FastAPI.
 */
export async function fetchThreatIntelligence() {
  await sleep(600);
  return {
    latestThreats,
    malwareFamilies,
    ransomwareTrends,
    highRiskIPs,
    attackStatistics,
    cveFeed,
  };
}
