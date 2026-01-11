-- Create export buyer contacts table
CREATE TABLE public.export_buyer_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.export_buyer_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view buyer contacts" 
ON public.export_buyer_contacts 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create buyer contacts" 
ON public.export_buyer_contacts 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update buyer contacts" 
ON public.export_buyer_contacts 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete buyer contacts" 
ON public.export_buyer_contacts 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_export_buyer_contacts_updated_at
BEFORE UPDATE ON public.export_buyer_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();