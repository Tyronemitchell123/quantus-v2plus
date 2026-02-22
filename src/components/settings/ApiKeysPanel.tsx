import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Plus, Trash2, Loader2, Copy, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const generateKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "qai_";
  for (let i = 0; i < 40; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const hashKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const ApiKeysPanel = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null); // full key shown once
  const { toast } = useToast();

  const fetchKeys = async () => {
    const { data } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });
    setKeys((data as ApiKeyItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchKeys(); }, []);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const fullKey = generateKey();
    const keyHash = await hashKey(fullKey);
    const keyPrefix = fullKey.slice(0, 8) + "...";

    const { error } = await supabase.from("api_keys").insert({
      user_id: session.user.id,
      name: newKeyName.trim(),
      key_prefix: keyPrefix,
      key_hash: keyHash,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRevealedKey(fullKey);
      setNewKeyName("");
      fetchKeys();
      toast({ title: "API key created", description: "Copy your key now — it won't be shown again." });
    }
    setCreating(false);
  };

  const revokeKey = async (id: string) => {
    await supabase.from("api_keys").delete().eq("id", id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast({ title: "API key revoked" });
  };

  const copyKey = () => {
    if (revealedKey) {
      navigator.clipboard.writeText(revealedKey);
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">API Key Management</h3>
      <p className="text-sm text-muted-foreground">Generate and manage API keys for programmatic access.</p>

      {/* Create key */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production, Staging)"
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={createKey}
            disabled={creating || !newKeyName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Generate
          </button>
        </div>

        {revealedKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-destructive/5 border border-destructive/20 rounded-lg p-3"
          >
            <p className="text-xs text-destructive font-medium mb-2">⚠️ Copy this key now — it won't be shown again.</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-foreground bg-secondary px-2 py-1 rounded flex-1 overflow-x-auto">
                {revealedKey}
              </code>
              <button onClick={copyKey} className="text-primary hover:opacity-80">
                <Copy size={14} />
              </button>
            </div>
            <button
              onClick={() => setRevealedKey(null)}
              className="text-xs text-muted-foreground hover:text-foreground mt-2"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </div>

      {/* Key list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="text-primary animate-spin" size={24} />
        </div>
      ) : keys.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Key size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No API keys created yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Key size={16} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{k.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                    <code>{k.key_prefix}</code>
                    <span>Created {new Date(k.created_at).toLocaleDateString()}</span>
                    {k.last_used_at && <span>Last used {new Date(k.last_used_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button
                  onClick={() => revokeKey(k.id)}
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

export default ApiKeysPanel;
