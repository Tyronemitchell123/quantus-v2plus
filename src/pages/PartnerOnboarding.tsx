import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Handshake, Building2, MapPin, Upload, FileCheck, DollarSign,
  CheckCircle2, ArrowRight, Shield,
} from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";

const steps = [
  { label: "Company", icon: Building2 },
  { label: "Compliance", icon: Shield },
  { label: "Commission", icon: DollarSign },
  { label: "Services", icon: FileCheck },
  { label: "Activation", icon: CheckCircle2 },
];

const categories = ["Aviation Broker", "Medical Clinic", "Staffing Agency", "Hotel / Villa", "Yacht Charter", "Logistics Provider", "Wellness Center"];
const regions = ["United Kingdom", "Europe", "Middle East", "Asia Pacific", "North America", "Africa", "Global"];

const PartnerOnboarding = () => {
  useDocumentHead({ title: "Partner Onboarding — Quantus V2+", description: "Join the Quantus V2+ partner ecosystem." });
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-12">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${i <= step ? "border-primary bg-primary/10" : "border-border"}`}>
              <s.icon size={12} className={i <= step ? "text-primary" : "text-muted-foreground"} />
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* Step 0 — Company Details */}
          {step === 0 && (
            <motion.div key="company" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <Handshake size={20} className="text-primary mx-auto mb-3" />
                <h2 className="font-display text-xl font-medium mb-2">Company Details</h2>
                <p className="font-body text-sm text-muted-foreground">Tell us about your organization.</p>
              </div>

              <div className="space-y-4">
                <input placeholder="Company Name" className="w-full bg-secondary/50 border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30" />
                <input placeholder="Contact Email" className="w-full bg-secondary/50 border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30" />

                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">Category</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(c => (
                      <button key={c} onClick={() => setSelectedCategory(c)}
                        className={`px-3 py-2 border text-left font-body text-xs transition-all ${selectedCategory === c ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/20"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">Regions Served</p>
                  <div className="flex flex-wrap gap-2">
                    {regions.map(r => (
                      <button key={r} onClick={() => setSelectedRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                        className={`px-3 py-1.5 border font-body text-xs transition-all ${selectedRegions.includes(r) ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/20"}`}>
                        <MapPin size={9} className="inline mr-1" />{r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={next} className="w-full py-3 bg-primary text-primary-foreground font-body text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors">
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 1 — Compliance */}
          {step === 1 && (
            <motion.div key="compliance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <Shield size={20} className="text-primary mx-auto mb-3" />
                <h2 className="font-display text-xl font-medium mb-2">Compliance & Verification</h2>
                <p className="font-body text-sm text-muted-foreground">Upload required certifications.</p>
              </div>

              <div className="space-y-3">
                {["Business Certifications", "Insurance Documentation", "Licenses & Permits"].map(doc => (
                  <div key={doc} className="glass-card p-4 flex items-center justify-between">
                    <p className="font-body text-xs text-foreground">{doc}</p>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary font-body text-[10px] hover:bg-primary/20 transition-colors">
                      <Upload size={10} /> Upload
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={next} className="w-full py-3 bg-primary text-primary-foreground font-body text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors">
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 2 — Commission Agreement */}
          {step === 2 && (
            <motion.div key="commission" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <DollarSign size={20} className="text-primary mx-auto mb-3" />
                <h2 className="font-display text-xl font-medium mb-2">Commission Agreement</h2>
                <p className="font-body text-sm text-muted-foreground">Review and accept partner terms.</p>
              </div>

              <div className="glass-card p-5 space-y-3">
                <p className="font-body text-xs text-foreground leading-relaxed">
                  By accepting this agreement, you agree to the Quantus V2+ Partner Commission Structure, including standard rates for your category, payment terms (Net 30), and performance-based incentives.
                </p>
                <div className="space-y-2">
                  {["Standard commission rates apply per category", "Payment processed within 30 days of deal completion", "Performance bonuses for top-tier partners", "Quarterly review and rate adjustment"].map(term => (
                    <div key={term} className="flex items-start gap-2">
                      <CheckCircle2 size={10} className="text-primary mt-0.5 shrink-0" />
                      <p className="font-body text-[11px] text-muted-foreground">{term}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={next} className="w-full py-3 bg-primary text-primary-foreground font-body text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors">
                Accept & Continue
              </button>
            </motion.div>
          )}

          {/* Step 3 — Service Catalog */}
          {step === 3 && (
            <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <FileCheck size={20} className="text-primary mx-auto mb-3" />
                <h2 className="font-display text-xl font-medium mb-2">Service Catalog</h2>
                <p className="font-body text-sm text-muted-foreground">Upload your rate sheets and service descriptions.</p>
              </div>

              <div className="space-y-3">
                {["Rate Sheet / Pricing", "Service Descriptions", "Portfolio / Case Studies"].map(doc => (
                  <div key={doc} className="glass-card p-4 flex items-center justify-between">
                    <p className="font-body text-xs text-foreground">{doc}</p>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary font-body text-[10px] hover:bg-primary/20 transition-colors">
                      <Upload size={10} /> Upload
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={next} className="w-full py-3 bg-primary text-primary-foreground font-body text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors">
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 4 — Activation */}
          {step === 4 && (
            <motion.div key="activation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} className="text-primary" />
              </div>

              <div>
                <h2 className="font-display text-xl font-medium mb-2">You are now an active Quantus V2+ Partner.</h2>
                <p className="font-body text-sm text-muted-foreground">Your profile has been created and your credentials verified.</p>
              </div>

              <div className="glass-card p-5 text-left">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">What happens next</p>
                <div className="space-y-2">
                  {[
                    "Your account is now active in the partner network",
                    "You will receive deal assignments based on your category and region",
                    "Performance tracking begins immediately",
                    "Commission payments processed on Net 30 terms",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight size={9} className="text-primary mt-0.5 shrink-0" />
                      <p className="font-body text-xs text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => navigate("/partner")} className="w-full py-3 bg-primary text-primary-foreground font-body text-xs tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors">
                Enter Partner Portal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnerOnboarding;
