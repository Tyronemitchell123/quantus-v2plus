# Welcome to your Lovable project

## Project info

**URL**: Set your project URL in `VITE_LOVABLE_PROJECT_URL` (for example: `https://lovable.dev/projects/your-project-id`).

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Set `VITE_LOVABLE_PROJECT_URL` and visit that URL in your browser to start prompting in Lovable.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository.
git clone <repo-url> quantus-pulse

# Step 2: Navigate to the project directory.
cd quantus-pulse

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Supabase function tests

```sh
# Optional preflight validation for local environment/setup
npm run validate:dev-env

# Optional markdown report for PR comments/checklists
npm run report:validation

# One-shot completion helper (preflight + report + next-step prompts)
npm run quantus:complete

# Optional CI trigger helper (requires GitHub CLI auth)
npm run quantus:trigger-ci
# If GitHub CLI is unavailable, the helper prints manual GitHub Actions fallback steps.

# Deterministic unit tests (no external services)
npm run test:check-subscription

# Optional integration test (requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY)
npm run test:check-subscription:integration
```

### Testing fallback policy (when local Deno is unavailable)

1. **Unit validation in CI (required)**  
   Open a PR and rely on the `Supabase Function Tests` workflow to run unit tests.

2. **Integration validation in CI (optional but recommended before release)**  
   Trigger the same workflow via `workflow_dispatch` with `run_integration=true`.
   The unit-test workflow also uploads a `check-subscription-validation-report` artifact and publishes it in the job summary for PR evidence.

3. **Local preflight guidance**  
   `npm run test:check-subscription` and `npm run test:check-subscription:integration` will print a clear message if `deno` is missing from `PATH`.

4. **Restricted network/dependency environments**  
   If `npm install` cannot access private or restricted registries, rely on CI for authoritative test execution and attach CI run links in PR reviews.
   If scoped package authentication is required, copy `.npmrc.example` to `.npmrc` and set `NPM_TOKEN` before running `npm install`.
   You can also run `npm run install:deps` to automatically prepare `.npmrc`, attempt install, and try a reduced fallback install mode.
   For other package managers, run `node scripts/install-deps.mjs --manager=pnpm` (or `yarn` / `bun`).

## Quantum Computing Integration (AWS Braket)

QUANTUS V2+ integrates with **AWS Braket** for real quantum circuit execution.

### Setup

1. **Enable AWS Braket** in your AWS account (ensure Braket service is activated in your region).

2. **Add the following secrets** in your Lovable Cloud project settings:
   - `AWS_ACCESS_KEY_ID` — Your AWS IAM access key with Braket and S3 permissions
   - `AWS_SECRET_ACCESS_KEY` — The corresponding secret key
   - `AWS_REGION` — AWS region (e.g., `us-east-1`)

3. **IAM Permissions Required**:
   - `braket:CreateQuantumTask`
   - `braket:GetQuantumTask`
   - `braket:SearchQuantumTasks`
   - `s3:GetObject` (for reading job results)
   - `s3:PutObject` (Braket writes results to S3)

### Local Simulator Mode

If no AWS credentials are configured, the system runs a **built-in simulator** that produces statistically accurate results for common circuit patterns (Bell states, GHZ, uniform superposition). This is ideal for development and demo purposes.

### Devices

| Device | Type | Tier Required |
|--------|------|---------------|
| SV1 (State Vector) | Simulator | Free |
| TN1 (Tensor Network) | Simulator | Free |
| DM1 (Density Matrix) | Simulator | Free |
| IonQ Aria-1 | QPU | Starter+ |
| OQC Lucy | QPU | Starter+ |
| Rigetti Aspen-M-3 | QPU | Starter+ |

### Tier Limits

| Limit | Free | Starter | Professional |
|-------|------|---------|-------------|
| Devices | Simulator only | All | All |
| Max shots/job | 100 | 1,000 | 10,000 |
| Jobs/month | 10 | 50 | Unlimited |
| Total shots/month | 500 | 10,000 | Unlimited |

### Important Notes

- **QPU queue times** vary from minutes to hours depending on device availability.
- **Results are probabilistic** — running the same circuit multiple times will yield slightly different measurement distributions.
- **Cost controls** are enforced server-side. QPU runs may incur AWS charges on your account.
- The system includes **anomaly detection** that flags unusual spikes in quantum job submissions.

## How can I deploy this project?

Open your Lovable project URL (`VITE_LOVABLE_PROJECT_URL`) and click Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
