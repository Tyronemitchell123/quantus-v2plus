import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

export interface QuantumJob {
  id: string;
  user_id: string;
  provider: string;
  provider_job_id: string | null;
  device_arn: string;
  shots: number;
  circuit_format: string;
  circuit_text: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  error_message: string | null;
  cost_estimate_usd: number | null;
}

export interface QuantumJobResult {
  id: string;
  quantum_job_id: string;
  result_counts_json: Record<string, number>;
  raw_result_json: unknown;
  created_at: string;
}

export interface QuantumLimits {
  tier: string;
  limits: {
    devices: string;
    maxShotsPerJob: number;
    jobsPerMonth: number;
    totalShotsPerMonth: number;
  };
  usage: {
    jobsThisMonth: number;
    totalShotsThisMonth: number;
  };
}

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const BASE = `https://${PROJECT_ID}.supabase.co/functions/v1/quantum-jobs`;

async function callEdge(action: string, params: Record<string, string> = {}, body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const qs = new URLSearchParams({ action, ...params }).toString();
  const resp = await fetch(`${BASE}?${qs}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function useQuantumJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<QuantumJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [limits, setLimits] = useState<QuantumLimits | null>(null);
  const [selectedJob, setSelectedJob] = useState<QuantumJob | null>(null);
  const [results, setResults] = useState<QuantumJobResult | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await callEdge("list");
      setJobs(data.jobs || []);
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchLimits = useCallback(async () => {
    if (!user) return;
    try {
      const data = await callEdge("limits");
      setLimits(data);
    } catch (e) {
      console.error("Failed to fetch limits:", e);
    }
  }, [user]);

  const submitJob = useCallback(async (deviceArn: string, shots: number, circuitText: string) => {
    try {
      const data = await callEdge("submit", {}, { deviceArn, shots, circuitText });
      toast({ title: "Job submitted", description: `Status: ${data.job.status}` });
      await fetchJobs();
      await fetchLimits();
      return data.job as QuantumJob;
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
      throw e;
    }
  }, [fetchJobs, fetchLimits]);

  const fetchResults = useCallback(async (jobId: string) => {
    try {
      const data = await callEdge("results", { id: jobId });
      setResults(data.results);
      return data.results as QuantumJobResult;
    } catch (e: any) {
      if (!e.message.includes("not completed")) {
        toast({ title: "Failed to fetch results", description: e.message, variant: "destructive" });
      }
      return null;
    }
  }, []);

  const refreshJob = useCallback(async (jobId: string) => {
    try {
      const data = await callEdge("get", { id: jobId });
      setSelectedJob(data.job);
      // Update in list
      setJobs(prev => prev.map(j => j.id === jobId ? data.job : j));
      return data.job as QuantumJob;
    } catch (e) {
      console.error("Failed to refresh job:", e);
      return null;
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchLimits();
    }
  }, [user, fetchJobs, fetchLimits]);

  return {
    jobs,
    loading,
    limits,
    selectedJob,
    setSelectedJob,
    results,
    submitJob,
    fetchJobs,
    fetchLimits,
    fetchResults,
    refreshJob,
  };
}
