-- Create brochure download leads table
CREATE TABLE public.brochure_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  phone TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.brochure_leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public lead capture)
CREATE POLICY "Anyone can submit brochure lead" 
ON public.brochure_leads 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view leads (via service role or admin check)
CREATE POLICY "Admins can view brochure leads" 
ON public.brochure_leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email IN ('admin@featherfashions.in', 'featherfashions.shop@gmail.com')
  )
);

-- Create index for email lookup
CREATE INDEX idx_brochure_leads_email ON public.brochure_leads(email);
CREATE INDEX idx_brochure_leads_downloaded_at ON public.brochure_leads(downloaded_at DESC);