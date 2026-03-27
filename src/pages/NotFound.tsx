import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home, Search } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";

const NotFound = () => {
  const location = useLocation();

  useDocumentHead({
    title: "Page Not Found — Quantus A.I",
    description: "The page you're looking for doesn't exist. Return to the Quantus A.I platform.",
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="font-display text-8xl font-bold text-primary/20">404</div>
        <h1 className="font-display text-2xl font-medium text-foreground">Page not found</h1>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          The route <code className="text-primary/80 bg-primary/5 px-2 py-0.5 rounded text-xs">{location.pathname}</code> doesn't exist. It may have been moved or removed.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-body text-sm font-medium tracking-wider uppercase hover:bg-primary/90 transition-colors"
          >
            <Home size={14} />
            Home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground font-body text-sm hover:border-primary/30 transition-colors"
          >
            <Search size={14} />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
