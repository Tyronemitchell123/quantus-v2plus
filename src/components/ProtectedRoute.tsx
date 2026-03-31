import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription, SubscriptionTier } from "@/hooks/use-subscription";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: SubscriptionTier;
  requiredRole?: "admin";
  skipOnboardingCheck?: boolean;
}

const ProtectedRoute = ({ children, requiredTier, requiredRole, skipOnboardingCheck }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { canAccess, loading: subLoading } = useSubscription();
  const [roleLoading, setRoleLoading] = useState(Boolean(requiredRole));
  const [hasRequiredRole, setHasRequiredRole] = useState(!requiredRole);
  const location = useLocation();
  const onboardingStatus = useOnboardingStatus(user?.id);

  useEffect(() => {
    let isMounted = true;

    const checkRole = async () => {
      if (!requiredRole) {
        setHasRequiredRole(true);
        setRoleLoading(false);
        return;
      }

      if (!user) {
        setHasRequiredRole(false);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", requiredRole)
        .maybeSingle();

      if (!isMounted) return;
      setHasRequiredRole(Boolean(data) && !error);
      setRoleLoading(false);
    };

    void checkRole();

    return () => {
      isMounted = false;
    };
  }, [requiredRole, user]);

  if (authLoading || subLoading || roleLoading || onboardingStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Auto-redirect to onboarding if not completed (skip if already on /onboarding)
  const isOnboardingRoute = location.pathname === "/onboarding";
  if (!skipOnboardingCheck && !isOnboardingRoute && !onboardingStatus.completed) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredTier && !canAccess(requiredTier)) {
    return <Navigate to="/pricing" replace />;
  }

  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
