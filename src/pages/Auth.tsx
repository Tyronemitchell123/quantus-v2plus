import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, ArrowRight, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ParticleGrid from "@/components/ParticleGrid";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import ParticleGrid from "@/components/ParticleGrid";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useState(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({ title: "Check your email", description: "Password reset link sent." });
        setMode("login");
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email to verify your account." });
        if (referralCode.trim()) localStorage.setItem("pending_referral_code", referralCode.trim());
        setMode("login");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        const pendingCode = localStorage.getItem("pending_referral_code");
        if (pendingCode) {
          localStorage.removeItem("pending_referral_code");
          await redeemReferral(pendingCode);
        }
        navigate("/onboarding");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (referralCode.trim()) localStorage.setItem("pending_referral_code", referralCode.trim());
    const { error } = await signInWithGoogle();
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3.5 bg-transparent border border-gold-soft/30 rounded-xl text-foreground text-sm font-body placeholder:text-graphite/70 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_12px_-4px_hsl(var(--gold)/0.2)] transition-all duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(240 10% 6%) 100%)" }}>
      
      {/* Particle fog */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <ParticleGrid />
      </div>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, hsl(var(--background)) 100%)"
      }} />

      {/* Ambient gold glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] mx-6 relative z-10"
      >
        {/* Glass-Obsidian Card */}
        <div className="border border-gold-soft/20 rounded-xl p-8 md:p-10"
          style={{ background: "hsl(var(--background) / 0.4)", backdropFilter: "blur(20px)" }}>
          
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="font-display text-[34px] font-semibold tracking-wide">
              <span className="text-gold-gradient">Quantus</span>
              <span className="text-foreground/60 ml-1.5 font-light italic text-2xl">A.I</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-10 h-px bg-primary/40 mx-auto mt-4"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-lg font-medium text-foreground text-center mb-1">
                {mode === "login" ? "Welcome Back" : mode === "signup" ? "Apply for Membership" : "Reset Password"}
              </h2>
              <p className="font-body text-xs text-muted-foreground text-center mb-8">
                {mode === "login"
                  ? "Sign in to your private intelligence platform."
                  : mode === "signup"
                    ? "Create your account to enter the ecosystem."
                    : "Enter your email to receive a reset link."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text" placeholder="Full name" value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email" placeholder="Email address" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className={inputClass}
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password" placeholder="Password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required minLength={6}
                      className={inputClass}
                    />
                  </div>
                )}

                {mode === "signup" && (
                  <div className="relative">
                    <Gift size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text" placeholder="Referral code (optional)" value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())} maxLength={20}
                      className={inputClass}
                    />
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

                {/* Primary CTA */}
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-body text-xs tracking-[0.25em] uppercase font-medium hover:brightness-110 transition-all duration-300 gold-glow flex items-center justify-center gap-2 disabled:opacity-50 h-12"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {mode !== "forgot" && (
                <>
                  {/* OR divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gold-soft/20" />
                    <span className="font-body text-[10px] tracking-wider text-graphite/60 uppercase">or</span>
                    <div className="flex-1 h-px bg-gold-soft/20" />
                  </div>

                  {/* Google */}
                  <button
                    onClick={handleGoogle}
                    className="w-full py-3 border border-gold-soft/20 rounded-xl text-foreground/70 font-body text-xs tracking-wider hover:border-primary/40 hover:text-foreground transition-all duration-300 mb-3"
                  >
                    Continue with Google
                  </button>

                  {/* Private Link */}
                  <button
                    className="w-full py-3 border border-gold-soft/15 rounded-xl text-gold-soft/70 font-body text-xs tracking-wider hover:border-primary/30 hover:text-primary transition-all duration-300"
                  >
                    Continue with Private Link
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom toggle */}
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

        {/* Partner Access */}
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
