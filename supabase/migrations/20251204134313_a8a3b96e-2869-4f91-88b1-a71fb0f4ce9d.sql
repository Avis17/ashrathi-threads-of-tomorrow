-- Add notes column to external_job_orders
ALTER TABLE public.external_job_orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add commission_percent column to external_job_operations
ALTER TABLE public.external_job_operations ADD COLUMN IF NOT EXISTS commission_percent NUMERIC DEFAULT 0;