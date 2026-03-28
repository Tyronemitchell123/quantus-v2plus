import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuantumTerminalLog from "./QuantumTerminalLog";

interface Step {
  label: string;
  status: "pending" | "active" | "complete" | "error";
}

interface QuantumProgressLCDProps {
  jobStatus: string | null;
  submitting?: boolean;
}

const JOB_STEPS: { key: string; label: string }[] = [
  { key: "validate", label: "VALIDATING CIRCUIT" },
  { key: "compile", label: "COMPILING QASM" },
  { key: "queue", label: "QUEUING ON DEVICE" },
  { key: "execute", label: "EXECUTING GATES" },
  { key: "measure", label: "MEASURING QUBITS" },
  { key: "collect", label: "COLLECTING RESULTS" },
];

function resolveSteps(jobStatus: string | null, submitting?: boolean): Step[] {
  if (!submitting && !jobStatus) {
    return JOB_STEPS.map((s) => ({ label: s.label, status: "pending" }));
  }

  if (submitting) {
    return JOB_STEPS.map((s, i) => ({
      label: s.label,
      status: i === 0 ? "active" : "pending",
    }));
  }

  const statusMap: Record<string, number> = {
    submitted: 1,
    queued: 2,
    running: 3,
    measuring: 4,
    completed: 6,
    failed: -1,
  };

  const progress = statusMap[jobStatus || ""] ?? 0;

  if (progress === -1) {
    return JOB_STEPS.map((s, i) => ({
      label: s.label,
      status: i <= 2 ? "complete" : i === 3 ? "error" : "pending",
    }));
  }

  return JOB_STEPS.map((s, i) => ({
    label: s.label,
    status: i < progress ? "complete" : i === progress ? "active" : "pending",
  }));
}

// Individual LED indicator
const LED = ({ status }: { status: Step["status"] }) => {
  const colorMap = {
    pending: "bg-muted/40",
    active: "bg-quantum-cyan shadow-[0_0_8px_hsl(var(--quantum-cyan)),0_0_20px_hsl(var(--quantum-cyan)/0.4)]",
    complete: "bg-emerald-500 shadow-[0_0_6px_theme(colors.emerald.500)]",
    error: "bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]",
  };

  return (
    <div className="relative">
      <div className={`w-2.5 h-2.5 rounded-full ${colorMap[status]} transition-colors duration-300`} />
      {status === "active" && (
        <motion.div
          className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-quantum-cyan/60"
          animate={{ opacity: [1, 0.2, 1], scale: [1, 1.6, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
};

// Scrolling LCD text line
const LCDLine = ({ text, active }: { text: string; active: boolean }) => {
  return (
    <div className="font-mono text-[11px] tracking-[0.15em] uppercase truncate">
      {active ? (
        <motion.span
          className="text-quantum-cyan"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          ▸ {text}
        </motion.span>
      ) : (
        <span className="text-muted-foreground/50">{text}</span>
      )}
    </div>
  );
};

// Synthesize a short blip sound via Web Audio API
const playStepSound = (type: "complete" | "error" | "done") => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "complete") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // "done" — rising two-tone chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(990, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }

    // Try haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(type === "error" ? [50, 30, 50] : type === "done" ? [30, 20, 30, 20, 60] : [20]);
    }
  } catch {
    // Audio not available — silent fallback
  }
};

export default function QuantumProgressLCD({ jobStatus, submitting }: QuantumProgressLCDProps) {
  const steps = resolveSteps(jobStatus, submitting);
  const activeIndex = steps.findIndex((s) => s.status === "active");
  const hasActivity = submitting || (jobStatus && jobStatus !== "completed" && jobStatus !== "failed");

  // Track completed count to detect step transitions
  const prevCompletedRef = useRef(0);
  const completedCount = steps.filter((s) => s.status === "complete").length;
  const hasError = steps.some((s) => s.status === "error");
  const allDone = jobStatus === "completed";

  useEffect(() => {
    const prev = prevCompletedRef.current;
    if (completedCount > prev && prev > 0) {
      if (allDone) {
        playStepSound("done");
      } else {
        playStepSound("complete");
      }
    }
    if (hasError && prev >= 0 && !prevCompletedRef.current) {
      // Only fire once on error
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount, allDone, hasError]);

  // Fire error sound when error first appears
  const prevErrorRef = useRef(false);
  useEffect(() => {
    if (hasError && !prevErrorRef.current) {
      playStepSound("error");
    }
    prevErrorRef.current = hasError;
  }, [hasError]);

  // Scanline flicker
  const [scanlineY, setScanlineY] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (hasActivity) {
      intervalRef.current = setInterval(() => {
        setScanlineY((prev) => (prev + 1) % 100);
      }, 50);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [hasActivity]);

  // LCD status message
  const statusMessage = (() => {
    if (!submitting && !jobStatus) return "AWAITING CIRCUIT INPUT";
    if (jobStatus === "completed") return "JOB COMPLETE ✓";
    if (jobStatus === "failed") return "EXECUTION FAILED ✗";
    if (activeIndex >= 0) return steps[activeIndex].label + "...";
    return "PROCESSING...";
  })();

  const progressPct = (completedCount / steps.length) * 100;

  return (
    <div className="relative rounded-xl overflow-hidden border border-quantum-purple/20 bg-[hsl(270,30%,5%)]">
      {/* LCD screen bezel */}
      <div className="p-0.5 bg-gradient-to-b from-quantum-purple/20 via-transparent to-quantum-purple/10 rounded-xl">
        <div className="rounded-[10px] overflow-hidden bg-[hsl(270,20%,4%)] relative">
          {/* Scanline overlay */}
          {hasActivity && (
            <div
              className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,92,246,0.15) 2px, rgba(139,92,246,0.15) 4px)",
              }}
            />
          )}

          {/* Moving scanline */}
          {hasActivity && (
            <motion.div
              className="absolute left-0 right-0 h-px bg-quantum-purple/20 pointer-events-none z-10"
              style={{ top: `${scanlineY}%` }}
            />
          )}

          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-quantum-purple/10 bg-quantum-purple/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasActivity
                        ? i === 0
                          ? "bg-quantum-cyan"
                          : i === 1
                          ? "bg-quantum-purple"
                          : "bg-primary"
                        : "bg-muted/30"
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-quantum-purple/70">
                QUANTUS V2+ QPU MONITOR
              </span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground/40">
              v2.4.1
            </span>
          </div>

          {/* Main LCD display area */}
          <div className="px-4 py-3 space-y-3">
            {/* Status readout */}
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={statusMessage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-xs tracking-[0.12em] text-quantum-cyan font-medium truncate"
                  >
                    {statusMessage}
                  </motion.div>
                </AnimatePresence>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                {completedCount}/{steps.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-1.5 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--quantum-purple)), hsl(var(--quantum-cyan)))",
                  boxShadow: "0 0 12px hsl(var(--quantum-cyan) / 0.4)",
                }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {hasActivity && (
                <motion.div
                  className="absolute inset-y-0 rounded-full bg-white/20"
                  animate={{
                    left: ["0%", "100%"],
                    width: ["10%", "10%"],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            {/* Step list with LEDs */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 min-w-0">
                  <LED status={step.status} />
                  <LCDLine
                    text={step.label}
                    active={step.status === "active"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer bar with blinking indicators */}
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-quantum-purple/10 bg-quantum-purple/[0.03]">
            <div className="flex items-center gap-3">
              {["SYS", "NET", "QPU"].map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <motion.div
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasActivity ? "bg-emerald-500" : "bg-muted/30"
                    }`}
                    animate={
                      hasActivity
                        ? { opacity: [1, 0.3, 1] }
                        : {}
                    }
                    transition={{
                      duration: 0.6 + i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }}
                  />
                  <span className="font-mono text-[8px] tracking-wider text-muted-foreground/40 uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <span className="font-mono text-[8px] text-muted-foreground/30">
              {hasActivity ? "LINK ACTIVE" : "STANDBY"}
            </span>
          </div>
        </div>
      </div>
      <QuantumTerminalLog jobStatus={jobStatus} submitting={submitting} />
    </div>
  );
}
