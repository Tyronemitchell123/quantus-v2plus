import { useEffect, useRef } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TrialExpirationNotifier = () => {
  const { subscription } = useSubscription();
  const shownRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (shownRef.current || !subscription) return;
    if (subscription.tier !== "starter") return;
    if (subscription.status !== "trialing" && subscription.status !== "active") return;

    const periodEnd = subscription.current_period_end;
    if (!periodEnd) return;

    const daysLeft = Math.max(0, Math.ceil((new Date(periodEnd).getTime() - Date.now()) / 86_400_000));
    if (daysLeft > 3) return;

    shownRef.current = true;

    if (daysLeft === 0) {
      toast.error("Your Starter trial has expired", {
        description: "Upgrade now to keep access to 5,000 AI queries/month.",
        duration: 10000,
        action: {
          label: "Upgrade",
          onClick: () => navigate("/pricing"),
        },
      });
    } else {
      toast.warning(
        `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left in your trial`,
        {
          description: "Upgrade before your trial ends to avoid losing access.",
          duration: 8000,
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing"),
          },
        }
      );
    }
  }, [subscription, navigate]);

  return null;
};

export default TrialExpirationNotifier;
