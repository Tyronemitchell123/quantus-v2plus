import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { partnerSchema } from "@/lib/validation";

const categories = ["Aviation", "Medical", "Staffing", "Hospitality", "Logistics"];

const PartnerEcosystem = () => {
  const [form, setForm] = useState({ name: "", company: "", category: "", region: "" });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const validation = partnerSchema.safeParse(form);
    if (!validation.success) {
      const errs: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errs[String(err.path[0])] = err.message;
      });
      setFieldErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: form.name,
      email: `${form.company.toLowerCase().replace(/\s/g, "")}@partner.quantus`,
      message: `Partner application — Category: ${form.category}, Region: ${form.region}`,
      company: form.company,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Submission failed. Please try again.");
    } else {
      toast.success("Application received. We will be in touch.");
      setForm({ name: "", company: "", category: "", region: "" });
    }
  };

  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-6">Partners</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground leading-tight mb-6">
              A global network of
              <br />
              <span className="italic text-primary">elite operators.</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Aviation. Medical. Staffing. Hospitality. Logistics.
            </p>
            <div className="space-y-3">
              {["Qualified UHNW client introductions", "Automated communication pipeline", "Commission tracking & analytics", "Performance scoring dashboard"].map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-primary/60" />
                  <span className="font-body text-sm text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
              <h3 className="font-display text-lg font-medium text-foreground mb-2">Become a Quantus V2+ Partner</h3>

              <input
                type="text" placeholder="Name *" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full bg-background border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors ${fieldErrors.name ? "border-destructive" : "border-border"}`}
              />
              {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
              <input
                type="text" placeholder="Company *" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className={`w-full bg-background border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors ${fieldErrors.company ? "border-destructive" : "border-border"}`}
              />
              {fieldErrors.company && <p className="text-xs text-destructive mt-1">{fieldErrors.company}</p>}
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`w-full bg-background border px-4 py-3 font-body text-sm text-foreground focus:border-primary/40 focus:outline-none transition-colors ${fieldErrors.category ? "border-destructive" : "border-border"}`}
              >
                <option value="">Category *</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {fieldErrors.category && <p className="text-xs text-destructive mt-1">{fieldErrors.category}</p>}
              <input
                type="text" placeholder="Region" value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors"
              />

              <button
                type="submit" disabled={submitting}
                className="w-full py-3 font-body text-xs tracking-[0.25em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnerEcosystem;
