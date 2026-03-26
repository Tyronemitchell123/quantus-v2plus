import { motion } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake,
  CheckCircle2, Radio,
} from "lucide-react";

const categoryFeed: Record<string, string[]> = {
  aviation: [
    "Activating aviation brokers in Europe…",
    "Pulling off-market aircraft listings…",
    "Scanning charter networks in the Middle East…",
    "Verifying maintenance and pedigree records…",
    "Requesting management company comparisons…",
  ],
  medical: [
    "Contacting preferred medical providers…",
    "Checking clinic availability in Zurich…",
    "Verifying surgeon credentials and specialties…",
    "Pulling executive health screening options…",
    "Evaluating longevity program providers…",
  ],
  staffing: [
    "Requesting staffing availability…",
    "Scanning household management networks…",
    "Verifying candidate background checks…",
    "Pulling estate management profiles…",
    "Cross-referencing NDA clearances…",
  ],
  lifestyle: [
    "Fetching ultra-private villa inventory…",
    "Scanning yacht charter availability…",
    "Checking luxury hotel allocations…",
    "Verifying seasonal experience options…",
    "Pulling concierge service providers…",
  ],
  logistics: [
    "Fetching logistics operators in your region…",
    "Scanning recovery fleet availability…",
    "Verifying compliance and licensing…",
    "Pulling route optimization data…",
    "Checking insurance and liability coverage…",
  ],
  partnerships: [
    "Activating partner network scan…",
    "Pulling vendor performance histories…",
    "Verifying commission agreements…",
    "Checking partner availability windows…",
    "Cross-referencing service catalogs…",
  ],
};

interface Props {
  category: string;
  completed?: boolean;
}

const SourcingVendorFeed = ({ category, completed }: Props) => {
  const feed = categoryFeed[category] || categoryFeed.aviation;

  return (
    <div className="space-y-3">
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
        Vendor Activation Feed
      </p>
      <div className="space-y-2">
        {feed.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: completed ? i * 0.05 : i * 0.8 }}
            className="glass-card rounded-lg p-3 flex items-start gap-3 group"
          >
            <div className="shrink-0 mt-0.5">
              {completed ? (
                <CheckCircle2 size={12} className="text-success" />
              ) : (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                >
                  <Radio size={12} className="text-primary" />
                </motion.div>
              )}
            </div>
            <p className={`font-body text-[11px] leading-relaxed ${
              completed ? "text-muted-foreground" : "text-foreground/80"
            }`}>
              {line}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SourcingVendorFeed;
