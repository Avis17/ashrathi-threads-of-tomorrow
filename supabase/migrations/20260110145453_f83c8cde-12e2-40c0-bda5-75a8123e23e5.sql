-- Create salary_advance_entries table for tracking advance payments
CREATE TABLE public.salary_advance_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.job_employees(id),
  operation TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  advance_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  closed_at TIMESTAMP WITH TIME ZONE,
  salary_id UUID REFERENCES public.external_job_salaries(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add deduction columns to external_job_salaries table
ALTER TABLE public.external_job_salaries
ADD COLUMN advance_deductions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN gross_amount NUMERIC DEFAULT 0,
ADD COLUMN deduction_amount NUMERIC DEFAULT 0,
ADD COLUMN calculation_details TEXT;

-- Enable RLS
ALTER TABLE public.salary_advance_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for salary_advance_entries
CREATE POLICY "Allow full access to salary_advance_entries" 
ON public.salary_advance_entries 
FOR ALL 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_salary_advance_entries_employee ON public.salary_advance_entries(employee_id);
CREATE INDEX idx_salary_advance_entries_operation ON public.salary_advance_entries(operation);
CREATE INDEX idx_salary_advance_entries_status ON public.salary_advance_entries(status);
CREATE INDEX idx_salary_advance_entries_salary ON public.salary_advance_entries(salary_id);

-- Create trigger for updated_at
CREATE TRIGGER update_salary_advance_entries_updated_at
BEFORE UPDATE ON public.salary_advance_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();