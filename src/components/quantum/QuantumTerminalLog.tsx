import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warn" | "ok" | "err";
  message: string;
}

interface QuantumTerminalLogProps {
  jobStatus: string | null;
  submitting?: boolean;
}

const LEVEL_COLORS: Record<LogEntry["level"], string> = {
  info: "text-quantum-cyan/70",
  warn: "text-yellow-400/80",
  ok: "text-emerald-400/90",
  err: "text-destructive/90",
};

const LEVEL_PREFIX: Record<LogEntry["level"], string> = {
  info: "INF",
  warn: "WRN",
  ok: " OK",
  err: "ERR",
};

// Generate contextual log messages for each status transition
function generateLogs(
  jobStatus: string | null,
  submitting: boolean | undefined,
  prevStatus: string | null
): LogEntry[] {
  const now = () => {
    const d = new Date();
    return d.toTimeString().slice(0, 8) + "." + String(d.getMilliseconds()).padStart(3, "0");
  };

  let id = Date.now();
  const entry = (level: LogEntry["level"], message: string): LogEntry => ({
    id: id++,
    timestamp: now(),
    level,
    message,
  });

  if (submitting && !prevStatus) {
    return [
      entry("info", "Initializing quantum session..."),
      entry("info", "Parsing OpenQASM circuit definition"),
      entry("info", "Circuit validation: 0 errors, 0 warnings"),
      entry("ok", "Circuit accepted — forwarding to compiler"),
    ];
  }

  switch (jobStatus) {
    case "submitted":
      return [
        entry("info", "Compiling circuit to native gate set"),
        entry("info", "Gate decomposition: 2q gates → CX basis"),
        entry("info", "Optimization level: O2 (routing + cancellation)"),
        entry("ok", "Compiled circuit: depth=14, cx_count=6"),
      ];
    case "queued":
      return [
        entry("info", "Submitting job to execution queue"),
        entry("info", "Queue position: #1 — estimated wait: <2s"),
        entry("warn", "Device calibration data: 4h old"),
        entry("info", "Awaiting QPU allocation..."),
      ];
    case "running":
      return [
        entry("ok", "QPU allocated — beginning shot execution"),
        entry("info", "Executing shots: batch_size=128"),
        entry("info", "Gate fidelity check: CX avg 99.2%"),
        entry("info", "T1/T2 coherence within tolerance"),
      ];
    case "measuring":
      return [
        entry("info", "All shots executed — entering measurement phase"),
        entry("info", "Reading qubit registers..."),
        entry("info", "Applying error mitigation (M3)"),
      ];
    case "completed":
      return [
        entry("ok", "Measurement complete — collating results"),
        entry("ok", "Result counts aggregated successfully"),
        entry("info", `Execution time: ${(Math.random() * 2 + 0.5).toFixed(2)}s`),
        entry("ok", "━━━ JOB FINISHED ━━━"),
      ];
    case "failed":
      return [
        entry("err", "Execution halted — device error detected"),
        entry("err", "QPU returned: GATE_TIMEOUT on q[2]"),
        entry("warn", "Partial results discarded"),
        entry("err", "━━━ JOB FAILED ━━━"),
      ];
    default:
      return [];
  }
}

export default function QuantumTerminalLog({ jobStatus, submitting }: QuantumTerminalLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);
  const prevStatusRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<LogEntry[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Generate new logs on status change
  useEffect(() => {
    const newLogs = generateLogs(jobStatus, submitting, prevStatusRef.current);
    prevStatusRef.current = jobStatus;

    if (newLogs.length > 0) {
      setLogs((prev) => [...prev, ...newLogs]);
      // Queue them for staggered display
      queueRef.current = [...queueRef.current, ...newLogs];
    }
  }, [jobStatus, submitting]);

  // Staggered log rendering — typewriter-like drip
  useEffect(() => {
    const drip = () => {
      if (queueRef.current.length === 0) return;
      const next = queueRef.current.shift()!;
      setVisibleLogs((prev) => [...prev, next]);
      timerRef.current = setTimeout(drip, 120 + Math.random() * 180);
    };

    if (queueRef.current.length > 0 && !timerRef.current) {
      drip();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = undefined;
    };
  }, [logs]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  // Reset on new submission
  useEffect(() => {
    if (submitting) {
      setLogs([]);
      setVisibleLogs([]);
      queueRef.current = [];
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, [submitting]);

  const hasContent = visibleLogs.length > 0 || submitting || jobStatus;

  if (!hasContent) return null;

  return (
    <div className="mt-2 rounded-lg border border-quantum-purple/15 bg-[hsl(270,25%,3%)] overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-quantum-purple/10 bg-quantum-purple/[0.04]">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
        </div>
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40">
          execution log
        </span>
        <span className="ml-auto font-mono text-[8px] text-muted-foreground/30">
          {visibleLogs.length} entries
        </span>
      </div>

      {/* Scrollable log area */}
      <div
        ref={scrollRef}
        className="max-h-[160px] overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-quantum-purple/20 scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {visibleLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex gap-2 font-mono text-[10px] leading-relaxed"
            >
              <span className="text-muted-foreground/30 shrink-0 tabular-nums">
                {log.timestamp}
              </span>
              <span className={`shrink-0 font-semibold ${LEVEL_COLORS[log.level]}`}>
                [{LEVEL_PREFIX[log.level]}]
              </span>
              <span className={LEVEL_COLORS[log.level]}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor */}
        {(submitting || (jobStatus && jobStatus !== "completed" && jobStatus !== "failed")) && (
          <motion.span
            className="inline-block w-1.5 h-3 bg-quantum-cyan/70 ml-0.5"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}
