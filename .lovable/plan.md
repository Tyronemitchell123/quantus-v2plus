

## Plan: Real Quantum Provider Integration (AWS Braket)

This is a large feature. Since this project runs on Lovable Cloud (Supabase Edge Functions, not Express/Node.js), the "backend" will be implemented as Supabase Edge Functions, not an Express server. The frontend is React (not vanilla JS). The plan adapts the requirements to the actual stack.

---

### Architecture Overview

```text
Frontend (React)                Edge Functions (Deno)           AWS Braket
─────────────────              ─────────────────────           ──────────
/quantum page         ──►      quantum-jobs (CRUD)      ──►   CreateQuantumTask
  - Circuit editor             - submit, list, get,            GetQuantumTask
  - Job list                     results                       GetDevice
  - Results histogram          - tier/limit enforcement
  - Device selector            - usage tracking
```

---

### Phase 1: Database Tables

**Table: `quantum_jobs`**
- id, user_id, provider, provider_job_id, device_arn, shots, circuit_format, circuit_text, status (queued/running/completed/failed/cancelled), created_at, updated_at, completed_at, error_message, cost_estimate_usd

**Table: `quantum_job_results`**
- id, quantum_job_id (FK), result_counts_json (jsonb), raw_result_json (jsonb), created_at

RLS: Users can only read/create their own jobs and results. No cross-user access.

---

### Phase 2: Edge Function — `quantum-jobs`

Single edge function handling all quantum job operations via query param `action`:

- **submit**: Validate inputs (OpenQASM text, device ARN, shots). Check tier limits (free = simulator only, max 100 shots; starter = 1000 shots, 50 jobs/month; pro = unlimited). Call AWS Braket `CreateQuantumTask` API. Store job record. Track usage.
- **list**: Return user's jobs with pagination and status/date filters.
- **get**: Return single job. If status is queued/running, poll AWS Braket for updated status.
- **results**: Fetch results from AWS Braket S3 output when completed. Cache in `quantum_job_results`.

AWS credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` as secrets (need to be added).

AWS Braket API will be called via direct HTTP (REST API signing with AWS Signature V4) since there's no Deno SDK.

---

### Phase 3: Frontend — `/quantum` Page Rebuild

Replace the current educational `/quantum` page content with a functional quantum computing lab:

1. **Device Selector** — Dropdown with simulator devices (default: `arn:aws:braket:::device/quantum-simulator/amazon/sv1`) and QPU devices (labeled as paid-tier with queue warnings).

2. **Circuit Editor** — Textarea for OpenQASM with 3 template buttons: Bell State, GHZ (3-qubit), Random Bitstring.

3. **Submit Controls** — Shots input (enforced per tier), submit button. Confirmation modal for QPU runs showing cost/queue warning. Blocked with upgrade link if at limit.

4. **Job List** — Table showing user's jobs: status pill, device, shots, created time. Click to expand details.

5. **Results View** — Bar chart histogram of measurement counts + normalized probabilities table. Uses Recharts (already in project).

6. **Limits Banner** — Show current quantum job usage vs. tier limits. Link to /pricing when near/over.

Keep the existing Bloch sphere visualization and algorithm explainers as a secondary tab or section below the lab.

---

### Phase 4: Tier Limits & Cost Controls

| Limit | Free | Starter | Professional |
|-------|------|---------|-------------|
| Devices | Simulator only | Simulator + QPU | All devices |
| Max shots/job | 100 | 1,000 | 10,000 |
| Jobs/month | 10 | 50 | Unlimited |
| Total shots/month | 500 | 10,000 | Unlimited |

Enforced server-side in the edge function. Frontend shows limits and blocks submissions with clear messaging.

---

### Phase 5: Anomaly Detection Integration

Add quantum job spike detection rule to the existing `anomaly-detection` edge function — flag users submitting >2x their daily average quantum jobs.

---

### Phase 6: AWS Secrets Setup

Require user to add three secrets via the secrets tool:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

The edge function will use AWS Signature V4 to authenticate Braket API calls directly (no SDK needed in Deno).

---

### Phase 7: Documentation

Update README with:
- How to enable AWS Braket (add secrets, enable in AWS console)
- Required env vars
- Simulator vs QPU device notes
- Cost controls and tier limits

---

### Technical Details

- **AWS Braket REST API**: Direct HTTP calls with SigV4 signing implemented in the edge function. Endpoints: `braket.{region}.amazonaws.com` for CreateQuantumTask, GetQuantumTask. S3 for result retrieval.
- **No Express server**: All backend logic in Supabase Edge Functions (Deno runtime).
- **Circuit validation**: Basic OpenQASM syntax check (header present, valid structure) before submission.
- **Status polling**: When user fetches a job that's queued/running, the edge function polls Braket and updates the DB record.
- **Result caching**: Once fetched from S3, results are stored in `quantum_job_results` so subsequent loads are instant.

---

### Files to Create/Edit

| File | Action |
|------|--------|
| Migration SQL | Create `quantum_jobs` and `quantum_job_results` tables with RLS |
| `supabase/functions/quantum-jobs/index.ts` | New edge function (submit, list, get, results) |
| `supabase/config.toml` | Register new function |
| `src/pages/QuantumComputing.tsx` | Rebuild with lab UI + keep educational content |
| `src/hooks/use-quantum-jobs.ts` | New hook for quantum job CRUD |
| `src/components/quantum/CircuitEditor.tsx` | OpenQASM editor with templates |
| `src/components/quantum/DeviceSelector.tsx` | Device picker with tier gating |
| `src/components/quantum/JobList.tsx` | Job table with status pills |
| `src/components/quantum/ResultsView.tsx` | Histogram + probabilities |
| `src/components/quantum/QuantumLimitsBanner.tsx` | Usage limits display |
| `supabase/functions/anomaly-detection/index.ts` | Add quantum job spike rule |
| `README.md` | Add quantum setup docs |

