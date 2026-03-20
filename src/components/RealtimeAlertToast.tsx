import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, Info, X } from "lucide-react";
import type { RealtimeAlert } from "@/hooks/use-realtime-alerts";

const severityIcon: Record<string, any> = {
  critical: AlertTriangle,
  warning: Bell,
  info: Info,
};

const severityStyles: Record<string, string> = {
  critical: "border-destructive/40 bg-destructive/10",
  warning: "border-primary/40 bg-primary/10",
  info: "border-neon-blue/40 bg-neon-blue/10",
};

const severityText: Record<string, string> = {
  critical: "text-destructive",
  warning: "text-primary",
  info: "text-neon-blue",
};

interface Props {
  alert: RealtimeAlert | null;
  onDismiss: () => void;
}

export default function RealtimeAlertToast({ alert, onDismiss }: Props) {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  const Icon = alert ? (severityIcon[alert.severity] || Info) : Info;

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed top-20 right-4 z-50 max-w-sm w-full rounded-xl border p-4 shadow-lg backdrop-blur-sm ${severityStyles[alert.severity] || severityStyles.info}`}
        >
          <div className="flex items-start gap-3">
            <div className={`shrink-0 mt-0.5 ${severityText[alert.severity] || severityText.info}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{alert.title}</p>
              {alert.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
              )}
              <p className={`text-[10px] font-semibold uppercase tracking-wider mt-1.5 ${severityText[alert.severity] || severityText.info}`}>
                {alert.severity} alert
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
