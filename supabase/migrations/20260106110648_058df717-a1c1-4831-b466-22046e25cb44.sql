-- Add job_work_direction to track if job is given or taken
ALTER TABLE public.delivery_challans 
ADD COLUMN job_work_direction text DEFAULT 'given' NOT NULL;

-- Add constraint for valid values
ALTER TABLE public.delivery_challans 
ADD CONSTRAINT delivery_challans_job_work_direction_check 
CHECK (job_work_direction IN ('given', 'taken'));

-- Add purposes array column for multi-select
ALTER TABLE public.delivery_challans 
ADD COLUMN purposes text[] DEFAULT ARRAY[]::text[];

-- Migrate existing purpose data to purposes array
UPDATE public.delivery_challans 
SET purposes = ARRAY[purpose]
WHERE purpose IS NOT NULL;