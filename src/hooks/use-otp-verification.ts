import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OTPState {
  isOpen: boolean;
  isVerifying: boolean;
  isSending: boolean;
  purpose: string;
  onVerified: (() => void) | null;
}

export function useOTPVerification() {
  const [state, setState] = useState<OTPState>({
    isOpen: false,
    isVerifying: false,
    isSending: false,
    purpose: "high_value_action",
    onVerified: null,
  });

  const requestOTP = useCallback(async (purpose: string, onVerified: () => void) => {
    setState(prev => ({ ...prev, isSending: true, purpose, onVerified }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ purpose }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send OTP");

      toast.success("Verification code sent to your email");
      setState(prev => ({ ...prev, isOpen: true, isSending: false }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send verification code");
      setState(prev => ({ ...prev, isSending: false }));
    }
  }, []);

  const verifyOTP = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isVerifying: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code, purpose: state.purpose }),
      });

      const json = await res.json();
      if (!res.ok || !json.verified) throw new Error(json.error || "Invalid OTP");

      toast.success("Verified successfully");
      state.onVerified?.();
      setState(prev => ({ ...prev, isOpen: false, isVerifying: false }));
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
      setState(prev => ({ ...prev, isVerifying: false }));
      return false;
    }
  }, [state.purpose, state.onVerified]);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { ...state, requestOTP, verifyOTP, close };
}
