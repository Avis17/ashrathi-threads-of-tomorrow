-- Add new fields for enhanced company profile

-- Power details
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS eb_power_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS power_phase text DEFAULT '3 Phase';

-- Quality Control Process
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS inline_checking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS final_checking boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS measurement_check boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS aql_followed boolean DEFAULT false;

-- Production Capability details
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS moq text,
ADD COLUMN IF NOT EXISTS lead_time text,
ADD COLUMN IF NOT EXISTS sample_lead_time text;

-- Packing enhancement
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS carton_packing_support boolean DEFAULT false;

-- Signature & Seal
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS authorized_signatory_name text,
ADD COLUMN IF NOT EXISTS signatory_designation text;