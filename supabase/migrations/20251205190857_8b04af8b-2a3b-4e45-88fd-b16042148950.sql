-- Create label_templates table for saving label designs
CREATE TABLE public.label_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label_width NUMERIC NOT NULL,
  label_height NUMERIC NOT NULL,
  orientation TEXT NOT NULL DEFAULT 'portrait',
  include_logo BOOLEAN DEFAULT false,
  logo_url TEXT,
  canvas_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow all access to label_templates" 
ON public.label_templates 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_label_templates_updated_at
BEFORE UPDATE ON public.label_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();