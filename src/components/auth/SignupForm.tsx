import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Phone, Building2, MapPin, Briefcase, ArrowRight, ArrowLeft, Gift } from "lucide-react";
import { z } from "zod";

const stepOneSchema = z.object({
  accountType: z.enum(["client", "vendor"]),
  fullName: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(128),
  referralCode: z.string().max(20).optional().or(z.literal("")),
});

const stepTwoSchema = z.object({
  phone: z.string().max(30).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  addressLine1: z.string().min(1, "Address is required").max(255),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  postcode: z.string().min(1, "Postcode is required").max(20),
  serviceCategory: z.string().optional().or(z.literal("")),
  serviceDescription: z.string().max(500).optional().or(z.literal("")),
});

export interface SignupFormData {
  accountType: "client" | "vendor";
  fullName: string;
  email: string;
  password: string;
  referralCode: string;
  phone: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  postcode: string;
  serviceCategory: string;
  serviceDescription: string;
}

const SERVICE_CATEGORIES = [
  "aviation", "medical", "staffing", "lifestyle", "logistics",
  "partnerships", "marine", "legal", "finance",
];

interface Props {
  onSubmit: (data: SignupFormData) => Promise<void>;
  loading: boolean;
  inputClass: string;
}

export default function SignupForm({ onSubmit, loading, inputClass }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SignupFormData>({
    accountType: "client", fullName: "", email: "", password: "", referralCode: "",
    phone: "", company: "", addressLine1: "", addressLine2: "",
    city: "", country: "", postcode: "", serviceCategory: "", serviceDescription: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof SignupFormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleNext = () => {
    const result = stepOneSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach(e => { if (e.path[0]) errs[String(e.path[0])] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = stepTwoSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach(e => { if (e.path[0]) errs[String(e.path[0])] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    await onSubmit(form);
  };

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={step} initial={{ opacity: 0, x: step === 1 ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
        {step === 1 ? (
          <div className="space-y-4">
            {/* Account Type */}
            <div className="flex gap-2">
              {(["client", "vendor"] as const).map(type => (
                <button key={type} type="button" onClick={() => set("accountType", type)}
                  className={`flex-1 py-3 rounded-xl border font-body text-xs tracking-wider uppercase transition-all duration-300 ${
                    form.accountType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gold-soft/20 text-muted-foreground hover:border-gold-soft/40"
                  }`}>
                  {type === "client" ? "Client" : "Vendor / Partner"}
                </button>
              ))}
            </div>

            <div className="relative">
              <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Full name" value={form.fullName}
                onChange={e => set("fullName", e.target.value)}
                className={`${inputClass} ${errors.fullName ? "border-destructive" : ""}`} />
              <ErrorMsg field="fullName" />
            </div>

            <div className="relative">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" placeholder="Email address" value={form.email}
                onChange={e => set("email", e.target.value)}
                className={`${inputClass} ${errors.email ? "border-destructive" : ""}`} />
              <ErrorMsg field="email" />
            </div>

            <div className="relative">
              <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="password" placeholder="Password (min 6 characters)" value={form.password}
                onChange={e => set("password", e.target.value)}
                className={`${inputClass} ${errors.password ? "border-destructive" : ""}`} />
              <ErrorMsg field="password" />
            </div>

            <div className="relative">
              <Gift size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Referral code (optional)" value={form.referralCode}
                onChange={e => set("referralCode", e.target.value.toUpperCase())} maxLength={20}
                className={inputClass} />
            </div>

            <button type="button" onClick={handleNext}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-body text-xs tracking-[0.25em] uppercase font-medium hover:brightness-110 transition-all duration-300 gold-glow flex items-center justify-center gap-2 h-12">
              Continue <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground text-center mb-2">
              Step 2 — Address & Details
            </p>

            <div className="relative">
              <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="tel" placeholder="Phone number" value={form.phone}
                onChange={e => set("phone", e.target.value)} className={inputClass} />
            </div>

            <div className="relative">
              <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Company / Organisation" value={form.company}
                onChange={e => set("company", e.target.value)} className={inputClass} />
            </div>

            <div className="relative">
              <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Address line 1 *" value={form.addressLine1}
                onChange={e => set("addressLine1", e.target.value)}
                className={`${inputClass} ${errors.addressLine1 ? "border-destructive" : ""}`} />
              <ErrorMsg field="addressLine1" />
            </div>

            <input type="text" placeholder="Address line 2 (optional)" value={form.addressLine2}
              onChange={e => set("addressLine2", e.target.value)} className={inputClass} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="text" placeholder="City *" value={form.city}
                  onChange={e => set("city", e.target.value)}
                  className={`${inputClass} ${errors.city ? "border-destructive" : ""}`} />
                <ErrorMsg field="city" />
              </div>
              <div>
                <input type="text" placeholder="Postcode *" value={form.postcode}
                  onChange={e => set("postcode", e.target.value)}
                  className={`${inputClass} ${errors.postcode ? "border-destructive" : ""}`} />
                <ErrorMsg field="postcode" />
              </div>
            </div>

            <input type="text" placeholder="Country *" value={form.country}
              onChange={e => set("country", e.target.value)}
              className={`${inputClass} ${errors.country ? "border-destructive" : ""}`} />
            <ErrorMsg field="country" />

            {form.accountType === "vendor" && (
              <>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select value={form.serviceCategory} onChange={e => set("serviceCategory", e.target.value)}
                    className={`${inputClass} pl-10 appearance-none`}>
                    <option value="">Service category</option>
                    {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <textarea placeholder="Brief description of services" value={form.serviceDescription}
                  onChange={e => set("serviceDescription", e.target.value)} rows={2}
                  className={`${inputClass} pl-4 resize-none`} />
              </>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setStep(1)}
                className="py-3.5 px-5 border border-gold-soft/20 rounded-xl font-body text-xs text-muted-foreground hover:border-gold-soft/40 transition-all">
                <ArrowLeft size={14} />
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-body text-xs tracking-[0.25em] uppercase font-medium hover:brightness-110 transition-all duration-300 gold-glow flex items-center justify-center gap-2 disabled:opacity-50 h-12">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
