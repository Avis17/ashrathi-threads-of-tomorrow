
-- Add missing columns to job_workers to match external_job_companies fields
ALTER TABLE public.job_workers ADD COLUMN IF NOT EXISTS alternate_number text;
ALTER TABLE public.job_workers ADD COLUMN IF NOT EXISTS upi_id text;
ALTER TABLE public.job_workers ADD COLUMN IF NOT EXISTS account_details text;
ALTER TABLE public.job_workers ADD COLUMN IF NOT EXISTS notes text;
