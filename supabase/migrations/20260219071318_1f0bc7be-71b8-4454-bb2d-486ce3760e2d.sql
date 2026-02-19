ALTER TABLE public.batch_operation_progress
ADD COLUMN IF NOT EXISTS mistake_pieces integer NOT NULL DEFAULT 0;