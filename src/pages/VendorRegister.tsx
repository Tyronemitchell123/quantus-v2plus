import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Building2, Mail, Phone, MapPin, Briefcase, Loader2, CheckCircle2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useDocumentHead from "@/hooks/use-document-head";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "aviation", label: "Aviation" },
  { value: "medical", label: "Medical & Wellness" },
  { value: "staffing", label: "Staffing & Crew" },
  { value: "lifestyle", label: "Lifestyle & Estates" },
  { value: "logistics", label: "Logistics & Transport" },
  { value: "partnerships", label: "Partnerships & Brokerage" },
  { value: "marine", label: "Marine & Yachts" },
  { value: "legal", label: "Legal & Compliance" },
  { value: "finance", label: "Finance & Advisory" },
];

const VendorRegister = () => {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useDocumentHead({
    title: "Vendor Registration — QUANTUS",
    description: "Register as a verified service provider to receive deal opportunities and invoices.",
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Store as a contact submission for admin review
      const { error } = await supabase.from("contact_submissions").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        message: [
          `Vendor Registration Request`,
          `Category: ${form.category}`,
          `Phone: ${form.phone || "N/A"}`,
          `Address: ${form.address || "N/A"}`,
          `Description: ${form.description || "N/A"}`,
        ].join("\n"),
        classification: "vendor_registration",
        sentiment: "positive",
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-primary" size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">Registration Received</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Thank you, {form.name}. Our team will review your application and contact you at{" "}
            <span className="text-foreground">{form.email}</span> within 24–48 hours.
          </p>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={14} className="text-primary shrink-0" />
              <span>All vendor partnerships are subject to verification and compliance review.</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-primary" size={24} />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Vendor Registration</h1>
          <p className="text-sm text-muted-foreground">
            Register as a service provider to receive deal opportunities, invoices, and payment links.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus size={12} /> Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                  placeholder="e.g. James Whitfield"
                  required
                />
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={12} /> Company / Organisation
                </label>
                <Input
                  value={form.company}
                  onChange={e => handleChange("company", e.target.value)}
                  placeholder="e.g. Luxaviation UK"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={12} /> Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  placeholder="vendor@company.com"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={12} /> Phone Number
                </label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={e => handleChange("phone", e.target.value)}
                  placeholder="+44 7XXX XXXXXX"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={12} /> Business Address
                </label>
                <Input
                  value={form.address}
                  onChange={e => handleChange("address", e.target.value)}
                  placeholder="123 Aviation Way, London, UK"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={12} /> Service Category <span className="text-destructive">*</span>
                </label>
                <Select value={form.category} onValueChange={v => handleChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your service area" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Brief Description of Services
                </label>
                <textarea
                  value={form.description}
                  onChange={e => handleChange("description", e.target.value)}
                  placeholder="Describe your services, specialisations, and availability…"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Submit Registration
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <p className="text-[10px] text-muted-foreground">
            By registering, you agree to our verification process and{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield size={10} className="text-primary" />
            All data is encrypted and handled in accordance with GDPR.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorRegister;
