ALTER TABLE public.batch_type_confirmed
ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'in_progress';