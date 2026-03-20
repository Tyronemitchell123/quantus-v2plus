import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface FeedJob {
  id: string;
  device_arn: string;
  shots: number;
  status: string;
  created_at: string;
}

const STATUS_DOT: Record<string, string> = {
  queued: "bg-muted-foreground",
  running: "bg-quantum-cyan animate-pulse",
  completed: "bg-emerald",
  failed: "bg-destructive",
};

export default function LiveJobFeed() {
  const [jobs, setJobs] = useState<FeedJob[]>([]);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Initial fetch of recent jobs (anonymized)
    supabase
      .from("quantum_jobs")
      .select("id, device_arn, shots, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setJobs(data as FeedJob[]);
      });

    // Realtime subscription
    const channel = supabase
      .channel("live-quantum-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quantum_jobs" },
        (payload) => {
          const job = payload.new as FeedJob;
          if (!job?.id) return;

          setPulse(true);
          setTimeout(() => setPulse(false), 1000);

          setJobs((prev) => {
            const filtered = prev.filter((j) => j.id !== job.id);
            return [job, ...filtered].slice(0, 10);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="quantum-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Radio size={14} className={`text-quantum-cyan ${pulse ? "animate-ping" : ""}`} />
        <h3 className="text-sm font-medium text-foreground">Live Quantum Feed</h3>
        <Badge variant="outline" className="ml-auto text-[9px] border-quantum-cyan/30 text-quantum-cyan">
          REAL-TIME
        </Badge>
      </div>

      <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-secondary/20 text-xs"
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[job.status] || "bg-muted"}`} />
              <span className="font-mono text-muted-foreground truncate">
                {job.device_arn.split("/").pop()}
              </span>
              <span className="text-muted-foreground/60">{job.shots}s</span>
              <span className="ml-auto text-[10px] text-muted-foreground/50 tabular-nums">
                {timeSince(job.created_at)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {jobs.length === 0 && (
          <p className="text-xs text-muted-foreground/50 text-center py-4">
            No quantum jobs yet. Submit one to see it here.
          </p>
        )}
      </div>
    </div>
  );
}

function timeSince(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
