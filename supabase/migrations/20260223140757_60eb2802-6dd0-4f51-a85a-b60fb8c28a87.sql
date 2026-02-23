
CREATE TABLE public.marker_piece_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  garment_type TEXT NOT NULL DEFAULT 'custom',
  size TEXT NOT NULL DEFAULT 'Free',
  set_type TEXT NOT NULL DEFAULT 'individual',
  grain_line TEXT NOT NULL DEFAULT 'lengthwise',
  quantity_per_garment INT NOT NULL DEFAULT 1,
  width_inches NUMERIC NOT NULL DEFAULT 0,
  height_inches NUMERIC NOT NULL DEFAULT 0,
  svg_path_data TEXT NOT NULL,
  original_filename TEXT,
  dxf_file_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marker_piece_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all pieces"
  ON public.marker_piece_library FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert pieces"
  ON public.marker_piece_library FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own pieces"
  ON public.marker_piece_library FOR UPDATE
  TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own pieces"
  ON public.marker_piece_library FOR DELETE
  TO authenticated USING (auth.uid() = created_by);
