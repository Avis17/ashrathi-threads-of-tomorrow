
CREATE TABLE public.calculator_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calculator_type TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.calculator_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view calculator entries"
ON public.calculator_entries FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert calculator entries"
ON public.calculator_entries FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete their own entries"
ON public.calculator_entries FOR DELETE
USING (auth.uid() = created_by);
