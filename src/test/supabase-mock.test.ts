import { describe, it, expect, vi } from "vitest";

// Mock supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      upload: vi.fn().mockResolvedValue({ error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/file.pdf" } }),
    }),
  },
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }),
  removeChannel: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("Supabase client mock", () => {
  it("should have auth methods", () => {
    expect(mockSupabase.auth.signInWithPassword).toBeDefined();
    expect(mockSupabase.auth.signUp).toBeDefined();
    expect(mockSupabase.auth.signOut).toBeDefined();
  });

  it("should have storage methods", () => {
    const bucket = mockSupabase.storage.from("quantusbucket");
    expect(bucket.upload).toBeDefined();
    expect(bucket.list).toBeDefined();
    expect(bucket.remove).toBeDefined();
  });

  it("should have database query builder", () => {
    const query = mockSupabase.from("deals");
    expect(query.select).toBeDefined();
    expect(query.insert).toBeDefined();
    expect(query.update).toBeDefined();
  });
});
