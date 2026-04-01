import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useDocumentHead from "@/hooks/use-document-head";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Globe, Shield, Zap, TrendingUp, CheckCircle2, ArrowRight,
  Plane, Stethoscope, Users, Sparkles, Truck, Handshake
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const partnerSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required").max(100),
  company: z.string().trim().min(1, "Company name is required").max(200),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30).optional(),
  website: z.string().trim().max(500).optional(),
  category: z.string().min(1, "Please select a category"),
  message: z.string().trim().min(10, "Tell us about your services (min 10 chars)").max(2000),
});

type PartnerForm = z.infer<typeof partnerSchema>;

const benefits = [
  { icon: Globe, title: "Global Reach", desc: "Access qualified buyers across Aviation, Medical, Lifestyle, and Staffing verticals worldwide." },
  { icon: Shield, title: "Verified Badge Program", desc: "Earn AOC Verified, ISO Certified, or Premium Partner badges to build trust with buyers." },
  { icon: Zap, title: "AI-Powered Deal Matching", desc: "Our engine automatically matches your services to active buyer requests in real time." },
  { icon: TrendingUp, title: "Commission-Based Model", desc: "No upfront fees. You only pay a success fee when a deal closes — fully aligned incentives." },
];

const categories = [
  { value: "aviation", label: "Aviation", icon: Plane },
  { value: "medical", label: "Medical & Healthcare", icon: Stethoscope },
  { value: "staffing", label: "Staffing & Recruitment", icon: Users },
  { value: "lifestyle", label: "Lifestyle & Luxury", icon: Sparkles },
  { value: "logistics", label: "Logistics & Transport", icon: Truck },
  { value: "partnerships", label: "Partnerships & Advisory", icon: Handshake },
];

const PartnerWithUs = () => {
  useDocumentHead({
    title: "Partner With Us — Quantus V2+",
    description: "List your services on Quantus. No upfront cost — pay only on results. Join our verified vendor marketplace.",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<PartnerForm>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { name: "", company: "", email: "", phone: "", website: "", category: "", message: "" },
  });

  const onSubmit = async (data: PartnerForm) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: data.name,
        email: data.email,
        company: data.company,
        message: `[Partner Application]\nCategory: ${data.category}\nPhone: ${data.phone || "N/A"}\nWebsite: ${data.website || "N/A"}\n\n${data.message}`,
        classification: "partner_application",
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Application received", description: "We'll review your submission and be in touch within 48 hours." });
    } catch {
      toast({ title: "Submission failed", description: "Please try again or email us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-primary mb-4">Vendor Partnership Programme</p>
            <h1 className="text-4xl md:text-5xl font-display tracking-tight text-foreground mb-6">
              List Your Services. Reach Global Buyers.
            </h1>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto mb-8">
              No upfront cost — pay only on results. Join a curated marketplace trusted by
              discerning buyers in aviation, healthcare, staffing, and luxury lifestyle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-center font-body text-[10px] tracking-[0.3em] uppercase text-primary mb-10">Why Partner With Quantus</p>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full hover:border-primary/20 transition-colors">
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <b.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-body text-foreground mb-1">{b.title}</h3>
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">{b.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-border bg-secondary/30">
        <div className="container mx-auto px-6 max-w-3xl">
          <p className="text-center font-body text-[10px] tracking-[0.3em] uppercase text-primary mb-10">How It Works</p>
          <div className="space-y-6">
            {[
              { step: "01", title: "Apply", desc: "Submit your company details and service categories via the form below." },
              { step: "02", title: "Verification", desc: "Our team reviews credentials (AOC, ISO, licenses) and activates your profile." },
              { step: "03", title: "Get Matched", desc: "Our AI matches your services to live buyer requests across global markets." },
              { step: "04", title: "Earn Commission", desc: "Close deals and earn — you only pay a success fee when revenue is generated." },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex gap-4 items-start">
                <span className="text-2xl font-display text-primary/30">{s.step}</span>
                <div>
                  <h4 className="text-sm font-body text-foreground">{s.title}</h4>
                  <p className="text-xs text-muted-foreground font-body">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 border-t border-border" id="apply">
        <div className="container mx-auto px-6 max-w-2xl">
          <p className="text-center font-body text-[10px] tracking-[0.3em] uppercase text-primary mb-3">Apply Now</p>
          <h2 className="text-2xl font-display text-center text-foreground mb-8">Partner Application</h2>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-display text-foreground mb-2">Application Received</h3>
              <p className="text-sm text-muted-foreground font-body">
                Thank you for your interest. Our partnerships team will review your submission and respond within 48 business hours.
              </p>
            </motion.div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-body">Contact Name *</FormLabel>
                      <FormControl><Input {...field} placeholder="James Whitfield" className="font-body text-sm" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-body">Company Name *</FormLabel>
                      <FormControl><Input {...field} placeholder="Meridian Executive Aviation" className="font-body text-sm" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-body">Business Email *</FormLabel>
                      <FormControl><Input type="email" {...field} placeholder="partnerships@company.com" className="font-body text-sm" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-body">Phone</FormLabel>
                      <FormControl><Input type="tel" {...field} placeholder="+44 20 7946 0958" className="font-body text-sm" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-body">Website</FormLabel>
                      <FormControl><Input {...field} placeholder="https://company.com" className="font-body text-sm" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-body">Service Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-body text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.value} value={c.value} className="font-body text-sm">{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-body">Tell Us About Your Services *</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="Describe your services, specialties, certifications (AOC, ISO, etc.), and the regions you operate in." className="font-body text-sm resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={submitting} className="w-full font-body text-xs tracking-wider uppercase">
                  {submitting ? "Submitting…" : "Submit Partner Application"}
                  {!submitting && <ArrowRight size={14} className="ml-2" />}
                </Button>
                <p className="text-[10px] text-muted-foreground/50 text-center font-body">
                  By submitting, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </Form>
          )}
        </div>
      </section>
    </div>
  );
};

export default PartnerWithUs;
