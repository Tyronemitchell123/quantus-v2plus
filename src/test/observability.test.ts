import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  trackError,
  getRecentErrors,
  withRetry,
  measurePerformance,
} from "@/lib/observability";

describe("Observability", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("tracks errors with structured context", () => {
    trackError("Test error", "medium", { component: "TestComponent" });
    const errors = getRecentErrors();
    const last = errors[errors.length - 1];
    expect(last.message).toBe("Test error");
    expect(last.severity).toBe("medium");
    expect(last.component).toBe("TestComponent");
  });

  it("tracks Error objects", () => {
    trackError(new Error("Real error"), "high");
    const errors = getRecentErrors();
    const last = errors[errors.length - 1];
    expect(last.message).toBe("Real error");
    expect(last.severity).toBe("high");
  });

  it("withRetry succeeds on first attempt", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn, { maxRetries: 3 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("withRetry retries on failure then succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail1"))
      .mockResolvedValue("ok");
    const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 10 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("withRetry throws after max retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("persistent"));
    await expect(
      withRetry(fn, { maxRetries: 2, baseDelayMs: 10 })
    ).rejects.toThrow("persistent");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("measurePerformance returns result", async () => {
    const result = await measurePerformance("test-op", async () => "done");
    expect(result).toBe("done");
  });

  it("measurePerformance rethrows errors", async () => {
    await expect(
      measurePerformance("fail-op", async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");
  });
});
