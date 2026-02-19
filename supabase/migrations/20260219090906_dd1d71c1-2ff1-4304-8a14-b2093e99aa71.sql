
ALTER TABLE public.batch_cutting_logs 
ADD COLUMN IF NOT EXISTS confirmed_pieces integer NOT NULL DEFAULT 0;
