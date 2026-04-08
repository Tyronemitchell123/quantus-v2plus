import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ParticleGrid from "@/components/ParticleGrid";
import { loginSchema, forgotPasswordSchema } from "@/lib/validation";
import useDocumentHead from "@/hooks/use-document-head";
import SignupForm, { type SignupFormData } from "@/components/auth/SignupForm";

const Auth = () => {
  useDocumentHead({
    title: "Sign In — Quantus V2+",
    description: "Sign in or create your Quantus V2+ account to access the ultra-premium intelligence platform.",
  });
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setMode("signup");
  }, [searchParams]);

  const redeemReferral = async (code: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await supabase.functions.invoke("redeem-referral", {
        body: { referralCode: code },
      });
      if (res.data?.success) {
        toast({ title: "Referral applied!", description: `You earned ${res.data.credits_awarded} bonus credits.` });
      }
    } catch {}
  };

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const { data: signUpData, error } = await signUp(data.email, data.password, data.fullName);
      if (error) throw error;

      // Use the user from signUp response (getUser() fails before email confirmation)
      const user = signUpData?.user;
      if (user) {
        // Store profile details to apply after email verification
        localStorage.setItem("pending_profile", JSON.stringify({
          userId: user.id,
          phone: data.phone || null,
          company: data.company || null,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2 || null,
          city: data.city,
          country: data.country,
          postcode: data.postcode,
          account_type: data.accountType,
          service_category: data.serviceCategory || null,
          service_description: data.serviceDescription || null,
        }));

        // Try immediate update (works if auto-confirm is on or session exists)
        await supabase.from("profiles").update({
          phone: data.phone || null,
          company: data.company || null,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2 || null,
          city: data.city,
          country: data.country,
          postcode: data.postcode,
          account_type: data.accountType,
          service_category: data.serviceCategory || null,
          service_description: data.serviceDescription || null,
        } as any).eq("user_id", user.id);
      }

      if (data.referralCode.trim()) localStorage.setItem("pending_referral_code", data.referralCode.trim());
      toast({ title: "Account created", description: "Check your email to verify your account." });
      setMode("login");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    if (mode === "forgot") {
      const validation = forgotPasswordSchema.safeParse({ email });
      if (!validation.success) {
        const errs: Record<string, string> = {};
        validation.error.errors.forEach((err) => { if (err.path[0]) errs[String(err.path[0])] = err.message; });
        setFieldErrors(errs);
        setLoading(false);
        return;
      }
      try {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({ title: "Check your email", description: "Password reset link sent." });
        setMode("login");
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
      return;
    }

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errs: Record<string, string> = {};
      validation.error.errors.forEach((err) => { if (err.path[0]) errs[String(err.path[0])] = err.message; });
      setFieldErrors(errs);
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();

      // Apply pending profile data from signup if it exists
      const pendingProfile = localStorage.getItem("pending_profile");
      if (pendingProfile && user) {
        try {
          const profileData = JSON.parse(pendingProfile);
          if (profileData.userId === user.id) {
            await supabase.from("profiles").update({
              phone: profileData.phone,
              company: profileData.company,
              address_line1: profileData.address_line1,
              address_line2: profileData.address_line2,
              city: profileData.city,
              country: profileData.country,
              postcode: profileData.postcode,
              account_type: profileData.account_type,
              service_category: profileData.service_category,
              service_description: profileData.service_description,
            } as any).eq("user_id", user.id);
            localStorage.removeItem("pending_profile");
          }
        } catch {}
      }

      const pendingCode = localStorage.getItem("pending_referral_code");
      if (pendingCode) {
        localStorage.removeItem("pending_referral_code");
        await redeemReferral(pendingCode);
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("user_id", user?.id ?? "")
        .maybeSingle();
      if (profile?.onboarding_completed_at) {
        localStorage.setItem("quantus_onboarding_done", "true");
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3.5 bg-transparent border border-gold-soft/30 rounded-xl text-foreground text-sm font-body placeholder:text-graphite/70 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_12px_-4px_hsl(var(--gold)/0.2)] transition-all duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(240 10% 6%) 100%)" }}>
      
      <div className="absolute inset-0 opacity-30 pointer-events-none"><ParticleGrid /></div>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, hsl(var(--background)) 100%)"
      }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full mx-6 relative z-10 ${mode === "signup" ? "max-w-[520px]" : "max-w-[460px]"}`}
      >
        <div className="border border-gold-soft/20 rounded-xl p-8 md:p-10"
          style={{ background: "hsl(var(--background) / 0.4)", backdropFilter: "blur(20px)" }}>
          
          <div className="text-center mb-10">
            <h1 className="font-display text-[34px] font-semibold tracking-wide">
              <span className="text-gold-gradient">Quantus V2+</span>
              <span className="text-foreground/60 ml-1.5 font-light italic text-2xl">A.I</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-10 h-px bg-primary/40 mx-auto mt-4"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display text-lg font-medium text-foreground text-center mb-1">
                {mode === "login" ? "Welcome Back" : mode === "signup" ? "Apply for Membership" : "Reset Password"}
              </h2>
              <p className="font-body text-xs text-muted-foreground text-center mb-8">
                {mode === "login" ? "Sign in to your private intelligence platform."
                  : mode === "signup" ? "Create your account with full profile details."
                  : "Enter your email to receive a reset link."}
              </p>

              {mode === "signup" ? (
                <SignupForm onSubmit={handleSignup} loading={loading} inputClass={inputClass} />
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" placeholder="Email address" value={email}
                      onChange={(e) => setEmail(e.target.value)} required
                      className={`${inputClass} ${fieldErrors.email ? "border-destructive" : ""}`} />
                    {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
                  </div>

                  {mode !== "forgot" && (
                    <div className="relative">
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="password" placeholder="Password" value={password}
                        onChange={(e) => setPassword(e.target.value)} required minLength={6}
                        className={`${inputClass} ${fieldErrors.password ? "border-destructive" : ""}`} />
                      {fieldErrors.password && <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>}
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="flex justify-between items-center">
                      <button type="button" onClick={() => setMode("forgot")}
                        className="font-body text-[13px] text-gold-soft hover:text-primary hover:underline transition-colors">
                        Forgot Password
                      </button>
                      <button type="button" onClick={() => setMode("signup")}
                        className="font-body text-[13px] text-gold-soft hover:text-primary hover:underline transition-colors">
                        Apply for Membership
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-body text-xs tracking-[0.25em] uppercase font-medium hover:brightness-110 transition-all duration-300 gold-glow flex items-center justify-center gap-2 disabled:opacity-50 h-12">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>{mode === "login" ? "Sign In" : "Send Reset Link"} <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>
              )}

              {mode !== "forgot" && mode !== "signup" && (
                <>
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gold-soft/20" />
                    <span className="font-body text-[10px] tracking-wider text-graphite/60 uppercase">or</span>
                    <div className="flex-1 h-px bg-gold-soft/20" />
                  </div>
                  <button onClick={handleGoogle}
                    className="w-full py-3 border border-gold-soft/20 rounded-xl text-foreground/70 font-body text-xs tracking-wider hover:border-primary/40 hover:text-foreground transition-all duration-300 mb-3">
                    Continue with Google
                  </button>
                  <button className="w-full py-3 border border-gold-soft/15 rounded-xl text-gold-soft/70 font-body text-xs tracking-wider hover:border-primary/30 hover:text-primary transition-all duration-300">
                    Continue with Private Link
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 text-center">
            {mode === "login" ? (
              <p className="font-body text-xs text-muted-foreground">
                No account?{" "}
                <button onClick={() => setMode("signup")} className="text-gold-soft hover:text-primary hover:underline transition-colors">Apply for Membership</button>
              </p>
            ) : (
              <p className="font-body text-xs text-muted-foreground">
                Already a member?{" "}
                <button onClick={() => setMode("login")} className="text-gold-soft hover:text-primary hover:underline transition-colors">Sign in</button>
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4 mr-2">
          <Link to="/partner" className="font-body text-[12px] tracking-wider text-gold-soft/50 hover:text-primary transition-colors">
            Partner Access →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
