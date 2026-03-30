import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Webhook, Plus, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

const AVAILABLE_EVENTS = ["anomaly.detected", "report.generated", "usage.limit_reached", "subscription.changed"];

const WebhooksPanel = () => {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["anomaly.detected"]);
  const { toast } = useToast();

  const fetchWebhooks = async () => {
    const { data, error } = await supabase
      .from("webhooks_safe" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setWebhooks((data as unknown as WebhookItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchWebhooks(); }, []);

  const addWebhook = async () => {
    if (!newUrl.trim()) return;
    try {
      new URL(newUrl); // validate
    } catch {
      toast({ title: "Invalid URL", description: "Please enter a valid webhook URL.", variant: "destructive" });
      return;
    }

    setAdding(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("webhooks").insert({
      user_id: session.user.id,
      url: newUrl.trim(),
      events: selectedEvents,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Webhook added" });
      logAudit("webhook.create", "webhook", null, { url: newUrl.trim() });
      setNewUrl("");
      setSelectedEvents(["anomaly.detected"]);
      fetchWebhooks();
    }
    setAdding(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("webhooks").update({ is_active: !current }).eq("id", id);
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, is_active: !current } : w)));
  };

  const deleteWebhook = async (id: string) => {
    await supabase.from("webhooks").delete().eq("id", id);
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    logAudit("webhook.delete", "webhook", id);
    toast({ title: "Webhook deleted" });
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">Webhook Management</h3>
      <p className="text-sm text-muted-foreground">Receive real-time notifications when events occur in your account.</p>

      {/* Add webhook */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://your-server.com/webhook"
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={addWebhook}
            disabled={adding || !newUrl.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_EVENTS.map((event) => (
            <button
              key={event}
              onClick={() => toggleEvent(event)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selectedEvents.includes(event)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {event}
            </button>
          ))}
        </div>
      </div>

      {/* Webhook list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="text-primary animate-spin" size={24} />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Webhook size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No webhooks configured yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <motion.div
              key={wh.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => toggleActive(wh.id, wh.is_active)} className="shrink-0">
                  {wh.is_active ? (
                    <ToggleRight size={24} className="text-primary" />
                  ) : (
                    <ToggleLeft size={24} className="text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">{wh.url}</p>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {wh.events.map((e) => (
                      <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => deleteWebhook(wh.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebhooksPanel;
