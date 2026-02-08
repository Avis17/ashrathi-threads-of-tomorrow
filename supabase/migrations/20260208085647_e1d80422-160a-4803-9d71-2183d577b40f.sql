-- Drop the old constraint and add a new one with all valid statuses
ALTER TABLE public.cmt_quotations DROP CONSTRAINT cmt_quotations_status_check;

ALTER TABLE public.cmt_quotations ADD CONSTRAINT cmt_quotations_status_check 
CHECK (status = ANY (ARRAY['draft', 'sent', 'in_progress', 'approved', 'rejected']));

-- Update any existing records to use lowercase values
UPDATE public.cmt_quotations SET status = 'draft' WHERE status IS NULL OR status = 'Draft';
UPDATE public.cmt_quotations SET status = 'sent' WHERE status = 'Sent';
UPDATE public.cmt_quotations SET status = 'in_progress' WHERE status = 'In Progress';
UPDATE public.cmt_quotations SET status = 'approved' WHERE status = 'Approved' OR status = 'accepted';
UPDATE public.cmt_quotations SET status = 'rejected' WHERE status = 'Rejected';