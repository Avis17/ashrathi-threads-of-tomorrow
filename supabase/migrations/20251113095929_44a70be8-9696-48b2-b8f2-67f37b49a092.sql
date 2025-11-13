-- Add batch_id to job_weekly_settlements for batch-specific settlements
ALTER TABLE public.job_weekly_settlements
ADD COLUMN batch_id UUID REFERENCES public.job_batches(id) ON DELETE SET NULL;