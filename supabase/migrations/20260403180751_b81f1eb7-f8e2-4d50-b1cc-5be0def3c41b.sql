
-- ══════════════════════════════════════════════════════
-- 1. SECURITY: Fix contact_submissions admin SELECT to use authenticated role
-- ══════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view all submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ══════════════════════════════════════════════════════
-- 2. PERFORMANCE: Add indexes on frequently queried columns
-- ══════════════════════════════════════════════════════

-- deals table (queried by status, user_id, priority in orchestrator + dashboard)
CREATE INDEX IF NOT EXISTS idx_deals_user_status ON public.deals (user_id, status);
CREATE INDEX IF NOT EXISTS idx_deals_status_priority ON public.deals (status, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_deals_category ON public.deals (category);

-- commission_logs (queried by deal, user, status)
CREATE INDEX IF NOT EXISTS idx_commission_logs_deal ON public.commission_logs (deal_id);
CREATE INDEX IF NOT EXISTS idx_commission_logs_user_status ON public.commission_logs (user_id, status);

-- invoices (queried by deal, user, status)
CREATE INDEX IF NOT EXISTS idx_invoices_deal ON public.invoices (deal_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices (user_id, status);

-- vendor_outreach (queried by deal, status in orchestrator)
CREATE INDEX IF NOT EXISTS idx_vendor_outreach_deal ON public.vendor_outreach (deal_id);
CREATE INDEX IF NOT EXISTS idx_vendor_outreach_deal_status ON public.vendor_outreach (deal_id, status);
CREATE INDEX IF NOT EXISTS idx_vendor_outreach_user ON public.vendor_outreach (user_id);

-- audit_logs (queried by user, sorted by created_at)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id, created_at DESC);

-- chat_messages (queried by deal_id)
CREATE INDEX IF NOT EXISTS idx_chat_messages_deal ON public.chat_messages (deal_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON public.chat_messages (user_id);

-- notifications (queried by user + read status)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, is_read);

-- marketing_posts (queried by status in orchestrator)
CREATE INDEX IF NOT EXISTS idx_marketing_posts_status ON public.marketing_posts (status);

-- sourcing_results (queried by deal_id)
CREATE INDEX IF NOT EXISTS idx_sourcing_results_deal ON public.sourcing_results (deal_id);

-- deal_documents (queried by deal_id)
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal ON public.deal_documents (deal_id);
