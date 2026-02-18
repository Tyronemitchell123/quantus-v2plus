import { useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAIAnalytics } from "@/hooks/use-ai-analytics";

type ServiceRec = {
  recommendations: { title: string; reason: string; matchScore: number; estimatedROI: string }[];
  profileSummary: string;
};

const AIRecommendations = () => {
  const { data, loading, analyze } = useAIAnalytics<ServiceRec>();

  useEffect(() => {
    analyze("recommend-services");
  }, []);

  if (loading || !data) return null;

  return (
    <section className="py-24 border-t border-border relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Brain size={14} className="text-primary" />
            <span className="text-xs text-primary font-semibold tracking-wider uppercase">AI Recommendations</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Personalized for <span className="text-gold-gradient">You</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto">{data.profileSummary}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {data.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className="glass-card rounded-xl p-7 group hover:gold-glow transition-all duration-500 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-primary" />
                <span className="text-[10px] font-semibold text-primary tracking-wider uppercase">
                  {rec.matchScore}% Match
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{rec.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{rec.reason}</p>
              <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-emerald font-semibold">Est. ROI: {rec.estimatedROI}</span>
                <Link to="/services" className="text-primary text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIRecommendations;
