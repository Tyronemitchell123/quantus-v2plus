import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "quantus_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (all: boolean) => {
    const value = {
      essential: true,
      analytics: all || analytics,
      preferences: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_KEY, JSON.stringify(value));
    setVisible(false);
  };

  const reject = () => {
    const value = {
      essential: true,
      analytics: false,
      preferences: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_KEY, JSON.stringify(value));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
        >
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Cookie className="text-primary shrink-0" size={18} />
                <h3 className="font-display text-sm font-semibold text-foreground">Cookie Preferences</h3>
              </div>
              <button onClick={reject} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed mb-4">
              We use essential cookies for authentication and security. Optional analytics cookies help us improve the platform.{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>

            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mb-4 space-y-2 text-xs"
              >
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" checked disabled className="accent-primary" />
                  <span>Essential (required)</span>
                </label>
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Analytics</span>
                </label>
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowDetails(!showDetails)} className="text-xs">
                {showDetails ? "Hide" : "Customise"}
              </Button>
              <Button size="sm" variant="outline" onClick={reject} className="text-xs">
                Reject All
              </Button>
              <Button size="sm" onClick={() => accept(true)} className="text-xs ml-auto">
                Accept All
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
