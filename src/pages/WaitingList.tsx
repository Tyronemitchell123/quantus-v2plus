import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Mail, Building2, Briefcase, Send, CheckCircle2, Shield } from "lucide-react";
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

const WaitingList = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    category: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useDocumentHead({
    title: "Join the Waiting List — QUANTUS",
    description: "Be among the first to access the Quantus V2+ ultra-premium intelligence platform. Register your interest today.",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please provide your name and email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        message: [
          "Waiting List Registration",
          form.category ? `Interest Area: ${form.category}` : "",
          form.message ? `Message: ${form.message}` : "",
        ].filter(Boolean).join("\n"),
        classification: "waiting_list",
        sentiment: "positive",
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
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
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">You're on the list</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Thank you, {form.name}. We'll notify you at{" "}
            <span className="text-foreground">{form.email}</span> as soon as early access opens.
          </p>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={14} className="text-primary shrink-0" />
              <span>Your information is encrypted and will never be shared with third parties.</span>
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
            <Clock className="text-primary" size={24} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-primary font-medium">Early Access</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Join the Waiting List</h1>
          <p className="text-sm text-muted-foreground">
            Quantus V2+ is launching soon. Register your interest to be among the first to access our ultra-premium intelligence platform.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. James Whitfield"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={12} /> Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={12} /> Company / Organisation
                </label>
                <Input
                  value={form.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="e.g. Meridian Capital"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={12} /> Area of Interest
                </label>
                <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Message (optional)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Tell us what you're looking for…"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                ) : (
                  <Send size={14} />
                )}
                Join Waiting List
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <p className="text-[10px] text-muted-foreground">
            By registering, you agree to our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield size={10} className="text-primary" />
            All data encrypted and handled in accordance with GDPR.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingList;
