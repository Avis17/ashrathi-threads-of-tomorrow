-- Create contractors table
CREATE TABLE IF NOT EXISTS public.job_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_code TEXT NOT NULL UNIQUE,
  contractor_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on contractors
ALTER TABLE public.job_contractors ENABLE ROW LEVEL SECURITY;

-- RLS policy for contractors
CREATE POLICY "Admins can manage job_contractors"
ON public.job_contractors
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add departments field to job_employees
ALTER TABLE public.job_employees ADD COLUMN IF NOT EXISTS departments JSONB DEFAULT '[]'::jsonb;

-- Add contractor_id to job_employees (keep contractor_name for now)
ALTER TABLE public.job_employees ADD COLUMN IF NOT EXISTS contractor_id UUID REFERENCES public.job_contractors(id) ON DELETE SET NULL;

-- Add style_image_url to job_styles
ALTER TABLE public.job_styles ADD COLUMN IF NOT EXISTS style_image_url TEXT;

-- Create storage bucket for style images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('style-images', 'style-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for style images
CREATE POLICY "Admins can upload style images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'style-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view style images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'style-images');

CREATE POLICY "Admins can update style images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'style-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete style images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'style-images' AND has_role(auth.uid(), 'admin'::app_role));