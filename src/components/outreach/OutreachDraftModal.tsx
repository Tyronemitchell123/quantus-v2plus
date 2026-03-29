import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCircle2, Edit3, Send } from "lucide-react";
import { toast } from "sonner";

interface Draft {
  title: string;
  preview: string;
  body: string;
}

interface Props {
  draft: Draft | null;
  onClose: () => void;
}

const OutreachDraftModal = ({ draft, onClose }: Props) => {
  const [editing, setEditing] = useState(false);
  const [editedBody, setEditedBody] = useState("");
  const [copied, setCopied] = useState(false);

  if (!draft) return null;

  const currentBody = editing ? editedBody : draft.body;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentBody);
      setCopied(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info("Could not copy to clipboard");
    }
  };

  const handleEdit = () => {
    setEditedBody(draft.body);
    setEditing(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 12 }}
          className="glass-card rounded-xl p-6 max-w-lg w-full border-primary/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-body text-[9px] tracking-[0.2em] uppercase text-primary/60 mb-1">Draft Message</p>
              <h3 className="font-display text-lg text-foreground">{draft.title}</h3>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={16} />
            </button>
          </div>

          {editing ? (
            <textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="w-full h-48 bg-card border border-border rounded-lg p-3 font-body text-sm text-foreground resize-none focus:outline-none focus:border-primary/50"
            />
          ) : (
            <div className="bg-card border border-border/50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
              <p className="font-body text-[12px] text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {draft.body}
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground font-body text-[9px] tracking-[0.2em] uppercase rounded-lg hover:brightness-110 transition-all"
            >
              {copied ? <CheckCircle2 size={10} /> : <Copy size={10} />}
              {copied ? "Copied" : "Copy Message"}
            </button>
            {!editing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-5 py-2.5 border border-border font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground rounded-lg transition-all"
              >
                <Edit3 size={10} /> Edit Draft
              </button>
            )}
            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-5 py-2.5 border border-border font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground rounded-lg transition-all"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OutreachDraftModal;