
-- Table to store style-wise product weight analysis entries per batch
CREATE TABLE IF NOT EXISTS public.batch_weight_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT NOT NULL,
  style_id TEXT NOT NULL,
  is_set_item BOOLEAN NOT NULL DEFAULT false,
  -- For non-set items (or combined)
  actual_weight_grams NUMERIC,
  wastage_percent NUMERIC,
  -- For set items
  top_weight_grams NUMERIC,
  bottom_weight_grams NUMERIC,
  top_wastage_percent NUMERIC,
  bottom_wastage_percent NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(batch_id, style_id)
);

-- Enable RLS
ALTER TABLE public.batch_weight_analysis ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to CRUD
CREATE POLICY "Authenticated users can manage weight analysis"
  ON public.batch_weight_analysis
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_batch_weight_analysis_updated_at
  BEFORE UPDATE ON public.batch_weight_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
