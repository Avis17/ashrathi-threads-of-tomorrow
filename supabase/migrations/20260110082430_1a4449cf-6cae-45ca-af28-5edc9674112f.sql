-- Create external job salary entries table
CREATE TABLE public.external_job_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id UUID NOT NULL REFERENCES public.external_job_orders(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.job_employees(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  number_of_pieces INTEGER NOT NULL,
  rate_per_piece DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.external_job_salaries ENABLE ROW LEVEL SECURITY;

-- RLS policy for authenticated users
CREATE POLICY "Allow authenticated users full access to external_job_salaries"
  ON public.external_job_salaries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_external_job_salaries_job_order ON public.external_job_salaries(job_order_id);
CREATE INDEX idx_external_job_salaries_employee ON public.external_job_salaries(employee_id);
CREATE INDEX idx_external_job_salaries_operation ON public.external_job_salaries(operation);
CREATE INDEX idx_external_job_salaries_date ON public.external_job_salaries(payment_date);

-- Trigger to update updated_at
CREATE TRIGGER update_external_job_salaries_updated_at
  BEFORE UPDATE ON public.external_job_salaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();