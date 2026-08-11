import { PageHeader } from "@/components/layout/page-header";
import { AIChatWindow } from "@/components/shared/ai-chat-window";

export default function AIAssistantPage() {
  return (
    <div>
      <PageHeader
        title="AI Security Assistant"
        description="Conversational guidance for phishing, vulnerabilities, and incident response"
      />
      <AIChatWindow />
    </div>
  );
}
