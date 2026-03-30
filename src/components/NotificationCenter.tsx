import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications, AppNotification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

const severityStyles: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-500",
  warning: "bg-amber-500/10 text-amber-500",
  critical: "bg-rose-500/10 text-rose-400",
};

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all duration-300"
      >
        <Bell size={15} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
          >
            <span className="text-[8px] font-body font-bold text-primary-foreground">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[420px] glass-card border border-border rounded-xl overflow-hidden z-50 shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-body font-medium text-foreground">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-body">{unreadCount} new</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[9px] tracking-wider uppercase text-primary/60 hover:text-primary font-body px-2 py-1 transition-colors"
                    >
                      <CheckCheck size={13} />
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto max-h-[350px] scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell size={20} className="text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground/40 font-body">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} onRead={markAsRead} onClose={() => setOpen(false)} />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const NotificationItem = ({
  notification: n,
  onRead,
  onClose,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onClose: () => void;
}) => {
  const timeAgo = formatDistanceToNow(new Date(n.created_at), { addSuffix: true });

  return (
    <div
      className={`px-4 py-3 border-b border-border/30 hover:bg-primary/[0.02] transition-colors cursor-pointer ${!n.is_read ? "bg-primary/[0.03]" : ""}`}
      onClick={() => { if (!n.is_read) onRead(n.id); }}
    >
      <div className="flex items-start gap-3">
        {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[8px] tracking-wider uppercase font-body px-1.5 py-0.5 rounded-full ${severityStyles[n.severity] || severityStyles.info}`}>
              {n.category}
            </span>
          </div>
          <p className="text-[13px] font-body text-foreground leading-snug">{n.title}</p>
          {n.body && <p className="text-[11px] text-muted-foreground font-body mt-0.5 line-clamp-2">{n.body}</p>}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[9px] text-muted-foreground/40 font-body">{timeAgo}</span>
            {n.action_url && (
              <Link
                to={n.action_url}
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="text-[9px] text-primary/60 hover:text-primary font-body flex items-center gap-1"
              >
                View <ExternalLink size={9} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
