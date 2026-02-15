
-- Salary entries per operation per style in a batch
CREATE TABLE public.batch_salary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES public.job_styles(id),
  operation TEXT NOT NULL,
  description TEXT DEFAULT '',
  rate_per_piece NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC GENERATED ALWAYS AS (rate_per_piece * quantity) STORED,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(batch_id, style_id, operation, description)
);

ALTER TABLE public.batch_salary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage batch salary entries"
  ON public.batch_salary_entries FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_batch_salary_entries_updated_at
  BEFORE UPDATE ON public.batch_salary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
