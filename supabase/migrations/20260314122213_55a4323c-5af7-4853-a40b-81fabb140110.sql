ALTER TABLE public.batch_job_works DROP COLUMN IF EXISTS confirmed_return_pieces;
ALTER TABLE public.batch_job_works ADD COLUMN confirmed_return_pieces jsonb DEFAULT NULL;