ALTER TABLE public.job_batches ADD COLUMN IF NOT EXISTS company_name TEXT;

NOTIFY pgrst, 'reload schema';