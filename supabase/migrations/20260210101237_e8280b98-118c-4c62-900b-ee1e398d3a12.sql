
-- Table for tracking wastage pieces per color in a batch
CREATE TABLE public.batch_cutting_wastage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  type_index INTEGER NOT NULL,
  color TEXT NOT NULL,
  wastage_pieces INTEGER NOT NULL DEFAULT 0,
  actual_weight_kg NUMERIC(10,3) NULL,
  notes TEXT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batch_cutting_wastage ENABLE ROW LEVEL SECURITY;

-- Allow all operations (matches existing pattern for batch tables)
CREATE POLICY "Allow all access to batch_cutting_wastage"
  ON public.batch_cutting_wastage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_batch_cutting_wastage_updated_at
  BEFORE UPDATE ON public.batch_cutting_wastage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
