import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordSchema } from "@/lib/validation";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    const validation = resetPasswordSchema.safeParse({ password });
    if (!validation.success) {
      setFieldError(validation.error.errors[0]?.message || "Invalid password");
      return;
    }
    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/auth");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 md:p-12 w-full max-w-md"
      >
        <h1 className="font-display text-2xl font-bold text-foreground text-center mb-6">Set New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {fieldError && <p className="text-xs text-destructive mt-1">{fieldError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Update Password <ArrowRight size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
