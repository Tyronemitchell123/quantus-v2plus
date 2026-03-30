import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock supabase before importing the hook
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(["test"]), error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/test.pdf" } }),
      }),
    },
  },
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: "test-user-id", email: "test@test.com" },
    loading: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useVaultFiles", () => {
  it("should initialize with loading state", async () => {
    const { useVaultFiles } = await import("@/hooks/use-vault-files");
    const { result } = renderHook(() => useVaultFiles());

    expect(result.current.files).toBeDefined();
    expect(result.current.upload).toBeInstanceOf(Function);
    expect(result.current.deleteFile).toBeInstanceOf(Function);
    expect(result.current.downloadFile).toBeInstanceOf(Function);
  });

  it("should expose uploading state", async () => {
    const { useVaultFiles } = await import("@/hooks/use-vault-files");
    const { result } = renderHook(() => useVaultFiles());

    expect(result.current.uploading).toBe(false);
  });
});
