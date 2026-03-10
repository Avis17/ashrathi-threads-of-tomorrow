
-- Create company_expenses table
CREATE TABLE public.company_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_request_id TEXT NOT NULL UNIQUE,
  employee_code TEXT,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  note TEXT,
  supplier_name TEXT,
  batch_number TEXT DEFAULT 'COMPANY',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_expenses ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can manage company expenses" ON public.company_expenses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add cash_request_id to job_batch_expenses for tracking synced bills
ALTER TABLE public.job_batch_expenses ADD COLUMN IF NOT EXISTS cash_request_id TEXT;
