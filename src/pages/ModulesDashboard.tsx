import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plane, Heart, Users, Globe, Truck, Handshake, Anchor, Scale, Landmark } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";
import AviationModule from "@/components/modules/AviationModule";
import MedicalModule from "@/components/modules/MedicalModule";
import StaffingModule from "@/components/modules/StaffingModule";
import LifestyleModule from "@/components/modules/LifestyleModule";
import LogisticsModule from "@/components/modules/LogisticsModule";
import PartnershipsModule from "@/components/modules/PartnershipsModule";
import MarineModule from "@/components/modules/MarineModule";
import LegalModule from "@/components/modules/LegalModule";
import FinanceModule from "@/components/modules/FinanceModule";

type ModuleKey = "aviation" | "medical" | "staffing" | "travel" | "logistics" | "partnerships" | "marine" | "legal" | "finance";

const moduleConfig: { key: ModuleKey; icon: typeof Plane; label: string; desc: string }[] = [
  { key: "aviation", icon: Plane, label: "Aviation", desc: "Aircraft sourcing & valuation" },
  { key: "medical", icon: Heart, label: "Medical", desc: "Clinic matching & wellness" },
  { key: "staffing", icon: Users, label: "Staffing", desc: "UHNW talent & estate staff" },
  { key: "travel", icon: Globe, label: "Lifestyle", desc: "Luxury travel & experiences" },
  { key: "logistics", icon: Truck, label: "Logistics", desc: "Transport & fleet ops" },
  { key: "partnerships", icon: Handshake, label: "Partners", desc: "Vendor scoring & compliance" },
  { key: "marine", icon: Anchor, label: "Marine", desc: "Yachts, charters & crew" },
  { key: "legal", icon: Scale, label: "Legal", desc: "Multi-jurisdictional law" },
  { key: "finance", icon: Landmark, label: "Finance", desc: "Wealth & private banking" },
];

const moduleComponents: Record<ModuleKey, React.FC> = {
  aviation: AviationModule,
  medical: MedicalModule,
  staffing: StaffingModule,
  travel: LifestyleModule,
  logistics: LogisticsModule,
  partnerships: PartnershipsModule,
  marine: MarineModule,
  legal: LegalModule,
  finance: FinanceModule,
};

const ModulesDashboard = () => {
  useDocumentHead({ title: "Modules — Quantus V2+", description: "Multi-module intelligence dashboard across nine verticals." });
  const [activeModule, setActiveModule] = useState<ModuleKey>("aviation");
  const ActiveComponent = moduleComponents[activeModule];
  const activeMeta = moduleConfig.find((m) => m.key === activeModule)!;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="font-body text-[9px] tracking-[0.4em] uppercase text-primary/50 mb-2">Intelligence Dashboard</p>
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-foreground">Quantus V2+ Modules</h1>
          <p className="font-body text-xs text-muted-foreground mt-1">Nine sovereign verticals — one unified orchestration layer.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 shrink-0">
            <div className="glass-card rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
              {moduleConfig.map((mod) => {
                const active = activeModule === mod.key;
                return (
                  <button
                    key={mod.key}
                    onClick={() => setActiveModule(mod.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-body text-sm transition-all duration-300 whitespace-nowrap shrink-0 ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/30 border border-transparent"
                    }`}
                  >
                    <mod.icon size={16} strokeWidth={1.5} className={active ? "text-primary" : "text-muted-foreground"} />
                    <div className="hidden lg:block">
                      <span className="block text-xs">{mod.label}</span>
                      <span className={`block text-[9px] ${active ? "text-primary/60" : "text-muted-foreground/60"}`}>{mod.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesDashboard;
