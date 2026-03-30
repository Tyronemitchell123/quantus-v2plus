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

const moduleConfig: { key: ModuleKey; icon: typeof Plane; label: string }[] = [
  { key: "aviation", icon: Plane, label: "Aviation" },
  { key: "medical", icon: Heart, label: "Medical" },
  { key: "staffing", icon: Users, label: "Staffing" },
  { key: "travel", icon: Globe, label: "Lifestyle" },
  { key: "logistics", icon: Truck, label: "Logistics" },
  { key: "partnerships", icon: Handshake, label: "Partners" },
  { key: "marine", icon: Anchor, label: "Marine" },
  { key: "legal", icon: Scale, label: "Legal" },
  { key: "finance", icon: Landmark, label: "Finance" },
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
  useDocumentHead({ title: "Modules — Quantus V2+", description: "Multi-module intelligence dashboard." });
  const [activeModule, setActiveModule] = useState<ModuleKey>("aviation");
  const ActiveComponent = moduleComponents[activeModule];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-2">Intelligence Dashboard</p>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">Quantus V2+ Modules</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-48 shrink-0">
            <div className="glass-card p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {moduleConfig.map((mod) => {
                const active = activeModule === mod.key;
                return (
                  <button key={mod.key} onClick={() => setActiveModule(mod.key)}
                    className={`flex items-center gap-3 px-4 py-3 text-left font-body text-sm transition-all duration-300 whitespace-nowrap shrink-0 ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"}`}>
                    <mod.icon size={16} strokeWidth={1.5} />
                    <span className="hidden lg:inline">{mod.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeModule} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
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
