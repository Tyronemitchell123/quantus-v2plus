import { useState, useCallback } from "react";
import { toast } from "sonner";

const AI_ANALYTICS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analytics`;

export function useAIAnalytics<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(AI_ANALYTICS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ type }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        const msg =
          resp.status === 429
            ? "AI rate limit reached — please wait a moment."
            : resp.status === 402
              ? "AI credits exhausted. Please add credits."
              : (body as any).error || "AI analysis failed.";
        setError(msg);
        toast.error(msg);
        return null;
      }

      const result = await resp.json();
      setData(result.data);
      return result.data as T;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, analyze };
}
