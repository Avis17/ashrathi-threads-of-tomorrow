
-- Job Works table for tracking outsourced work from a batch
CREATE TABLE public.batch_job_works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES public.job_styles(id),
  type_index INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  pieces INTEGER NOT NULL DEFAULT 0,
  company_id UUID REFERENCES public.external_job_companies(id),
  company_name TEXT NOT NULL,
  notes TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  balance_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job Work Operations (each operation given for the job work)
CREATE TABLE public.batch_job_work_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_work_id UUID NOT NULL REFERENCES public.batch_job_works(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  rate_per_piece NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  amount NUMERIC GENERATED ALWAYS AS (rate_per_piece * quantity) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batch_job_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_job_work_operations ENABLE ROW LEVEL SECURITY;

-- RLS policies (authenticated users only)
CREATE POLICY "Authenticated users can manage batch_job_works"
  ON public.batch_job_works FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage batch_job_work_operations"
  ON public.batch_job_work_operations FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Auto-calculate totals trigger
CREATE OR REPLACE FUNCTION public.update_job_work_totals()
  RETURNS TRIGGER LANGUAGE plpgsql
  SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.batch_job_works
  SET total_amount = (
    SELECT COALESCE(SUM(rate_per_piece * quantity), 0)
    FROM public.batch_job_work_operations
    WHERE job_work_id = COALESCE(NEW.job_work_id, OLD.job_work_id)
  ),
  balance_amount = total_amount - paid_amount,
  updated_at = now()
  WHERE id = COALESCE(NEW.job_work_id, OLD.job_work_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_job_work_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.batch_job_work_operations
  FOR EACH ROW EXECUTE FUNCTION public.update_job_work_totals();

-- Auto update balance
CREATE OR REPLACE FUNCTION public.calculate_job_work_balance()
  RETURNS TRIGGER LANGUAGE plpgsql
  SET search_path = 'public'
AS $$
BEGIN
  NEW.balance_amount := NEW.total_amount - COALESCE(NEW.paid_amount, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calculate_job_work_balance
  BEFORE INSERT OR UPDATE ON public.batch_job_works
  FOR EACH ROW EXECUTE FUNCTION public.calculate_job_work_balance();

-- Updated_at trigger
CREATE TRIGGER update_batch_job_works_updated_at
  BEFORE UPDATE ON public.batch_job_works
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
