
-- Create a dedicated table for confirmed pieces per type
CREATE TABLE IF NOT EXISTS public.batch_type_confirmed (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  type_index integer NOT NULL DEFAULT 0,
  confirmed_pieces integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(batch_id, type_index)
);

ALTER TABLE public.batch_type_confirmed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON public.batch_type_confirmed
  FOR ALL USING (true) WITH CHECK (true);
