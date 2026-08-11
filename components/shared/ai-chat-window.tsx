"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  createUserMessage,
  sendChatMessage,
} from "@/services/ai-assistant.service";
import type { ChatMessage } from "@/types";

const SUGGESTIONS = [
  "Is this email safe?",
  "How can I improve my security?",
  "Explain this vulnerability",
  "What should I do after a phishing attack?",
  "Analyze this security alert",
];

const welcome: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello — I'm your CyberGuard AI Security Assistant. Ask me about phishing, vulnerabilities, incident response, or hardening your environment.",
  timestamp: new Date().toISOString(),
};

export function AIChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    const userMsg = createUserMessage(content);
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(content, nextHistory);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry — I couldn't process that request. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[520px] flex-col rounded-xl border border-border glass-panel">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold">AI Security Assistant</p>
          <p className="text-xs text-emerald-400">Online · Mock LLM mode</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    msg.role === "assistant"
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-blue-500/20 text-blue-300"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "assistant"
                      ? "bg-muted/50 border border-border"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                  )}
                >
                  {msg.content}
                  <p
                    className={cn(
                      "mt-2 text-[10px]",
                      msg.role === "user"
                        ? "text-white/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatRelativeTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4 animate-pulse text-cyan-400" />
              Analyzing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition hover:border-cyan-500/40 hover:text-cyan-300"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a security question..."
            className="min-h-[52px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <Button
            variant="gradient"
            size="icon"
            className="h-[52px] w-[52px] shrink-0"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
