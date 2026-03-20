
-- Create table for NLP analysis history
CREATE TABLE public.nlp_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT NOT NULL,
  input_text TEXT NOT NULL,
  prompt TEXT,
  result JSONB NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nlp_analyses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analyses
CREATE POLICY "Users can view their own analyses"
ON public.nlp_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
ON public.nlp_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.nlp_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast user lookups
CREATE INDEX idx_nlp_analyses_user_id ON public.nlp_analyses (user_id, created_at DESC);
