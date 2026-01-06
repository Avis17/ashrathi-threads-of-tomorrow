-- Create company_vehicles table for managing own vehicles
CREATE TABLE public.company_vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_number VARCHAR(20) NOT NULL UNIQUE,
  vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('2_wheeler', '3_wheeler', '4_wheeler')),
  ownership_type VARCHAR(20) NOT NULL CHECK (ownership_type IN ('own', 'commercial')),
  driver_name VARCHAR(100),
  driver_phone VARCHAR(15),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies for access (allowing read/write for authenticated users or open for admin panel)
CREATE POLICY "Allow all access to company_vehicles" 
ON public.company_vehicles 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_vehicles_updated_at
BEFORE UPDATE ON public.company_vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();