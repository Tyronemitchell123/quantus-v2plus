
-- Add missing UPDATE policy for quantusbucket storage
CREATE POLICY "Users can update own quantum files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'quantusbucket' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'quantusbucket' AND auth.uid()::text = (storage.foldername(name))[1]);
