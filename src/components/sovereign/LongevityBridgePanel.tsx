import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, HeartPulse, Loader2, MapPin, DollarSign, Send, Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const IATA_OPTIONS = [
  { code: "GVA", city: "Geneva", flag: "🇨🇭" },
  { code: "ZRH", city: "Zurich", flag: "🇨🇭" },
  { code: "DXB", city: "Dubai", flag: "🇦🇪" },
  { code: "MUC", city: "Munich", flag: "🇩🇪" },
];

type BridgeResult = {
  match: boolean;
  destination: string;
  providers: {
    id: string;
    clinic_name: string;
    city: string;
    country: string;
    specialties: string[];
    avg_price: string;
  }[];
  outreach_draft: string;
  commission: {
    aviation_fee: string;
    longevity_fee: string;
    total_revenue: string;
  };
};

const LongevityBridgePanel = () => {
  const [scanning, setScanning] = useState(false);
  const [selectedIata, setSelectedIata] = useState("GVA");
  const [leadName, setLeadName] = useState("Sterling");
  const [result, setResult] = useState<BridgeResult | null>(null);

  const runBridge = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("longevity-bridge", {
        body: {
          destination_iata: selectedIata,
          lead_name: leadName,
          flight_details: {
            arrival_time: "tomorrow at 16:00",
            aviation_fee_cents: 415000,
          },
        },
      });

      if (error) throw error;

      setResult(data);
      if (data.match) {
        toast.success(`${data.providers.length} longevity partner(s) found near ${selectedIata}`);
      } else {
        toast.info("No longevity partners found for this destination");
      }
    } catch (err: any) {
      toast.error(err.message || "Bridge scan failed");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Plane size={14} className="text-primary" />
            <ArrowRight size={10} className="text-muted-foreground" />
            <HeartPulse size={14} className="text-rose-400" />
          </div>
          <h3 className="font-display text-sm font-semibold text-foreground">Longevity Bridge</h3>
          <span className="ml-auto font-body text-[9px] tracking-[0.2em] uppercase text-[#D4AF37]">Cross-Sell Engine</span>
        </div>

        <p className="font-body text-xs text-muted-foreground">
          Automatically match Aviation leads with partner Longevity clinics at their destination.
          Dual-commission: Aviation Fee + Medical Access Fee.
        </p>

        {/* Input Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1 block">Destination</label>
            <div className="flex gap-1.5 flex-wrap">
              {IATA_OPTIONS.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => setSelectedIata(opt.code)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-body tracking-wider transition-all border ${
                    selectedIata === opt.code
                      ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "border-border/50 text-muted-foreground hover:border-border"
                  }`}
                >
                  {opt.flag} {opt.code}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1 block">Lead Name</label>
            <input
              type="text"
              value={leadName}
              onChange={e => setLeadName(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 font-body text-xs text-foreground focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
        </div>

        <button
          onClick={runBridge}
          disabled={scanning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-xs tracking-wider uppercase transition-all duration-300 bg-gradient-to-r from-primary/20 to-rose-500/20 border border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] disabled:opacity-50"
        >
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          {scanning ? "Scanning Partners…" : "Trigger Destination Bridge"}
        </button>
      </div>

      {/* Results */}
      {result?.match && (
        <>
          {/* Providers */}
          <div className="space-y-2">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              {result.providers.length} Partner Clinic{result.providers.length !== 1 ? "s" : ""} Near {result.destination}
            </p>
            {result.providers.map((prov, i) => (
              <motion.div
                key={prov.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className="p-2 rounded-lg bg-rose-400/10 text-rose-400">
                  <HeartPulse size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-foreground font-medium truncate">{prov.clinic_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin size={9} /> {prov.city}, {prov.country}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {prov.specialties.slice(0, 3).map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-muted/30 font-body text-[9px] text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-medium text-foreground">{prov.avg_price}</p>
                  <span className="font-body text-[9px] text-muted-foreground">avg. programme</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Outreach Draft */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Send size={13} className="text-[#D4AF37]" />
              <span className="font-body text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]">Elite Concierge Draft</span>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
              <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">{result.outreach_draft}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors">
                Higher Urgency
              </button>
              <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                Relationship-First
              </button>
              <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                Send to Client
              </button>
            </div>
          </motion.div>

          {/* Dual-Commission Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-4 border-[#D4AF37]/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={13} className="text-[#D4AF37]" />
              <span className="font-body text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]">Dual-Commission Breakdown</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/20 rounded-lg p-3 text-center">
                <Plane size={14} className="mx-auto text-primary mb-1" />
                <p className="font-display text-sm font-semibold text-foreground">{result.commission.aviation_fee}</p>
                <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Aviation Fee</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-3 text-center">
                <HeartPulse size={14} className="mx-auto text-rose-400 mb-1" />
                <p className="font-display text-sm font-semibold text-foreground">{result.commission.longevity_fee}</p>
                <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Medical Fee</p>
              </div>
              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-3 text-center">
                <Zap size={14} className="mx-auto text-[#D4AF37] mb-1" />
                <motion.p
                  animate={{ textShadow: ["0 0 8px rgba(212,175,55,0)", "0 0 16px rgba(212,175,55,0.4)", "0 0 8px rgba(212,175,55,0)"] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="font-display text-sm font-bold text-[#D4AF37]"
                >
                  {result.commission.total_revenue}
                </motion.p>
                <p className="font-body text-[9px] text-[#D4AF37]/70 uppercase tracking-wider">Total Revenue</p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {result && !result.match && (
        <p className="font-body text-xs text-muted-foreground text-center py-4">
          No longevity partners configured for {result.destination}. Add clinics via the admin panel.
        </p>
      )}
    </div>
  );
};

export default LongevityBridgePanel;
