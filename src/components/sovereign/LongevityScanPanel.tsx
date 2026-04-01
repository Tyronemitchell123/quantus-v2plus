import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Scan, Loader2, Clock, DollarSign, MapPin, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LongevityLiveDeals from "./LongevityLiveDeals";

type SlotResult = {
  clinic_name: string;
  procedure_type: string;
  slot_date: string;
  slot_time: string;
  original_price: number;
  discounted_price: number;
  location: string;
  is_perishing: boolean;
  value: number;
  source_url: string;
};

const LongevityScanPanel = () => {
  const [scanning, setScanning] = useState(false);
  const [slots, setSlots] = useState<SlotResult[]>([]);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const runScan = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("longevity-slot-scan", {
        body: {
          urls: [
            "https://www.fountainlife.com",
            "https://www.prenuvo.com/locations",
          ],
        },
      });

      if (error) throw error;

      setSlots(data.results || []);
      setLastScan(new Date().toLocaleTimeString("en-GB"));
      toast.success(`Scan complete — ${data.slots_found || 0} diagnostic slots detected`);
    } catch (err: any) {
      toast.error(err.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const formatPrice = (v: number) => `$${v.toLocaleString("en-US")}`;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="scanner" className="text-xs">Bio-Portal Scanner</TabsTrigger>
          <TabsTrigger value="live" className="text-xs">Live Recoveries</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse size={16} className="text-rose-400" />
                <h3 className="font-display text-sm font-semibold text-foreground">Longevity Slot Scanner</h3>
              </div>
              {lastScan && (
                <span className="font-body text-[10px] text-muted-foreground">Last scan: {lastScan}</span>
              )}
            </div>

            <p className="font-body text-xs text-muted-foreground">
              Monitor premium health portals for last-minute cancellation slots on high-ticket diagnostics (MRI, Full-Body Scans, Cardiovascular Screening). Slots within 48 hours are flagged as "Perishing Assets."
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={runScan}
                disabled={scanning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-xs tracking-wider uppercase transition-all duration-300 bg-gradient-to-r from-rose-500/20 to-primary/20 border border-rose-500/30 text-rose-300 hover:border-rose-400/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] disabled:opacity-50"
              >
                {scanning ? <Loader2 size={14} className="animate-spin" /> : <Scan size={14} />}
                {scanning ? "Scanning Portals…" : "Scan Bio-Portals"}
              </button>
            </div>

            {/* Results */}
            {slots.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  {slots.length} Slot{slots.length !== 1 ? "s" : ""} Detected
                </p>
                {slots.map((slot, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`glass-card p-4 flex items-center gap-4 ${
                      slot.is_perishing
                        ? "border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                        : ""
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${slot.is_perishing ? "bg-rose-400/10 text-rose-400" : "bg-primary/10 text-primary"}`}>
                      {slot.is_perishing ? <Zap size={14} /> : <Clock size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-foreground truncate">
                        {slot.procedure_type || "Diagnostic Slot"} — {slot.clinic_name || "Premium Clinic"}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> {slot.slot_date} {slot.slot_time}
                        </span>
                        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin size={10} /> {slot.location || "London"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm font-medium text-foreground">{formatPrice(slot.value)}</p>
                      {slot.is_perishing && (
                        <span className="font-body text-[9px] text-rose-400 uppercase tracking-wider">Perishing</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {slots.length === 0 && lastScan && (
              <p className="font-body text-xs text-muted-foreground text-center py-4">
                No qualifying slots detected. Portals will be re-scanned automatically.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="live">
          <LongevityLiveDeals />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LongevityScanPanel;
