import type { ChatMessage } from "@/types";
import { apiClient } from "@/lib/api-client";
import { generateId } from "@/lib/utils";

export async function sendChatMessage(
  userContent: string,
  history: ChatMessage[] = []
): Promise<ChatMessage> {
  const { data } = await apiClient.post<ChatMessage>("/assistant/chat", {
    content: userContent,
    history,
  });
  return data;
}

export function createUserMessage(content: string): ChatMessage {
  return {
    id: generateId(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };
}
