
ALTER TABLE public.batch_job_works 
ADD COLUMN IF NOT EXISTS work_status text NOT NULL DEFAULT 'pending';

COMMENT ON COLUMN public.batch_job_works.work_status IS 'Work progress status: pending, started, in_progress, completed';
