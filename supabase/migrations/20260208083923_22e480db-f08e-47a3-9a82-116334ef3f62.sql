-- Add linked_cmt_quotation_id to job_styles for linking styles to CMT quotations
ALTER TABLE public.job_styles 
ADD COLUMN linked_cmt_quotation_id UUID REFERENCES public.cmt_quotations(id) ON DELETE SET NULL;

-- Add approved_rates JSONB column to cmt_quotations for storing final approved values
ALTER TABLE public.cmt_quotations 
ADD COLUMN approved_rates JSONB DEFAULT NULL;

-- Update status column to include more options
ALTER TABLE public.cmt_quotations 
ALTER COLUMN status TYPE TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.job_styles.linked_cmt_quotation_id IS 'Links this style to a CMT quotation';
COMMENT ON COLUMN public.cmt_quotations.approved_rates IS 'Stores the final approved rates when status is approved';