import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, ArrowDown, Loader2 } from "lucide-react";
import { createConnectivityMonitor } from "@/lib/observability";

/**
 * Offline indicator banner — slides down when connectivity is lost.
 */
export const OfflineIndicator = () => {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    return createConnectivityMonitor(setOnline);
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground text-center py-2 text-sm font-medium flex items-center justify-center gap-2 safe-area-top"
        >
          <WifiOff size={14} />
          You're offline — some features may be unavailable
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Pull-to-refresh wrapper for mobile views.
 */
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export const PullToRefresh = ({ onRefresh, children, disabled }: PullToRefreshProps) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 80;
  let startY = 0;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || refreshing) return;
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      setPulling(true);
    }
  }, [disabled, refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || disabled) return;
    const deltaY = Math.max(0, e.touches[0].clientY - startY);
    setPullDistance(Math.min(deltaY * 0.5, 120));
  }, [pulling, disabled]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);

    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pulling, pullDistance, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(pullDistance > 10 || refreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: refreshing ? 48 : pullDistance, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            {refreshing ? (
              <Loader2 size={20} className="animate-spin text-primary" />
            ) : (
              <motion.div
                animate={{ rotate: pullDistance >= threshold ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowDown size={20} className="text-muted-foreground" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};

/**
 * Haptic feedback helper (vibrates on supported devices).
 */
export const hapticFeedback = (pattern: "light" | "medium" | "heavy" = "light") => {
  if (!navigator.vibrate) return;
  const patterns = { light: 10, medium: 25, heavy: 50 };
  navigator.vibrate(patterns[pattern]);
};
