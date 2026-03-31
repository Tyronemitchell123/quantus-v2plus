import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Automated welcome sequence:
 * 1. Triggers welcome email on onboarding completion
 * 2. Shows contextual in-app tooltips for first 3 sessions
 * 3. Creates an initial notification with next-step guidance
 */

const TOOLTIPS_KEY = "quantus_welcome_tooltips";

interface WelcomeTooltip {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or route
  dismissed: boolean;
}

const DEFAULT_TOOLTIPS: WelcomeTooltip[] = [
  {
    id: "intake",
    title: "Start Your First Deal",
    description: "Submit a request through the Intake Engine to begin your orchestration journey.",
    target: "/intake",
    dismissed: false,
  },
  {
    id: "concierge",
    title: "Meet Your AI Concierge",
    description: "Chat with your personal AI assistant for guidance and recommendations.",
    target: "/chat",
    dismissed: false,
  },
  {
    id: "modules",
    title: "Explore Your Modules",
    description: "Dive into your activated vertical modules to discover specialised capabilities.",
    target: "/dashboard/modules",
    dismissed: false,
  },
];

export function useWelcomeSequence(userId: string | undefined) {
  const storageKey = userId ? `${TOOLTIPS_KEY}_${userId}` : TOOLTIPS_KEY;

  const [tooltips, setTooltips] = useState<WelcomeTooltip[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as WelcomeTooltip[];
        // Validate structure
        if (Array.isArray(parsed) && parsed.every(t => typeof t.id === "string")) return parsed;
      }
      return DEFAULT_TOOLTIPS;
    } catch {
      return DEFAULT_TOOLTIPS;
    }
  });

  const [sequenceTriggered, setSequenceTriggered] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tooltips));
  }, [tooltips, storageKey]);

  const triggerWelcomeSequence = useCallback(
    async (email: string, displayName?: string) => {
      if (sequenceTriggered || !userId) return;
      setSequenceTriggered(true);

      // 1. Send welcome email
      try {
        await supabase.functions.invoke("send-welcome-email", {
          body: { email, displayName },
        });
      } catch (err) {
        console.warn("Welcome email failed:", err);
      }

      // 2. Create in-app welcome notification
      try {
        await supabase.from("notifications").insert({
          user_id: userId,
          title: "Welcome to QUANTUS V2+",
          body: "Your sovereign profile is ready. Start by submitting your first deal through the Intake Engine, or explore your activated modules.",
          category: "onboarding",
          severity: "info",
          action_url: "/intake",
        });
      } catch (err) {
        console.warn("Welcome notification failed:", err);
      }
    },
    [userId, sequenceTriggered],
  );

  const dismissTooltip = useCallback((id: string) => {
    setTooltips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissed: true } : t)),
    );
  }, []);

  const activeTooltips = tooltips.filter((t) => !t.dismissed);

  return { activeTooltips, dismissTooltip, triggerWelcomeSequence };
}
