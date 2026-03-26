import { motion } from "framer-motion";
import { Send, CheckCircle2, Clock, Reply, Target, AlertTriangle } from "lucide-react";

const statusIcons: Record<string, typeof Send> = {
  pending: Clock,
  sent: Send,
  responded: Reply,
  negotiation_ready: Target,
  closed: CheckCircle2,
};

const statusColors: Record<string, string> = {
  pending: "text-accent",
  sent: "text-primary",
  responded: "text-success",
  negotiation_ready: "text-primary",
  closed: "text-muted-foreground",
};

interface Props {
  outreachList: {
    id: string;
    vendor_name: string;
    vendor_company: string | null;
    status: string;
    created_at: string;
    follow_up_count: number;
  }[];
  messagesMap: Record<string, { direction: string; created_at: string }[]>;
}

const OutreachTimeline = ({ outreachList, messagesMap }: Props) => {
  // Build timeline events from outreach + messages
  const events: { time: string; label: string; status: string; vendor: string }[] = [];

  outreachList.forEach((o) => {
    events.push({
      time: o.created_at,
      label: `Sent request to ${o.vendor_name}${o.vendor_company ? ` (${o.vendor_company})` : ""}`,
      status: "sent",
      vendor: o.vendor_name,
    });

    const msgs = messagesMap[o.id] || [];
    msgs.filter((m) => m.direction === "inbound").forEach((m) => {
      events.push({
        time: m.created_at,
        label: `${o.vendor_name} responded`,
        status: "responded",
        vendor: o.vendor_name,
      });
    });

    if (o.follow_up_count > 0) {
      events.push({
        time: o.created_at,
        label: `Follow-up #${o.follow_up_count} to ${o.vendor_name}`,
        status: "pending",
        vendor: o.vendor_name,
      });
    }
  });

  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-3">
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
        Outreach Timeline
      </p>

      <div className="relative">
        {/* Gold vertical line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-primary/20" />

        <div className="space-y-1">
          {events.slice(0, 12).map((event, i) => {
            const Icon = statusIcons[event.status] || Send;
            const color = statusColors[event.status] || "text-primary";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 pl-1 relative"
              >
                <div className={`w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center shrink-0 z-10 ${color}`}>
                  <Icon size={9} />
                </div>
                <div className="flex-1 glass-card rounded-lg p-2.5">
                  <p className="font-body text-[11px] text-foreground/80 leading-relaxed">{event.label}</p>
                  <p className="font-body text-[9px] text-muted-foreground/50 mt-0.5">
                    {new Date(event.time).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live status */}
      <div className="glass-card rounded-lg p-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${outreachList.some((o) => o.status === "pending" || o.status === "sent") ? "bg-primary animate-pulse" : "bg-success"}`} />
        <span className="font-body text-[10px] text-muted-foreground">
          {outreachList.some((o) => o.status === "pending" || o.status === "sent")
            ? "Awaiting vendor responses…"
            : "All vendors responded"}
        </span>
      </div>
    </div>
  );
};

export default OutreachTimeline;
