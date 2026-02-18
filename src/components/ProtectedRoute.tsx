import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription, SubscriptionTier } from "@/hooks/use-subscription";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: SubscriptionTier;
}

const ProtectedRoute = ({ children, requiredTier }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isActive, canAccess, loading: subLoading } = useSubscription();

  if (authLoading || subLoading) {
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

  return <>{children}</>;
};

export default ProtectedRoute;
