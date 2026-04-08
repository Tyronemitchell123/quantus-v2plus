import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, Pause, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const phases = [
  { num: 1, label: "Intake", path: "/intake" },
  { num: 2, label: "Sourcing", path: "/sourcing" },
  { num: 3, label: "Outreach", path: "/outreach" },
  { num: 4, label: "Shortlist", path: "/shortlist" },
  { num: 5, label: "Negotiation", path: "/negotiation" },
  { num: 6, label: "Workflow", path: "/workflow" },
  { num: 7, label: "Documents", path: "/documents" },
  { num: 8, label: "Completion", path: "/deal-completion" },
];

interface Props {
  dealId?: string | null;
  currentPhase: number;
  phaseTitle: string;
  children: React.ReactNode;
  onApprove?: () => void;
  onRevise?: () => void;
  onPause?: () => void;
  approveLabel?: string;
  showBottomBar?: boolean;
}

const DealPhaseLayout = ({
  dealId,
  currentPhase,
  phaseTitle,
  children,
  onApprove,
  onRevise,
  onPause,
  approveLabel = "Approve & Continue",
  showBottomBar = true,
}: Props) => {
  const { pathname } = useLocation();
  const dealQuery = dealId ? `?deal=${dealId}` : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-30">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <Home size={14} />
              </Link>
              <span className="text-border">/</span>
              <Link
                to={`/deals${dealQuery}`}
                className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Deal Engine
              </Link>
              <span className="text-border">/</span>
              <span className="font-body text-xs tracking-[0.15em] uppercase text-primary">
                Phase {currentPhase}
              </span>
            </div>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden sm:block">
              {phaseTitle}
            </p>
          </div>

          {/* Phase timeline */}
          <div className="flex items-center gap-0 pb-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {phases.map((phase, i) => {
              const isActive = phase.num === currentPhase;
              const isCompleted = phase.num < currentPhase;
              const phaseLink = phase.path + dealQuery;

              return (
                <div key={phase.num} className="flex items-center shrink-0">
                  <Link
                    to={phaseLink}
                    className={`flex items-center gap-1.5 px-2.5 py-1 transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                          ? "text-primary/50 hover:text-primary/70"
                          : "text-muted-foreground/40 hover:text-muted-foreground/60"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-body font-medium border transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary gold-glow"
                          : isCompleted
                            ? "border-primary/30 bg-primary/5 text-primary/60"
                            : "border-border text-muted-foreground/40"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={10} /> : phase.num}
                    </div>
                    <span className="font-body text-[10px] tracking-wider whitespace-nowrap hidden md:inline">
                      {phase.label}
                    </span>
                  </Link>
                  {i < phases.length - 1 && (
                    <div
                      className={`w-4 h-px mx-0.5 ${
                        isCompleted ? "bg-primary/30" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Gold progress bar */}
          <div className="h-px w-full bg-border relative">
            <motion.div
              className="h-px bg-primary absolute left-0 top-0"
              initial={{ width: 0 }}
              animate={{ width: `${((currentPhase - 1) / 7) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">{children}</div>

      {/* Bottom Bar */}
      {showBottomBar && (onApprove || onRevise || onPause) && (
        <div className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur-md z-20">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl flex items-center justify-between h-14">
            <div className="flex gap-2">
              {onRevise && (
                <button
                  onClick={onRevise}
                  className="px-4 py-2 border border-border font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
                >
                  Request Revision
                </button>
              )}
              {onPause && (
                <button
                  onClick={onPause}
                  className="px-4 py-2 border border-border font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
                >
                  <Pause size={10} /> Pause Deal
                </button>
              )}
            </div>
            {onApprove && (
              <button
                onClick={onApprove}
                className="px-6 py-2 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                {approveLabel} <ArrowRight size={10} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Deal Engine Footer */}
      <div className="border-t border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl flex items-center justify-between py-3">
          <Link
            to="/dashboard"
            className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Return to Dashboard
          </Link>
          <div className="flex gap-4">
            <button className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              Duplicate Deal
            </button>
            <Link
              to="/intake"
              className="font-body text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-primary transition-colors"
            >
              Start New Deal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealPhaseLayout;
