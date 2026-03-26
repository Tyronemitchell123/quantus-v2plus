import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  text: string;
  /** Only safe text shown — no vendor names, no client details */
}

const MobileNotificationBanner = () => {
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Demo: show a privacy-safe notification after 3 seconds
    const t = setTimeout(() => {
      setNotification({
        id: "1",
        text: "Phase 3 complete — vendor responses ready.",
      });
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => setNotification(null);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[70] lg:hidden safe-area-top"
        >
          <div className="mx-3 mt-3 border border-primary/20 bg-card/95 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
            {/* Gold pulse indicator */}
            <div className="relative shrink-0">
              <Bell size={14} className="text-primary" />
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-body text-[9px] tracking-[0.15em] uppercase text-primary/60 mb-0.5">
                Quantus Update
              </p>
              <p className="font-body text-[12px] text-foreground/90 truncate">
                {notification.text}
              </p>
            </div>

            <button onClick={dismiss} className="shrink-0 text-muted-foreground">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNotificationBanner;
