
-- Workflow tasks table for Phase 5
CREATE TABLE public.workflow_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  phase TEXT NOT NULL DEFAULT 'scheduling',
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 50,
  assigned_to TEXT,
  due_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  dependencies JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  risk_level TEXT DEFAULT 'low',
  risk_notes TEXT,
  vendor_outreach_id UUID REFERENCES public.vendor_outreach(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow tasks"
  ON public.workflow_tasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow tasks"
  ON public.workflow_tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow tasks"
  ON public.workflow_tasks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all workflow tasks"
  ON public.workflow_tasks FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Workflow communications log
CREATE TABLE public.workflow_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_task_id UUID NOT NULL REFERENCES public.workflow_tasks(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound',
  recipient TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  body TEXT NOT NULL,
  tone TEXT DEFAULT 'luxury',
  ai_generated BOOLEAN DEFAULT true,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow comms"
  ON public.workflow_communications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow comms"
  ON public.workflow_communications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER workflow_tasks_updated_at
  BEFORE UPDATE ON public.workflow_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
