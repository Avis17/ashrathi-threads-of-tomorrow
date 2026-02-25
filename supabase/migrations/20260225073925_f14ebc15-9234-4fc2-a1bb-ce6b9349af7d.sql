ALTER TABLE public.marker_piece_library 
ADD COLUMN IF NOT EXISTS raw_width numeric,
ADD COLUMN IF NOT EXISTS raw_height numeric;