
-- Table to track operation-level completion counts for a batch
CREATE TABLE public.batch_operation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  completed_pieces INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(batch_id, operation)
);

-- Enable RLS
ALTER TABLE public.batch_operation_progress ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access (internal admin tool)
CREATE POLICY "Authenticated users can manage operation progress"
  ON public.batch_operation_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_batch_operation_progress_updated_at
  BEFORE UPDATE ON public.batch_operation_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
