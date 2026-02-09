-- Add operations column to job_contractors table
ALTER TABLE public.job_contractors 
ADD COLUMN operations text[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.job_contractors.operations IS 'Array of operations/departments this contractor handles';