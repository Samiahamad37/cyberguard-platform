import type { PhishingAnalysisResult } from "@/types";
import { apiClient } from "@/lib/api-client";

export async function analyzePhishingEmail(
  content: string
): Promise<PhishingAnalysisResult> {
  const { data } = await apiClient.post<PhishingAnalysisResult>(
    "/phishing/analyze",
    { content }
  );
  return data;
}

export async function analyzePhishingUrl(
  url: string
): Promise<PhishingAnalysisResult> {
  const { data } = await apiClient.post<PhishingAnalysisResult>(
    "/phishing/analyze-url",
    { url }
  );
  return data;
}
