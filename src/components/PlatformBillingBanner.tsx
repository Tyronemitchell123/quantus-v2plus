import { motion } from "framer-motion";
import { Smartphone, Monitor, ShieldCheck, AlertTriangle } from "lucide-react";
import { usePlatform } from "@/hooks/use-platform";

interface Props {
  className?: string;
}

const PlatformBillingBanner = ({ className = "" }: Props) => {
  const { platform, isMobile, requiresStoreBilling, isStandalone, isTWA } = usePlatform();

  const platformLabel = platform === "android" ? "Android" : platform === "ios" ? "iOS" : "Web";
  const Icon = isMobile ? Smartphone : Monitor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {platformLabel} Billing
            </span>
            {(isStandalone || isTWA) && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {isTWA ? "Play Store" : "Installed App"}
              </span>
            )}
          </div>

          {requiresStoreBilling ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">
                  In-app purchases are managed through the{" "}
                  <span className="font-medium text-foreground">
                    {platform === "android" ? "Google Play Store" : "Apple App Store"}
                  </span>
                  . Prices may differ from web pricing due to platform fees.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-secondary/50 p-2.5">
                  <p className="text-muted-foreground mb-0.5">Platform fee</p>
                  <p className="font-semibold text-foreground tabular-nums">
                    {platform === "android" ? "15–30%" : "15–30%"}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2.5">
                  <p className="text-muted-foreground mb-0.5">Billing method</p>
                  <p className="font-semibold text-foreground">
                    {platform === "android" ? "Google Play" : "Apple IAP"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                {isMobile
                  ? "You're browsing on mobile web — enjoy direct billing with no platform fees. Subscribe here for the best price."
                  : "Direct billing with no platform fees. You're getting the best available price."}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlatformBillingBanner;
