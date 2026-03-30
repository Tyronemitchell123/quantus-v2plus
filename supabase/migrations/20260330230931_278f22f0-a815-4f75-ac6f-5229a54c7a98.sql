ALTER TABLE public.deals ADD COLUMN is_priority boolean NOT NULL DEFAULT false;
ALTER TABLE public.deals ADD COLUMN priority_surcharge_cents integer DEFAULT 0;