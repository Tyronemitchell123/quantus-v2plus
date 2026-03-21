import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription, SubscriptionTier } from "@/hooks/use-subscription";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: SubscriptionTier;
  requiredRole?: "admin";
}

const ProtectedRoute = ({ children, requiredTier, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { canAccess, loading: subLoading } = useSubscription();
  const [roleLoading, setRoleLoading] = useState(Boolean(requiredRole));
  const [hasRequiredRole, setHasRequiredRole] = useState(!requiredRole);

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

  if (authLoading || subLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
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
