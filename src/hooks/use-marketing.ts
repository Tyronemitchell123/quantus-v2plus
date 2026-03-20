import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Mode = "blog" | "social" | "ad-copy" | "seo-audit" | "bulk-seo";

export function useMarketing() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generate = async (mode: Mode, context: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-marketing", {
        body: { mode, ...context },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading };
}
