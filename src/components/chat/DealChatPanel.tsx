import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useChatMessages, ChatMessage } from "@/hooks/use-chat-messages";

function timeFmt(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface DealChatPanelProps {
  channel?: string;
  dealId?: string;
  className?: string;
}

export default function DealChatPanel({ channel = "general", dealId, className = "" }: DealChatPanelProps) {
  const { messages, loading, sendMessage } = useChatMessages(channel);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input, dealId);
    setInput("");
    setSending(false);
  };

  return (
    <div className={`flex flex-col rounded-xl border border-border/50 bg-secondary/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-secondary/20">
        <MessageSquare size={14} className="text-primary" />
        <span className="text-sm font-medium text-foreground">Deal Chat</span>
        <Badge variant="outline" className="ml-auto text-[9px] border-primary/30 text-primary">
          REAL-TIME
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No messages yet. Start the conversation.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.sender_type === "user" ? "justify-end" : ""}`}
              >
                {msg.sender_type !== "user" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot size={12} className="text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender_type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary/50 border border-border/30 text-foreground rounded-bl-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className={`block text-[9px] mt-1 ${
                    msg.sender_type === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"
                  }`}>
                    {timeFmt(msg.created_at)}
                  </span>
                </div>
                {msg.sender_type === "user" && (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User size={12} className="text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-border/30 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message…"
          className="h-9 text-xs bg-secondary/30"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="h-9 w-9 p-0 shrink-0"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
}
