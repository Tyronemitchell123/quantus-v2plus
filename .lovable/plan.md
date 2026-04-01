

# Plan: Build Vendor Marketplace + Partner Portal Infrastructure

## What We Are Building

Two key pieces that will make the platform ready to onboard real vendors and display real deals:

1. **"Partner With Us" landing page** — a professional, public-facing page that sells vendors on listing their services. Includes a detailed application form stored in the database.

2. **Public Vendor Marketplace page** — a browsable directory (replacing the current fake-data Private Network) that pulls real vendor data from the database, displays trust badges (AOC Verified, ISO Certified), urgency indicators, and category filters.

3. **Footer + site-wide "Partner With Us" link** — adds visibility across the entire site.

4. **Remove all remaining hardcoded fake vendor data** from the Private Network page.

---

## Technical Details

### Step 1: Database — Add a `vendors` table

Create a new `vendors` table to store real vendor profiles separately from `contact_submissions`:

```sql
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  email text,
  phone text,
  website text,
  category text NOT NULL,
  description text,
  location text,
  specialties text[] DEFAULT '{}',
  credentials jsonb DEFAULT '{}',  -- { "aoc": true, "iso": "ISO 13485", etc. }
  tier text DEFAULT 'standard',     -- standard, verified, premium
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  logo_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Public read for active vendors (marketplace is public-facing)
CREATE POLICY "Anyone can view active vendors"
  ON public.vendors FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins manage vendors"
  ON public.vendors FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### Step 2: "Partner With Us" Page (`/partner-with-us`)

A new page with:
- **Value proposition section**: "List your services in front of qualified buyers. No upfront cost — pay only on results."
- **Benefits**: Global reach, verified badge program, deal matching, commission-based model
- **Application form**: Company name, contact name, email, phone, website, category (dropdown), description, credentials/certifications upload mention
- Submissions go to `contact_submissions` with classification `partner_application`
- Professional design matching the site's obsidian aesthetic

### Step 3: Public Vendor Marketplace (`/marketplace`)

Replace the hardcoded Private Network with a real data-driven page:
- Fetches from `vendors` table (public read for active vendors)
- Category filter tabs (Aviation, Medical, Staffing, Lifestyle, Logistics, Partnerships)
- Trust badges rendered from `credentials` JSONB: "AOC Verified" for aviation, "ISO Certified" for medical
- Search by name/company/specialty
- Each card shows: company, location, specialties, tier badge, verification status
- CTA buttons: "Request Quote"