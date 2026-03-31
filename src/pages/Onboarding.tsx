import { useState, useEffect } from "react";
import useDocumentHead from "@/hooks/use-document-head";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { persistOnboarding } from "@/hooks/use-onboarding-persist";
import { useProgressiveProfile } from "@/hooks/use-progressive-profile";
import { useOnboardingAI } from "@/hooks/use-onboarding-ai";
import { useWelcomeSequence } from "@/hooks/use-welcome-sequence";
import ParticleGrid from "@/components/ParticleGrid";
import OnboardingWelcome from "@/components/onboarding/OnboardingWelcome";
import OnboardingRoles from "@/components/onboarding/OnboardingRoles";
import OnboardingPreferences from "@/components/onboarding/OnboardingPreferences";
import OnboardingModules from "@/components/onboarding/OnboardingModules";
import OnboardingMembership from "@/components/onboarding/OnboardingMembership";
import OnboardingVerification from "@/components/onboarding/OnboardingVerification";
import OnboardingComplete from "@/components/onboarding/OnboardingComplete";

const TOTAL_STEPS = 7;

const fadeVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const Onboarding = () => {
  useDocumentHead({ title: "Welcome to QUANTUS V2+ — Onboarding", description: "Complete your sovereign profile to unlock the full QUANTUS V2+ orchestration ecosystem." });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state: progressive, saveStepProgress, getResumeStep, clearProgress } = useProgressiveProfile(user?.id);
  const { recommendation, generateRecommendations } = useOnboardingAI();
  const { triggerWelcomeSequence } = useWelcomeSequence(user?.id);

  // Resume from last saved step
  const [step, setStep] = useState(() => {
    const resume = getResumeStep();
    return resume > 0 ? resume : 0;
  });

  // State from progressive profile
  const [selectedRole, setSelectedRole] = useState<string | null>(progressive.role);
  const [selectedPrefs, setSelectedPrefs] = useState<Record<string, string>>(progressive.preferences);
  const [selectedModules, setSelectedModules] = useState<string[]>(progressive.modules);
  const [selectedTier, setSelectedTier] = useState<string | null>(progressive.tier);
  const [aiLoading, setAiLoading] = useState(false);

  // Trigger AI recommendations when role + prefs are set (transitioning to step 3)
  useEffect(() => {
    if (step === 3 && selectedRole && Object.keys(selectedPrefs).length >= 4 && !recommendation.suggestedModules.length && !aiLoading) {
      setAiLoading(true);
      generateRecommendations(selectedRole, selectedPrefs).then((rec) => {
        if (rec?.suggestedModules?.length && selectedModules.length === 0) {
          setSelectedModules(rec.suggestedModules);
        }
        if (rec?.suggestedTier && !selectedTier) {
          setSelectedTier(rec.suggestedTier);
        }
        setAiLoading(false);
      });
    }
  }, [step]);

  const canContinue = () => {
    if (step === 0) return true;
    if (step === 1) return !!selectedRole;
    if (step === 2) return Object.keys(selectedPrefs).length >= 4;
    if (step === 3) return selectedModules.length > 0;
    if (step === 4) return !!selectedTier;
    if (step === 5) return true;
    return true;
  };

  const handleNext = async () => {
    // Save progress for the current step
    if (step === 1) await saveStepProgress(1, { role: selectedRole });
    if (step === 2) await saveStepProgress(2, { preferences: selectedPrefs });
    if (step === 3) await saveStepProgress(3, { modules: selectedModules });
    if (step === 4) await saveStepProgress(4, { tier: selectedTier });
    if (step === 5) await saveStepProgress(5, {});
    setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    if (user) {
      const { error } = await persistOnboarding(user.id, {
        role: selectedRole,
        preferences: selectedPrefs,
        modules: selectedModules,
        tier: selectedTier,
      });

      if (error) {
        console.error("Onboarding persist failed, retrying...", error);
        // Retry once
        const retry = await persistOnboarding(user.id, {
          role: selectedRole,
          preferences: selectedPrefs,
          modules: selectedModules,
          tier: selectedTier,
        });
        if (retry.error) {
          console.error("Onboarding persist retry failed:", retry.error);
          // Still navigate — don't leave user stuck
        }
      }

      // Trigger automated welcome sequence (fire and forget)
      triggerWelcomeSequence(user.email || "", user.user_metadata?.full_name).catch(() => {});

      clearProgress();
    }
    navigate("/dashboard", { replace: true });
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <ParticleGrid />
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, hsl(var(--background)) 100%)"
      }} />

      {/* Progress dots */}
      {step > 0 && step < 7 && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-3 z-50">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                i < step
                  ? "bg-primary"
                  : i === step
                    ? "bg-primary/50 ring-2 ring-primary/20"
                    : "border border-gold-soft/30 bg-transparent"
              }`}
            />
          ))}
        </div>
      )}

      {/* AI recommendation banner */}
      {step === 3 && recommendation.narrative && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl backdrop-blur-sm max-w-md"
        >
          <Sparkles size={14} className="text-primary shrink-0" />
          <p className="font-body text-[10px] tracking-wide text-primary/80">{recommendation.narrative}</p>
        </motion.div>
      )}

      <div className="w-full max-w-4xl mx-6 relative z-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="welcome" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6 }}>
              <OnboardingWelcome onContinue={() => setStep(1)} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="roles" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <OnboardingRoles selectedRole={selectedRole} onSelectRole={setSelectedRole} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="prefs" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <OnboardingPreferences selectedPrefs={selectedPrefs} onSelectPref={(key, val) => setSelectedPrefs(p => ({ ...p, [key]: val }))} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="modules" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <OnboardingModules selectedModules={selectedModules} onToggleModule={toggleModule} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="membership" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <OnboardingMembership selectedTier={selectedTier} onSelectTier={setSelectedTier} />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="verify" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5 }}>
              <OnboardingVerification user={user} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="complete" variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.7 }}>
              <OnboardingComplete onFinish={handleFinish} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step > 0 && step < 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between items-center mt-12"
          >
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <ArrowLeft size={14} strokeWidth={1.5} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canContinue() || aiLoading}
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-body text-xs tracking-[0.25em] uppercase transition-all duration-500 rounded-xl disabled:opacity-20 disabled:pointer-events-none hover:brightness-110 gold-glow"
            >
              {aiLoading ? (
                <>Personalising… <div className="w-3 h-3 border border-primary-foreground/50 border-t-primary-foreground rounded-full animate-spin" /></>
              ) : (
                <>Continue <ArrowRight size={14} strokeWidth={1.5} /></>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
