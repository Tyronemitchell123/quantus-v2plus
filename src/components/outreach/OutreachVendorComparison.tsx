import { motion, AnimatePresence } from "framer-motion";
import { Scale, X, Shield, Clock, Star, CheckCircle2 } from "lucide-react";

interface VendorOutreach {
  id: string;
  vendor_name: string;
  vendor_company: string | null;
  vendor_score: number;
  response_time_hours: number | null;
  negotiation_ready: boolean;
  status: string;
  outreach_strategy: Record<string, any>;
  negotiation_prep: Record<string, any>;
}

interface Props {
  vendors: VendorOutreach[];
  open: boolean;
  onClose: () => void;
}

const OutreachVendorComparison = ({ vendors, open, onClose }: Props) => {
  const respondedVendors = vendors.filter(
    (v) => v.status === "responded" || v.status === "negotiation_ready" || v.negotiation_ready
  );

  if (!open || respondedVendors.length < 2) return null;

  const bestScore = Math.max(...respondedVendors.map((v) => v.vendor_score));
  const fastestTime = Math.min(
    ...respondedVendors.filter((v) => v.response_time_hours != null).map((v) => v.response_time_hours!)
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="glass-card rounded-xl p-6 max-w-3xl w-full border-primary/20 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-primary" />
                <h3 className="font-display text-lg text-foreground">Vendor Comparison</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-body text-[9px] tracking-wider uppercase text-muted-foreground pb-3 pr-4">Vendor</th>
                    <th className="text-center font-body text-[9px] tracking-wider uppercase text-muted-foreground pb-3 px-3">Score</th>
                    <th className="text-center font-body text-[9px] tracking-wider uppercase text-muted-foreground pb-3 px-3">Response Time</th>
                    <th className="text-center font-body text-[9px] tracking-wider uppercase text-muted-foreground pb-3 px-3">Negotiation Ready</th>
                    <th className="text-left font-body text-[9px] tracking-wider uppercase text-muted-foreground pb-3 pl-3">Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {respondedVendors.map((v) => (
                    <tr key={v.id} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-display text-sm text-foreground">{v.vendor_name}</p>
                        {v.vendor_company && (
                          <p className="font-body text-[10px] text-muted-foreground">{v.vendor_company}</p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Shield size={10} className={v.vendor_score === bestScore ? "text-primary" : "text-muted-foreground"} />
                          <span className={`font-display text-sm ${v.vendor_score === bestScore ? "text-primary" : "text-foreground"}`}>
                            {v.vendor_score}
                          </span>
                          {v.vendor_score === bestScore && (
                            <Star size={8} className="text-primary fill-primary" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {v.response_time_hours != null ? (
                          <span className={`font-body text-xs ${v.response_time_hours === fastestTime ? "text-success font-medium" : "text-foreground"}`}>
                            {v.response_time_hours}h
                            {v.response_time_hours === fastestTime && " ⚡"}
                          </span>
                        ) : (
                          <span className="font-body text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {v.negotiation_ready ? (
                          <CheckCircle2 size={14} className="text-success mx-auto" />
                        ) : (
                          <span className="font-body text-[10px] text-muted-foreground">Pending</span>
                        )}
                      </td>
                      <td className="py-3 pl-3">
                        <p className="font-body text-[10px] text-foreground/60 max-w-[200px] line-clamp-2">
                          {v.outreach_strategy?.negotiation_angle || "Standard approach"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <p className="font-body text-[10px] text-primary">
                <Star size={10} className="inline mr-1 fill-primary" />
                AI Recommendation: {respondedVendors.find((v) => v.vendor_score === bestScore)?.vendor_name} has the highest vendor score
                {fastestTime < Infinity && ` and ${respondedVendors.find((v) => v.response_time_hours === fastestTime)?.vendor_name} responded fastest`}.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OutreachVendorComparison;