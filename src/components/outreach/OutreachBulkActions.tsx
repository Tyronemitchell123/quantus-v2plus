import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Send, RefreshCw, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  outreachList: { id: string; vendor_name: string; status: string }[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkMarkSent: (ids: string[]) => Promise<void>;
  onBulkFollowUp: (ids: string[]) => Promise<void>;
}

const OutreachBulkActions = ({
  outreachList,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onBulkMarkSent,
  onBulkFollowUp,
}: Props) => {
  const [processing, setProcessing] = useState(false);
  const count = selectedIds.size;
  const allSelected = count === outreachList.length && outreachList.length > 0;

  const pendingSelected = outreachList
    .filter((o) => selectedIds.has(o.id) && o.status === "pending")
    .map((o) => o.id);

  const canFollowUp = outreachList
    .filter((o) => selectedIds.has(o.id) && (o.status === "sent" || o.status === "pending"))
    .map((o) => o.id);

  const handleBulkSent = async () => {
    if (pendingSelected.length === 0) {
      toast.info("No pending vendors selected");
      return;
    }
    setProcessing(true);
    await onBulkMarkSent(pendingSelected);
    setProcessing(false);
  };

  const handleBulkFollowUp = async () => {
    if (canFollowUp.length === 0) {
      toast.info("No eligible vendors selected for follow-up");
      return;
    }
    setProcessing(true);
    await onBulkFollowUp(canFollowUp);
    setProcessing(false);
  };

  return (
    <div className="flex items-center gap-3 mb-3">
      <button
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="flex items-center gap-1.5 font-body text-[9px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        {allSelected ? <CheckSquare size={12} className="text-primary" /> : <Square size={12} />}
        {allSelected ? "Deselect All" : "Select All"}
      </button>

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-2"
          >
            <span className="font-body text-[10px] text-primary font-medium">
              {count} selected
            </span>

            <button
              onClick={handleBulkSent}
              disabled={processing || pendingSelected.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground font-body text-[8px] tracking-widest uppercase rounded-md hover:brightness-110 disabled:opacity-40 transition-all"
            >
              {processing ? <Loader2 size={8} className="animate-spin" /> : <Send size={8} />}
              Mark Sent ({pendingSelected.length})
            </button>

            <button
              onClick={handleBulkFollowUp}
              disabled={processing || canFollowUp.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-border font-body text-[8px] tracking-widest uppercase text-muted-foreground hover:text-foreground rounded-md disabled:opacity-40 transition-all"
            >
              {processing ? <Loader2 size={8} className="animate-spin" /> : <RefreshCw size={8} />}
              Follow Up ({canFollowUp.length})
            </button>

            <button
              onClick={onDeselectAll}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OutreachBulkActions;