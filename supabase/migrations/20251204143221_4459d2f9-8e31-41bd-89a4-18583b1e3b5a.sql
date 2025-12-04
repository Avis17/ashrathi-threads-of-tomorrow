-- Add description field to external_job_tasks for detailed purpose info
ALTER TABLE public.external_job_tasks 
ADD COLUMN IF NOT EXISTS description text;

-- Update some common tasks with descriptions
UPDATE public.external_job_tasks SET description = 'Purpose of this task/stitch operation' WHERE description IS NULL;