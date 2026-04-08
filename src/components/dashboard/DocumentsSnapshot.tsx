import { motion } from "framer-motion";
import { FileSignature, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const pending = [
  { title: "LOI — Gulfstream G700", status: "Awaiting Signature" },
  { title: "Service Agreement — Dr. Nazari", status: "Review Required" },
];

const recent = [
  { title: "Invoice #INV-2847", type: "Invoice" },
  { title: "Staffing Contract — Estate Manager", type: "Contract" },
  { title: "Travel Itinerary — Maldives", type: "Itinerary" },
];

const DocumentsSnapshot = () => (
  <div className="grid md:grid-cols-2 gap-4">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileSignature size={14} className="text-primary" />
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Requiring Action</p>
      </div>
      <div className="space-y-3">
        {pending.map((doc) => (
          <div key={doc.title} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <p className="font-body text-xs text-foreground">{doc.title}</p>
              <p className="font-body text-[10px] text-primary/60">{doc.status}</p>
            </div>
            <Link
              to="/documents"
              className="px-3 py-1.5 border border-primary/20 font-body text-[10px] tracking-wider uppercase text-primary hover:bg-primary/5 transition-colors"
            >
              Sign Now
            </Link>
          </div>
        ))}
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText size={14} className="text-primary" />
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Recent Documents</p>
      </div>
      <div className="space-y-3">
        {recent.map((doc) => (
          <div key={doc.title} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <p className="font-body text-xs text-foreground">{doc.title}</p>
              <p className="font-body text-[10px] text-muted-foreground">{doc.type}</p>
            </div>
          </div>
        ))}
      </div>
      <Link
        to="/documents"
        className="inline-flex items-center gap-1 mt-3 font-body text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-primary transition-colors"
      >
        View All Documents <ArrowRight size={10} />
      </Link>
    </motion.div>
  </div>
);

export default DocumentsSnapshot;
