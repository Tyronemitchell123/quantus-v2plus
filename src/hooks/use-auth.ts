import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const auditedRef = useRef(false);

  useEffect(() => {
    // Set up listener FIRST — this is the primary source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === "SIGNED_IN" && session?.user && !auditedRef.current) {
          auditedRef.current = true;
          setTimeout(() => logAudit("login", "auth", session.user.id), 0);
        } else if (event === "SIGNED_OUT") {
          auditedRef.current = false;
          setTimeout(() => logAudit("logout", "auth"), 0);
        }
      }
    );

    // Fallback: ensure loading resolves even if onAuthStateChange is slow
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(prev => prev ?? session);
      setUser(prev => prev ?? (session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    return { data: null, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  };

  return { user, session, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword };
}
