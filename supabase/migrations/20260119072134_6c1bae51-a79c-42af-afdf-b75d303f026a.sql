-- Create company_profiles table for storing infrastructure details
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Company Details
  company_name TEXT NOT NULL,
  brand_name TEXT DEFAULT 'Feather Fashions Garments',
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  gst_number TEXT,
  company_code TEXT,
  
  -- Cutting Section
  cutting_tables_count INTEGER DEFAULT 0,
  cutting_table_size TEXT,
  fabric_inspection_tables_count INTEGER DEFAULT 0,
  fabric_inspection_table_size TEXT,
  cutting_notes TEXT,
  cutting_images TEXT[] DEFAULT '{}',
  
  -- Stitching Machines (JSON array for dynamic list)
  stitching_machines JSONB DEFAULT '[]',
  stitching_notes TEXT,
  stitching_images TEXT[] DEFAULT '{}',
  
  -- Checking/Quality Section
  checking_tables_count INTEGER DEFAULT 0,
  checking_table_size TEXT,
  measurement_tools JSONB DEFAULT '{"tape": false, "gsm_cutter": false, "shade_card": false, "needle_detector": false}',
  checking_notes TEXT,
  checking_images TEXT[] DEFAULT '{}',
  
  -- Ironing/Finishing Section
  ironing_tables_count INTEGER DEFAULT 0,
  steam_iron_count INTEGER DEFAULT 0,
  vacuum_table_available BOOLEAN DEFAULT false,
  boiler_available BOOLEAN DEFAULT false,
  ironing_notes TEXT,
  ironing_images TEXT[] DEFAULT '{}',
  
  -- Utilities & Power Backup
  generator_available BOOLEAN DEFAULT false,
  generator_capacity TEXT,
  compressor_available BOOLEAN DEFAULT false,
  compressor_capacity TEXT,
  power_connection_type TEXT,
  utilities_notes TEXT,
  utilities_images TEXT[] DEFAULT '{}',
  
  -- Packing Section
  packing_tables_count INTEGER DEFAULT 0,
  polybag_sealing_available BOOLEAN DEFAULT false,
  tagging_barcode_support BOOLEAN DEFAULT false,
  storage_racks_available BOOLEAN DEFAULT false,
  packing_notes TEXT,
  packing_images TEXT[] DEFAULT '{}',
  
  -- Staff & Capacity
  total_employees INTEGER DEFAULT 0,
  cutting_staff INTEGER DEFAULT 0,
  stitching_staff INTEGER DEFAULT 0,
  checking_staff INTEGER DEFAULT 0,
  ironing_staff INTEGER DEFAULT 0,
  packing_staff INTEGER DEFAULT 0,
  daily_production_capacity TEXT,
  staff_notes TEXT,
  
  -- General
  general_remarks TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT
);

-- Enable RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view company profiles" 
ON public.company_profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert company profiles" 
ON public.company_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update company profiles" 
ON public.company_profiles 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete company profiles" 
ON public.company_profiles 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_profiles_updated_at
BEFORE UPDATE ON public.company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();