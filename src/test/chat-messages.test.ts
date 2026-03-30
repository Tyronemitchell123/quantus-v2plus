import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  },
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: "test-user-id", email: "test@test.com" },
    loading: false,
  }),
}));

describe("useChatMessages", () => {
  it("should initialize with empty messages", async () => {
    const { useChatMessages } = await import("@/hooks/use-chat-messages");
    const { result } = renderHook(() => useChatMessages("test-channel"));

    expect(result.current.messages).toEqual([]);
    expect(result.current.sendMessage).toBeInstanceOf(Function);
  });

  it("should accept a channel parameter", async () => {
    const { useChatMessages } = await import("@/hooks/use-chat-messages");
    const { result } = renderHook(() => useChatMessages("deal-engine"));

    expect(result.current.messages).toBeDefined();
    expect(result.current.loading).toBeDefined();
  });
});
