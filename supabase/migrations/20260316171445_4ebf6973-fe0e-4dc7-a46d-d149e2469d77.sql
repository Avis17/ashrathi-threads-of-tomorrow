
CREATE TABLE public.batch_finalized_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  rate NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(batch_id, operation)
);

ALTER TABLE public.batch_finalized_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage finalized rates"
  ON public.batch_finalized_rates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Storage bucket for rate proof images
INSERT INTO storage.buckets (id, name, public) VALUES ('salary-rate-proofs', 'salary-rate-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated can upload rate proofs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'salary-rate-proofs');

CREATE POLICY "Public can view rate proofs"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'salary-rate-proofs');

CREATE POLICY "Authenticated can delete rate proofs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'salary-rate-proofs');
