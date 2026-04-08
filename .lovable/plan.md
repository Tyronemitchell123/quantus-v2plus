## Enhanced Signup & KYC Verification Plan

### Phase 1: Database — Extended Profiles & KYC Table
- **Extend `profiles` table** with: `phone`, `address_line1`, `address_line2`, `city`, `country`, `postcode`, `account_type` (client/vendor)
- **Create `kyc_verifications` table**: `user_id`, `document_type` (passport/drivers_license/national_id), `document_front_path`, `document_back_path`, `address_proof_path`, `status` (pending/verified/rejected), `reviewed_by`, `reviewed_at`, `notes`
- RLS: users can view/insert own KYC records; admins can view/update all

### Phase 2: Enhanced Signup Form
- Add **account type selector** (Client / Vendor) at the top of signup
- Collect: full name, email, password, phone, company, address (line1, line2, city, country, postcode)
- Vendor-specific fields: service category, brief description
- All validated with Zod schemas

### Phase 3: KYC Document Upload
- Post-signup KYC step (or accessible from Settings)
- Upload: government-issued ID (front + back) and proof of address (utility bill/bank statement)
- Files stored in private `kyc-documents` storage bucket
- Status badge on profile: Unverified → Pending → Verified

### Phase 4: Admin KYC Review
- Admin panel to list pending KYC submissions
- Approve/reject with notes
- Email notification sent to user on verification outcome

### Phase 5: Access Gating
- Verified users get priority deal processing
- High-value deals (>£50k) require KYC completion before proceeding
