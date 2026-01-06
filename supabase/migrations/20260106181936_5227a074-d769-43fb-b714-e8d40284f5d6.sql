-- Create generic_job_expenses table for tracking overhead/general expenses
CREATE TABLE public.generic_job_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  supplier_name TEXT,
  bill_number TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.generic_job_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policy for authenticated users
CREATE POLICY "Allow authenticated users full access to generic_job_expenses"
  ON public.generic_job_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_generic_job_expenses_updated_at
  BEFORE UPDATE ON public.generic_job_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();