import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Message = { role: "user" | "assistant"; content: string };

const CHANNEL = "ai-assistant";

export function useAIChatPersistence() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load history on mount
  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("content, sender_type")
        .eq("user_id", user.id)
        .eq("channel", CHANNEL)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data && data.length > 0) {
        setMessages(
          data.map((m: any) => ({
            role: m.sender_type === "user" ? "user" as const : "assistant" as const,
            content: m.content,
          }))
        );
      }
      setLoaded(true);
    })();
  }, [user]);

  const persistMessage = useCallback(
    async (role: "user" | "assistant", content: string) => {
      if (!user || !content.trim()) return;
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        channel: CHANNEL,
        content: content.trim(),
        sender_type: role,
      });
    },
    [user]
  );

  const clearHistory = useCallback(async () => {
    if (!user) return;
    // We can't delete via RLS, so just reset local state
    setMessages([]);
  }, [user]);

  return { messages, setMessages, loaded, persistMessage, clearHistory };
}
