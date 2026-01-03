-- Add is_disabled column to external_job_orders
ALTER TABLE public.external_job_orders 
ADD COLUMN is_disabled boolean DEFAULT false;