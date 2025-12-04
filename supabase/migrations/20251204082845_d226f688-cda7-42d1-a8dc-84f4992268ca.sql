-- Create table for storing company letterheads
CREATE TABLE public.company_letterheads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  letter_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_no TEXT,
  recipient_name TEXT,
  recipient_address TEXT,
  subject TEXT,
  salutation TEXT DEFAULT 'Dear Sir/Madam,',
  letter_body TEXT,
  closing TEXT DEFAULT 'Yours faithfully,',
  seal_image TEXT,
  signature_image TEXT,
  show_seal BOOLEAN DEFAULT true,
  show_signature BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_letterheads ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admins
CREATE POLICY "Admins can manage company_letterheads"
  ON public.company_letterheads
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_company_letterheads_updated_at
  BEFORE UPDATE ON public.company_letterheads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();