-- Create delivery_challans table
CREATE TABLE public.delivery_challans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dc_number TEXT NOT NULL UNIQUE,
  dc_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dc_type TEXT NOT NULL CHECK (dc_type IN ('job_work', 'return', 'rework')),
  purpose TEXT NOT NULL CHECK (purpose IN ('stitching', 'ironing', 'packing', 'embroidery', 'printing')),
  job_worker_name TEXT NOT NULL,
  job_worker_address TEXT,
  job_worker_gstin TEXT,
  vehicle_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_mobile TEXT NOT NULL,
  expected_return_date DATE,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'dispatched', 'closed')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_challan_items table
CREATE TABLE public.delivery_challan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_challan_id UUID NOT NULL REFERENCES public.delivery_challans(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL,
  uom TEXT NOT NULL DEFAULT 'pcs' CHECK (uom IN ('pcs', 'kg')),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_workers table for searchable dropdown
CREATE TABLE public.job_workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  gstin TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_challan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_workers ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage delivery challans" ON public.delivery_challans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage delivery challan items" ON public.delivery_challan_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.delivery_challans dc 
      WHERE dc.id = delivery_challan_id 
      AND public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Admins can manage job workers" ON public.job_workers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate DC number
CREATE OR REPLACE FUNCTION public.generate_dc_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  year_str TEXT;
  month_str TEXT;
  seq INT;
BEGIN
  year_str := to_char(current_date, 'YYYY');
  month_str := to_char(current_date, 'MM');
  SELECT COALESCE(MAX((regexp_replace(dc_number, '^DC-' || year_str || month_str || '-', ''))::int), 0) + 1
    INTO seq
  FROM public.delivery_challans
  WHERE dc_number LIKE 'DC-' || year_str || month_str || '-%';
  RETURN 'DC-' || year_str || month_str || '-' || LPAD(seq::text, 4, '0');
END;
$$;

-- Trigger to auto-generate DC number
CREATE OR REPLACE FUNCTION public.set_dc_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.dc_number IS NULL OR NEW.dc_number = '' THEN
    NEW.dc_number := public.generate_dc_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_dc_number
  BEFORE INSERT ON public.delivery_challans
  FOR EACH ROW
  EXECUTE FUNCTION public.set_dc_number();

-- Trigger to update total_quantity
CREATE OR REPLACE FUNCTION public.update_dc_total_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.delivery_challans
    SET total_quantity = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM public.delivery_challan_items
      WHERE delivery_challan_id = OLD.delivery_challan_id
    )
    WHERE id = OLD.delivery_challan_id;
    RETURN OLD;
  ELSE
    UPDATE public.delivery_challans
    SET total_quantity = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM public.delivery_challan_items
      WHERE delivery_challan_id = NEW.delivery_challan_id
    )
    WHERE id = NEW.delivery_challan_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trigger_update_dc_quantity
  AFTER INSERT OR UPDATE OR DELETE ON public.delivery_challan_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dc_total_quantity();

-- Updated at trigger
CREATE TRIGGER update_delivery_challans_updated_at
  BEFORE UPDATE ON public.delivery_challans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_workers_updated_at
  BEFORE UPDATE ON public.job_workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_delivery_challans_dc_number ON public.delivery_challans(dc_number);
CREATE INDEX idx_delivery_challans_status ON public.delivery_challans(status);
CREATE INDEX idx_delivery_challans_dc_date ON public.delivery_challans(dc_date);
CREATE INDEX idx_delivery_challan_items_dc_id ON public.delivery_challan_items(delivery_challan_id);