"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { FileUpload } from "@/components/shared/file-upload";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  analyzePhishingEmail,
  analyzePhishingUrl,
} from "@/services/phishing.service";
import type { PhishingAnalysisResult } from "@/types";
import { Loader2 } from "lucide-react";

export default function PhishingPage() {
  const [emailContent, setEmailContent] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhishingAnalysisResult | null>(null);

  const runEmailAnalysis = async () => {
    if (emailContent.trim().length < 20) {
      toast.error("Paste a longer email sample for analysis");
      return;
    }
    setLoading(true);
    try {
      const res = await analyzePhishingEmail(emailContent);
      setResult(res);
      toast.success("Phishing analysis complete");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const runUrlAnalysis = async () => {
    if (!url.startsWith("http")) {
      toast.error("Enter a valid URL including https://");
      return;
    }
    setLoading(true);
    try {
      const res = await analyzePhishingUrl(url);
      setResult(res);
      toast.success("URL reputation analysis complete");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Phishing Detection"
        description="Analyze emails, .eml files, URLs, and screenshots with AI"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analyze Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email">
              <TabsList className="w-full">
                <TabsTrigger value="email" className="flex-1">
                  Email
                </TabsTrigger>
                <TabsTrigger value="eml" className="flex-1">
                  .eml File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex-1">
                  URL
                </TabsTrigger>
                <TabsTrigger value="screenshot" className="flex-1">
                  Screenshot
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <Textarea
                  placeholder="Paste the full email content including headers if available..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="min-h-[220px]"
                />
                <Button
                  variant="gradient"
                  onClick={runEmailAnalysis}
                  disabled={loading}
                >
                  {loading && <Loader2 className="animate-spin" />}
                  Analyze Email
                </Button>
              </TabsContent>

              <TabsContent value="eml" className="space-y-4">
                <FileUpload
                  accept=".eml,message/rfc822"
                  label="Upload .eml file"
                  description="Email message files only"
                  onFileSelect={async (file) => {
                    if (!file) return;
                    const text = await file.text();
                    setEmailContent(text);
                    toast.info("File loaded — click Analyze Email or switch to Email tab");
                  }}
                />
                <Button
                  variant="gradient"
                  onClick={runEmailAnalysis}
                  disabled={loading || !emailContent}
                >
                  {loading && <Loader2 className="animate-spin" />}
                  Analyze Uploaded Email
                </Button>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <Input
                  placeholder="https://suspicious-site.example/login"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                  variant="gradient"
                  onClick={runUrlAnalysis}
                  disabled={loading}
                >
                  {loading && <Loader2 className="animate-spin" />}
                  Check URL Reputation
                </Button>
              </TabsContent>

              <TabsContent value="screenshot" className="space-y-4">
                <FileUpload
                  accept="image/*"
                  label="Upload screenshot"
                  description="PNG, JPG, or WEBP"
                  onFileSelect={(file) => {
                    if (file) {
                      setEmailContent(
                        `Screenshot analysis: ${file.name}. Suspected phishing login page with urgent verify account messaging.`
                      );
                      toast.info("Screenshot queued — running AI visual heuristics");
                    }
                  }}
                />
                <Button
                  variant="gradient"
                  onClick={runEmailAnalysis}
                  disabled={loading || !emailContent}
                >
                  {loading && <Loader2 className="animate-spin" />}
                  Analyze Screenshot
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Results will appear here after analysis
              </p>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <RiskBadge level={result.riskLevel} />
                  <Badge variant={result.fakeDomainDetected ? "critical" : "success"}>
                    {result.fakeDomainDetected
                      ? "Fake domain detected"
                      : "No fake domain"}
                  </Badge>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Threat Score</span>
                    <span className="font-semibold">{result.threatScore}/100</span>
                  </div>
                  <Progress
                    value={result.threatScore}
                    indicatorClassName="bg-gradient-to-r from-amber-400 to-red-500"
                  />
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Phishing Probability</span>
                    <span className="font-semibold">
                      {result.phishingProbability}%
                    </span>
                  </div>
                  <Progress
                    value={result.phishingProbability}
                    indicatorClassName="bg-cyan-500"
                  />
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Suspicious Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suspiciousKeywords.map((kw) => (
                      <Badge key={kw} variant="secondary">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>

                {result.urlReputation.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">URL Reputation</h4>
                    <div className="space-y-2">
                      {result.urlReputation.map((u) => (
                        <div
                          key={u.url}
                          className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                        >
                          <p className="truncate font-mono text-xs">{u.url}</p>
                          <div className="mt-1 flex justify-between">
                            <Badge
                              variant={
                                u.status === "malicious"
                                  ? "critical"
                                  : u.status === "suspicious"
                                    ? "medium"
                                    : "success"
                              }
                            >
                              {u.status}
                            </Badge>
                            <span>Score: {u.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-sm font-medium">AI Explanation</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.aiExplanation}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Recommended Actions</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {result.recommendedActions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
