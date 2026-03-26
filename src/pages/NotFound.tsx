import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="font-display text-7xl font-bold text-primary">404</div>
        <p className="font-body text-lg text-foreground">Page not found</p>
        <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
          The route <code className="text-primary/80 bg-primary/5 px-2 py-0.5 rounded text-xs">{location.pathname}</code> does not exist.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 font-body text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft size={14} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
