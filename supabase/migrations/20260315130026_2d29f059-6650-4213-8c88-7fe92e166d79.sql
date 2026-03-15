
CREATE TABLE public.batch_delivery_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  style_id text NOT NULL,
  pieces_given integer NOT NULL DEFAULT 0,
  sample_pieces_given integer NOT NULL DEFAULT 0,
  weight_entries jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_product_weight_grams numeric NOT NULL DEFAULT 0,
  total_fabric_weight_grams numeric NOT NULL DEFAULT 0,
  fabric_wastage_percent numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(batch_id, style_id)
);

ALTER TABLE public.batch_delivery_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read batch_delivery_info"
  ON public.batch_delivery_info FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert batch_delivery_info"
  ON public.batch_delivery_info FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update batch_delivery_info"
  ON public.batch_delivery_info FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read batch_delivery_info"
  ON public.batch_delivery_info FOR SELECT TO anon USING (true);
