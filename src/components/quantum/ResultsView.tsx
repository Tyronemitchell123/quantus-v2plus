import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { QuantumJobResult, QuantumJob } from "@/hooks/use-quantum-jobs";

interface ResultsViewProps {
  job: QuantumJob;
  results: QuantumJobResult | null;
  loading?: boolean;
}

export default function ResultsView({ job, results, loading }: ResultsViewProps) {
  const chartData = useMemo(() => {
    if (!results?.result_counts_json) return [];
    const counts = results.result_counts_json;
    const total = Object.values(counts).reduce((s, v) => s + v, 0);
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([state, count]) => ({
        state: `|${state}⟩`,
        count,
        probability: total > 0 ? (count / total) : 0,
      }));
  }, [results]);

  if (job.status === "failed") {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-sm text-destructive font-medium">Job Failed</p>
        <p className="text-xs text-muted-foreground mt-1">{job.error_message || "Unknown error"}</p>
      </div>
    );
  }

  if (job.status !== "completed") {
    return (
      <div className="p-4 rounded-lg bg-quantum-cyan/5 border border-quantum-cyan/20 text-center">
        <p className="text-sm text-quantum-cyan">Job is {job.status}…</p>
        <p className="text-xs text-muted-foreground mt-1">Results will appear when the job completes.</p>
      </div>
    );
  }

  if (loading || !results) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">Loading results…</div>
    );
  }

  const total = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Measurement Histogram</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="state" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                }}
                formatter={(value: number) => [value, "Counts"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "hsl(var(--quantum-cyan))" : "hsl(var(--quantum-purple))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">Probabilities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {chartData.map((d) => (
            <div key={d.state} className="p-2 rounded-lg bg-secondary/50 border border-border text-center">
              <p className="font-mono text-xs text-quantum-cyan">{d.state}</p>
              <p className="text-sm font-semibold text-foreground">{(d.probability * 100).toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">{d.count}/{total}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
