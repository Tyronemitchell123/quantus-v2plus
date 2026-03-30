
-- marketing_social: add user-scoped policies
CREATE POLICY "Users can view own social posts"
  ON public.marketing_social FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own social posts"
  ON public.marketing_social FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social posts"
  ON public.marketing_social FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social posts"
  ON public.marketing_social FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- marketing_ads: add user-scoped policies
CREATE POLICY "Users can view own ads"
  ON public.marketing_ads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ads"
  ON public.marketing_ads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ads"
  ON public.marketing_ads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ads"
  ON public.marketing_ads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- marketing_seo: add user-scoped policies
CREATE POLICY "Users can view own SEO data"
  ON public.marketing_seo FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own SEO data"
  ON public.marketing_seo FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SEO data"
  ON public.marketing_seo FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own SEO data"
  ON public.marketing_seo FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
