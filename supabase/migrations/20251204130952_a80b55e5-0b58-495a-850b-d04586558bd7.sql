-- Create external job expenses table
CREATE TABLE public.external_job_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_order_id UUID NOT NULL REFERENCES public.external_job_orders(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NULL,
  unit TEXT NULL,
  rate_per_unit NUMERIC NULL,
  amount NUMERIC NOT NULL,
  supplier_name TEXT NULL,
  bill_number TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_job_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Admins can manage external_job_expenses"
  ON public.external_job_expenses
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));