# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

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

## Quantum Computing Integration (AWS Braket)

QUANTUS AI integrates with **AWS Braket** for real quantum circuit execution.

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

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
