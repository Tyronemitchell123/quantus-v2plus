import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, ArrowRight, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-6 relative"
      >
        {/* Card */}
        <div className="border border-primary/10 bg-card/50 backdrop-blur-sm p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="font-display text-2xl font-medium tracking-wide">
              <span className="text-gold-gradient">Quantus</span>
              <span className="text-foreground/60 ml-1.5 font-light italic">A.I</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
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
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email" placeholder="Email address" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password" placeholder="Password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                )}

                {mode === "signup" && (
                  <div className="relative">
                    <Gift size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text" placeholder="Referral code (optional)" value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())} maxLength={20}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex justify-between items-center">
                    <button type="button" onClick={() => setMode("forgot")}
                      className="font-body text-[11px] text-primary/70 hover:text-primary transition-colors">
                      Forgot Password
                    </button>
                    <span className="font-body text-[11px] text-muted-foreground/50">Partner Login →</span>
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 bg-primary text-primary-foreground font-body text-xs tracking-[0.25em] uppercase font-medium hover:bg-primary/90 transition-all duration-300 gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
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
                  <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px bg-border" />
                    <span className="font-body text-[10px] tracking-wider text-muted-foreground uppercase">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <button
                    onClick={handleGoogle}
                    className="w-full py-3 border border-border text-foreground/70 font-body text-xs tracking-wider hover:border-primary/30 hover:text-foreground transition-all duration-300"
                  >
                    Continue with Google
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 text-center">
            {mode === "login" ? (
              <p className="font-body text-xs text-muted-foreground">
                No account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline">Apply for Membership</button>
              </p>
            ) : (
              <p className="font-body text-xs text-muted-foreground">
                Already a member?{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button>
              </p>
            )}
          </div>
        </div>

        {/* Continue with Private Link */}
        <div className="text-center mt-6">
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40">
            Continue with Private Link
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
