import { useState, Suspense, lazy, useEffect } from "react";
import { motion } from "framer-motion";
import { Atom, Zap, Lock, Brain, Layers, ArrowRight, FlaskConical, BookOpen, Send } from "lucide-react";
import { quantumJobSchema } from "@/lib/validation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import useDocumentHead from "@/hooks/use-document-head";
import { useAuth } from "@/hooks/use-auth";
import UpsellBanner from "@/components/UpsellBanner";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { useSubscription } from "@/hooks/use-subscription";
import { useQuantumJobs } from "@/hooks/use-quantum-jobs";
import CircuitEditor from "@/components/quantum/CircuitEditor";
import DeviceSelector from "@/components/quantum/DeviceSelector";
import JobList from "@/components/quantum/JobList";
import ResultsView from "@/components/quantum/ResultsView";
import QuantumLimitsBanner from "@/components/quantum/QuantumLimitsBanner";
import QuantumProgressLCD from "@/components/quantum/QuantumProgressLCD";
import AICircuitGenerator from "@/components/quantum/AICircuitGenerator";
import LiveJobFeed from "@/components/quantum/LiveJobFeed";
import VisualCircuitEditor from "@/components/quantum/VisualCircuitEditor";
import CostOptimizer from "@/components/quantum/CostOptimizer";
import QuantumOrbit from "@/components/QuantumOrbit";
import QuantumVideoBackground from "@/components/QuantumVideoBackground";

const QubitVisualization = lazy(() => import("@/components/QubitVisualization"));

// Educational data
const algorithms = [
  { icon: Lock, name: "Shor's Algorithm", tagline: "Exponential Speedup for Factoring", desc: "Breaks RSA encryption by factoring large integers in polynomial time.", complexity: { classical: "O(e^(N^⅓))", quantum: "O((log N)³)" }, color: "quantum-cyan" },
  { icon: Brain, name: "Grover's Algorithm", tagline: "Quadratic Speedup for Search", desc: "Searches an unsorted database of N items in √N steps instead of N.", complexity: { classical: "O(N)", quantum: "O(√N)" }, color: "quantum-purple" },
  { icon: Zap, name: "VQE", tagline: "Hybrid Quantum-Classical Optimization", desc: "Finds ground-state energies of molecules for drug discovery and materials science.", complexity: { classical: "O(e^N)", quantum: "Polynomial" }, color: "quantum-cyan" },
  { icon: Layers, name: "QAOA", tagline: "Combinatorial Optimization", desc: "Tackles NP-hard problems like supply chain routing and portfolio optimization.", complexity: { classical: "NP-hard", quantum: "Approximate Poly" }, color: "quantum-purple" },
];

const concepts = [
  { title: "Superposition", desc: "A qubit exists in both |0⟩ and |1⟩ simultaneously until measured." },
  { title: "Entanglement", desc: "Correlated qubits share quantum state instantly regardless of distance." },
  { title: "Quantum Gates", desc: "Unitary operations manipulate qubits to build quantum circuits." },
  { title: "Decoherence", desc: "Quantum states are fragile. Error-correction protocols maintain coherence." },
];

export default function QuantumComputing() {
  useDocumentHead({
    title: "Quantum Computing Lab — QUANTUS V2+",
    description: "Submit real quantum circuits to AWS Braket, track jobs, and view measurement results. Explore Bloch sphere visualizations and algorithm explainers.",
    canonical: "https://quantus-loom.lovable.app/quantum",
  });

  const { user } = useAuth();
  const { tier: subTier } = useSubscription();
  const usage = useUsageTracking();
  const QuantumUpsell = () => {
    if (usage.loading || usage.percentage < 75) return null;
    return <UpsellBanner tier={subTier} usagePercent={usage.percentage} feature="AI queries" variant="compact" className="container mx-auto px-6 mb-4" />;
  };
  const { jobs, loading, limits, selectedJob, setSelectedJob, results, submitJob, fetchJobs, fetchResults, refreshJob } = useQuantumJobs();

  const [circuit, setCircuit] = useState("");
  const [deviceArn, setDeviceArn] = useState("arn:aws:braket:::device/quantum-simulator/amazon/sv1");
  const [shots, setShots] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [showQpuWarning, setShowQpuWarning] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);

  const tier = limits?.tier || "free";
  const maxShots = limits?.limits.maxShotsPerJob || 100;
  const isQpu = !deviceArn.includes("quantum-simulator");

  const handleSubmit = async () => {
    const validation = quantumJobSchema.safeParse({ circuit, shots, deviceArn });
    if (!validation.success) {
      return;
    }
    if (isQpu) {
      setShowQpuWarning(true);
      return;
    }
    await doSubmit();
  };

  const doSubmit = async () => {
    setShowQpuWarning(false);
    setSubmitting(true);
    try {
      const job = await submitJob(deviceArn, shots, circuit);
      if (job) {
        setSelectedJob(job);
        if (job.status === "completed") {
          setResultsLoading(true);
          await fetchResults(job.id);
          setResultsLoading(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch results when selecting a completed job
  useEffect(() => {
    if (selectedJob?.status === "completed") {
      setResultsLoading(true);
      fetchResults(selectedJob.id).finally(() => setResultsLoading(false));
    }
  }, [selectedJob?.id]);

  return (
    <div className="pt-24">
      {/* Hero */}
      <header className="py-16 relative overflow-hidden">
        <QuantumVideoBackground />
        <div className="absolute top-10 right-10 opacity-20 pointer-events-none">
          <QuantumOrbit size={200} />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Quantum Computing</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              The Science Behind <span className="text-quantum-cyan">QUANTUS</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Submit real quantum circuits, track job execution, and analyze measurement results — or explore interactive visualizations and algorithm explainers.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Upsell Banner */}
      <QuantumUpsell />

      {/* Tabs: Lab + Learn */}
      <div className="container mx-auto px-6 pb-24">
        <Tabs defaultValue={user ? "lab" : "learn"} className="space-y-8">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="lab" className="data-[state=active]:bg-quantum-cyan/10 data-[state=active]:text-quantum-cyan gap-2">
              <FlaskConical size={16} /> Quantum Lab
            </TabsTrigger>
            <TabsTrigger value="learn" className="data-[state=active]:bg-quantum-purple/10 data-[state=active]:text-quantum-purple gap-2">
              <BookOpen size={16} /> Learn
            </TabsTrigger>
          </TabsList>

          {/* ─── LAB TAB ─── */}
          <TabsContent value="lab" className="space-y-6">
            {!user ? (
              <div className="text-center py-16 space-y-4">
                <Atom size={48} className="mx-auto text-quantum-cyan opacity-50" />
                <h2 className="font-display text-2xl font-bold text-foreground">Sign in to Access the Quantum Lab</h2>
                <p className="text-muted-foreground max-w-md mx-auto">Submit circuits to quantum simulators and QPU devices. Free tier includes 10 simulator jobs/month.</p>
                <Button asChild><a href="/auth">Sign In</a></Button>
              </div>
            ) : (
              <>
                <QuantumLimitsBanner limits={limits} />

                <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                  {/* Left: Editor + Submit */}
                  <div className="space-y-6">
                    <AICircuitGenerator onGenerated={setCircuit} />
                    <VisualCircuitEditor onExport={setCircuit} />
                    <CircuitEditor value={circuit} onChange={setCircuit} />
                    <CostOptimizer onSelectDevice={(arn, s) => { setDeviceArn(arn); setShots(s); }} />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <DeviceSelector value={deviceArn} onChange={setDeviceArn} tier={tier} />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Shots</label>
                        <Input
                          type="number"
                          value={shots}
                          onChange={(e) => setShots(Math.min(Number(e.target.value) || 1, maxShots))}
                          min={1}
                          max={maxShots}
                          className="bg-secondary/50 border-border"
                          aria-label="Number of shots"
                        />
                        <p className="text-xs text-muted-foreground">Max {maxShots} on {tier} tier</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !circuit.trim()}
                      className="bg-quantum-cyan text-primary-foreground hover:bg-quantum-cyan/90 gap-2"
                    >
                      <Send size={16} />
                      {submitting ? "Submitting…" : "Submit Job"}
                    </Button>

                    {/* LCD Progress Display */}
                    <QuantumProgressLCD
                      jobStatus={selectedJob?.status ?? null}
                      submitting={submitting}
                    />

                    {/* Results */}
                    {selectedJob && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="quantum-card rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg font-semibold text-foreground">
                            Job {selectedJob.id.slice(0, 8)}…
                          </h3>
                          <Button variant="ghost" size="sm" onClick={() => refreshJob(selectedJob.id)}>Refresh</Button>
                        </div>
                        <ResultsView job={selectedJob} results={results} loading={resultsLoading} />
                      </motion.div>
                    )}
                  </div>

                  {/* Right: Job List + Live Feed */}
                  <div className="space-y-4 lg:sticky lg:top-24">
                    <div className="quantum-card rounded-xl p-4 h-fit">
                      <JobList jobs={jobs} loading={loading} onSelect={setSelectedJob} onRefresh={fetchJobs} />
                    </div>
                    <LiveJobFeed />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* ─── LEARN TAB ─── */}
          <TabsContent value="learn" className="space-y-16">
            {/* Bloch Sphere */}
            <section className="grid lg:grid-cols-2 gap-16 items-start" aria-label="Interactive Qubit Lab">
              <div>
                <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Interactive Lab</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Manipulate a <span className="text-quantum-cyan">Qubit</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  The Bloch sphere represents a single qubit's state. Use the sliders to explore.
                </p>
                <div className="space-y-4">
                  {concepts.map((c, i) => (
                    <motion.div key={c.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="quantum-card rounded-xl p-5">
                      <h3 className="font-display text-sm font-semibold text-quantum-cyan mb-1">{c.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="sticky top-24">
                <Suspense fallback={<div className="w-full aspect-square max-h-[450px] rounded-2xl border border-border bg-background/50 flex items-center justify-center"><Atom className="animate-quantum-orbit" size={20} /><span className="text-sm text-muted-foreground ml-2">Loading…</span></div>}>
                  <QubitVisualization />
                </Suspense>
              </div>
            </section>

            {/* Algorithms */}
            <section aria-label="Quantum Algorithms">
              <div className="text-center mb-16">
                <p className="text-quantum-cyan font-display text-sm tracking-[0.3em] uppercase mb-4">Algorithms</p>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">Quantum <span className="text-quantum-cyan">Advantage</span></h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {algorithms.map((algo, i) => (
                  <motion.div key={algo.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="quantum-card rounded-xl p-8 hover:quantum-glow transition-all duration-500">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${algo.color}/10 shrink-0`}>
                        <algo.icon className={`text-${algo.color}`} size={22} />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">{algo.name}</h3>
                        <p className={`text-xs font-medium text-${algo.color}`}>{algo.tagline}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{algo.desc}</p>
                    <div className="flex gap-4 text-xs">
                      <div className="flex-1 rounded-lg bg-secondary/50 p-3">
                        <span className="text-muted-foreground block mb-1">Classical</span>
                        <span className="font-mono text-foreground">{algo.complexity.classical}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground"><ArrowRight size={14} /></div>
                      <div className={`flex-1 rounded-lg bg-${algo.color}/10 p-3 border border-${algo.color}/20`}>
                        <span className={`text-${algo.color} block mb-1`}>Quantum</span>
                        <span className="font-mono text-foreground">{algo.complexity.quantum}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* QPU Warning Dialog */}
      <Dialog open={showQpuWarning} onOpenChange={setShowQpuWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit to QPU Device?</DialogTitle>
            <DialogDescription>
              QPU jobs may incur charges and have variable queue times (minutes to hours). Simulator devices are free and instant.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQpuWarning(false)}>Cancel</Button>
            <Button onClick={doSubmit} className="bg-quantum-cyan text-primary-foreground">Confirm & Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
