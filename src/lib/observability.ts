/**
 * Platform Health Check & Observability Utilities
 *
 * Provides:
 *  - Error tracking with structured context
 *  - Edge function health monitoring
 *  - Performance timing helpers
 *  - Network resilience (retry with backoff)
 */

type ErrorSeverity = "low" | "medium" | "high" | "critical";

interface TrackedError {
  message: string;
  severity: ErrorSeverity;
  component?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  url: string;
  userAgent: string;
}

const ERROR_LOG: TrackedError[] = [];
const MAX_ERROR_LOG = 100;

/**
 * Track an error with structured context.
 * Stores in-memory and logs to console in development.
 */
export function trackError(
  error: Error | string,
  severity: ErrorSeverity = "medium",
  context?: { component?: string; userId?: string; metadata?: Record<string, unknown> }
): void {
  const entry: TrackedError = {
    message: error instanceof Error ? error.message : error,
    severity,
    component: context?.component,
    userId: context?.userId,
    metadata: context?.metadata,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  ERROR_LOG.push(entry);
  if (ERROR_LOG.length > MAX_ERROR_LOG) ERROR_LOG.shift();

  if (severity === "critical" || severity === "high") {
    console.error(`[QUANTUS:${severity.toUpperCase()}]`, entry);
  } else {
    console.warn(`[QUANTUS:${severity}]`, entry.message, entry.component || "");
  }
}

/**
 * Get recent errors for diagnostics panel.
 */
export function getRecentErrors(): readonly TrackedError[] {
  return [...ERROR_LOG];
}

/**
 * Check edge function health by pinging it.
 */
export async function checkEdgeFunctionHealth(
  functionName: string,
  supabaseUrl: string,
  anonKey: string
): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: "OPTIONS",
      headers: { apikey: anonKey },
    });
    const latencyMs = Math.round(performance.now() - start);
    return { ok: res.ok || res.status === 204, latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      latencyMs,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Retry a function with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; onRetry?: (attempt: number, error: Error) => void } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, onRetry } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
      onRetry?.(attempt + 1, err as Error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("withRetry: unreachable");
}

/**
 * Measure and log performance of an async operation.
 */
export async function measurePerformance<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    if (duration > 2000) {
      console.warn(`[PERF] ${label}: ${duration}ms (slow)`);
    }
    return result;
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    console.error(`[PERF] ${label}: failed after ${duration}ms`);
    throw err;
  }
}

/**
 * Global unhandled error/rejection listeners.
 * Call once at app startup.
 */
export function initGlobalErrorTracking(): void {
  window.addEventListener("error", (event) => {
    trackError(event.error || event.message, "high", {
      component: "window",
      metadata: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const msg = event.reason instanceof Error ? event.reason.message : String(event.reason);
    trackError(msg, "high", {
      component: "promise",
      metadata: { reason: msg },
    });
  });
}

/**
 * Network connectivity monitor.
 */
export function createConnectivityMonitor(
  onStatusChange: (online: boolean) => void
): () => void {
  const handleOnline = () => onStatusChange(true);
  const handleOffline = () => onStatusChange(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
