UPDATE storage.buckets SET public = true WHERE id = 'quantusbucket';

CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'quantusbucket' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'quantusbucket' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'quantusbucket' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view public bucket files"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'quantusbucket');

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'general',
  content text NOT NULL,
  sender_type text NOT NULL DEFAULT 'user',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

CREATE INDEX idx_chat_messages_channel ON public.chat_messages(user_id, channel, created_at DESC);