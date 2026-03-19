import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye } from "lucide-react";
import type { QuantumJob } from "@/hooks/use-quantum-jobs";

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-muted text-muted-foreground",
  running: "bg-quantum-cyan/20 text-quantum-cyan border-quantum-cyan/30",
  completed: "bg-emerald/20 text-emerald border-emerald/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground",
};

interface JobListProps {
  jobs: QuantumJob[];
  loading: boolean;
  onSelect: (job: QuantumJob) => void;
  onRefresh: () => void;
}

export default function JobList({ jobs, loading, onSelect, onRefresh }: JobListProps) {
  if (jobs.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No quantum jobs yet. Submit a circuit to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Job History</h3>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {jobs.map((job, i) => (
          <motion.button
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(job)}
            className="w-full text-left p-3 rounded-lg bg-secondary/30 border border-border hover:border-quantum-cyan/30 transition-colors"
            aria-label={`View job ${job.id.slice(0, 8)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-muted-foreground">{job.id.slice(0, 8)}…</span>
              <Badge className={`text-[10px] ${STATUS_COLORS[job.status] || ""}`}>
                {job.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{job.device_arn.split("/").pop()}</span>
              <span>{job.shots} shots</span>
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
