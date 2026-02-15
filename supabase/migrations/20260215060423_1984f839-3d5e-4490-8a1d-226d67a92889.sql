
-- Add company_profit and variations JSONB to batch_job_works
ALTER TABLE public.batch_job_works
  ADD COLUMN IF NOT EXISTS company_profit numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS variations jsonb DEFAULT '[]'::jsonb;
