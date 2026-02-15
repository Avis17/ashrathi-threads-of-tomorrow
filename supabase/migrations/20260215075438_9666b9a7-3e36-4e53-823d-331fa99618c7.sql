
-- Table to track advance payments given for each batch salary operation
CREATE TABLE public.batch_salary_advances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT NOT NULL,
  style_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL CHECK (amount > 0),
  advance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batch_salary_advances ENABLE ROW LEVEL SECURITY;

-- RLS policies (admin-only access, matching existing pattern)
CREATE POLICY "Authenticated users can view batch salary advances"
  ON public.batch_salary_advances FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert batch salary advances"
  ON public.batch_salary_advances FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update batch salary advances"
  ON public.batch_salary_advances FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete batch salary advances"
  ON public.batch_salary_advances FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_batch_salary_advances_updated_at
  BEFORE UPDATE ON public.batch_salary_advances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
