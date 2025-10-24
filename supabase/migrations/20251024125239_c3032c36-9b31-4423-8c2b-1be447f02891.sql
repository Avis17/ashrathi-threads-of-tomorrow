-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  building_size NUMERIC NOT NULL,
  address TEXT NOT NULL,
  owner_number TEXT NOT NULL,
  is_main_building BOOLEAN NOT NULL DEFAULT false,
  is_outlet BOOLEAN NOT NULL DEFAULT true,
  is_manufacturing_unit BOOLEAN NOT NULL DEFAULT false,
  facilities TEXT[],
  building_type TEXT NOT NULL,
  electricity_sanctioned TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all branches"
ON public.branches
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert branches"
ON public.branches
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update branches"
ON public.branches
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete branches"
ON public.branches
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_branches_updated_at
BEFORE UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to ensure only one main building
CREATE OR REPLACE FUNCTION check_main_building()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_main_building = true THEN
    IF EXISTS (
      SELECT 1 FROM public.branches 
      WHERE is_main_building = true 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Only one main building is allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_main_building
BEFORE INSERT OR UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION check_main_building();