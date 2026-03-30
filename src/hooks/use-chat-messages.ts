import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface ChatMessage {
  id: string;
  user_id: string;
  deal_id: string | null;
  channel: string;
  content: string;
  sender_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export function useChatMessages(channel: string = "general") {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("channel", channel)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages((data as ChatMessage[]) || []);
    setLoading(false);
  }, [user, channel]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const sub = supabase
      .channel(`chat-${channel}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `channel=eq.${channel}`,
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        if (msg.user_id === user.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user, channel]);

  const sendMessage = useCallback(async (content: string, dealId?: string) => {
    if (!user || !content.trim()) return;
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      channel,
      content: content.trim(),
      deal_id: dealId || null,
      sender_type: "user",
    });
    if (!error) await fetchMessages();
    return error;
  }, [user, channel, fetchMessages]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
