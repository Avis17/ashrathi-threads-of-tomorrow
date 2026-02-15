
-- Create job work payments table
CREATE TABLE public.job_work_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_work_id UUID NOT NULL REFERENCES public.batch_job_works(id) ON DELETE CASCADE,
  calculated_amount NUMERIC NOT NULL DEFAULT 0,
  adjustment NUMERIC NOT NULL DEFAULT 0,
  payment_amount NUMERIC NOT NULL DEFAULT 0,
  payment_date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_work_payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Authenticated users can manage job work payments"
ON public.job_work_payments FOR ALL
USING (true) WITH CHECK (true);

-- Trigger to auto-update paid_amount on batch_job_works
CREATE OR REPLACE FUNCTION public.update_job_work_paid_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.batch_job_works
  SET paid_amount = (
    SELECT COALESCE(SUM(payment_amount), 0)
    FROM public.job_work_payments
    WHERE job_work_id = COALESCE(NEW.job_work_id, OLD.job_work_id)
  )
  WHERE id = COALESCE(NEW.job_work_id, OLD.job_work_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_job_work_paid
AFTER INSERT OR UPDATE OR DELETE ON public.job_work_payments
FOR EACH ROW EXECUTE FUNCTION public.update_job_work_paid_amount();
