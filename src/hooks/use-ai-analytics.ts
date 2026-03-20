import { useState, useCallback } from "react";

const AI_ANALYTICS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analytics`;

const CACHE_PREFIX = "quantus-ai-cache-";

function getCached<T>(type: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + type);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setCache<T>(type: string, data: T) {
  try {
    localStorage.setItem(CACHE_PREFIX + type, JSON.stringify(data));
  } catch { /* quota exceeded — ignore */ }
}

export type AIStatus = "live" | "cached" | "fallback" | null;

export function useAIAnalytics<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AIStatus>(null);
  const [creditsExhausted, setCreditsExhausted] = useState(false);

  const analyze = useCallback(async (type: string) => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setCreditsExhausted(false);
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
        if (resp.status === 402) {
          setCreditsExhausted(true);
        }
        const cached = getCached<T>(type);
        if (cached) {
          setData(cached);
          setError("cached");
          setStatus("cached");
          setLoading(false);
          return cached;
        }
        // No cache — signal fallback immediately (don't leave loading=true)
        setError("unavailable");
        setStatus("fallback");
        setLoading(false);
        return null;
      }

      const result = await resp.json();
      setData(result.data);
      setCache(type, result.data);
      setStatus("live");
      return result.data as T;
    } catch {
      const cached = getCached<T>(type);
      if (cached) {
        setData(cached);
        setError("cached");
        setStatus("cached");
        return cached;
      }
      setError("unavailable");
      setStatus("fallback");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, status, creditsExhausted, analyze };
}
