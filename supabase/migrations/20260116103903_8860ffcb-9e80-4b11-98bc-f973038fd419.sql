-- Create exporters table with mobile_number as unique identifier
CREATE TABLE public.exporters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sl_no INTEGER,
  name TEXT NOT NULL,
  hall_no TEXT,
  stall_no TEXT,
  address TEXT,
  state TEXT,
  contact_person TEXT,
  mobile_number TEXT UNIQUE NOT NULL,
  landline_number TEXT,
  email TEXT,
  website TEXT,
  products_on_display TEXT,
  export_markets TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exporters ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (authenticated users can manage)
CREATE POLICY "Authenticated users can view exporters" 
ON public.exporters 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert exporters" 
ON public.exporters 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update exporters" 
ON public.exporters 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete exporters" 
ON public.exporters 
FOR DELETE 
TO authenticated
USING (true);

-- Create indexes for better search performance
CREATE INDEX idx_exporters_name ON public.exporters USING gin(to_tsvector('english', name));
CREATE INDEX idx_exporters_state ON public.exporters(state);
CREATE INDEX idx_exporters_mobile ON public.exporters(mobile_number);
CREATE INDEX idx_exporters_email ON public.exporters(email);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_exporters_updated_at
BEFORE UPDATE ON public.exporters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();