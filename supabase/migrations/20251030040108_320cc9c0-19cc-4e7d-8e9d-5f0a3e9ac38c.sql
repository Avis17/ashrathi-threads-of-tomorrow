-- Create batch_inventory table for tracking stock
CREATE TABLE IF NOT EXISTS public.batch_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID REFERENCES public.production_batches(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL UNIQUE,
  produced_quantity INTEGER NOT NULL DEFAULT 0,
  dispatched_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (produced_quantity - dispatched_quantity) STORED,
  quality_check_passed INTEGER NOT NULL DEFAULT 0,
  quality_check_failed INTEGER NOT NULL DEFAULT 0,
  warehouse_location TEXT,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_production', 'in_stock', 'low_stock', 'out_of_stock')),
  manufacturing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispatch_records table
CREATE TABLE IF NOT EXISTS public.dispatch_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_inventory_id UUID NOT NULL REFERENCES public.batch_inventory(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  quantity_dispatched INTEGER NOT NULL,
  dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  destination TEXT NOT NULL,
  courier_name TEXT,
  tracking_number TEXT,
  dispatched_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add stock tracking columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 5000,
ADD COLUMN IF NOT EXISTS current_total_stock INTEGER DEFAULT 0;

-- Function to generate custom batch number: FF-ProductCode-YYYY-WW-NNNN
CREATE OR REPLACE FUNCTION public.generate_custom_batch_number(
  product_code TEXT,
  production_date DATE DEFAULT CURRENT_DATE
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_str TEXT;
  week_str TEXT;
  sequence_num INTEGER;
  batch_num TEXT;
BEGIN
  -- Extract year (YYYY)
  year_str := TO_CHAR(production_date, 'YYYY');
  
  -- Extract week (WW) - ISO week number
  week_str := LPAD(EXTRACT(WEEK FROM production_date)::TEXT, 2, '0');
  
  -- Get next sequence number for this product/year/week combination
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(batch_number FROM '(\d+)$') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.batch_inventory
  WHERE batch_number LIKE 'FF-' || product_code || '-' || year_str || '-' || week_str || '-%';
  
  -- Format: FF-ProductCode-YYYY-WW-NNNN
  batch_num := 'FF-' || product_code || '-' || year_str || '-' || week_str || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN batch_num;
END;
$$;

-- Trigger to update batch_inventory updated_at
CREATE OR REPLACE FUNCTION public.update_batch_inventory_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_batch_inventory_updated_at_trigger
BEFORE UPDATE ON public.batch_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_batch_inventory_updated_at();

-- Trigger to auto-update product total stock when batch inventory changes
CREATE OR REPLACE FUNCTION public.update_product_total_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the product's current_total_stock
  UPDATE public.products
  SET current_total_stock = (
    SELECT COALESCE(SUM(available_quantity), 0)
    FROM public.batch_inventory
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_product_stock_on_batch_change
AFTER INSERT OR UPDATE OR DELETE ON public.batch_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_product_total_stock();

-- Trigger to update batch inventory when dispatch is recorded
CREATE OR REPLACE FUNCTION public.update_batch_on_dispatch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increase dispatched quantity
    UPDATE public.batch_inventory
    SET dispatched_quantity = dispatched_quantity + NEW.quantity_dispatched
    WHERE id = NEW.batch_inventory_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust dispatched quantity
    UPDATE public.batch_inventory
    SET dispatched_quantity = dispatched_quantity - OLD.quantity_dispatched + NEW.quantity_dispatched
    WHERE id = NEW.batch_inventory_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease dispatched quantity
    UPDATE public.batch_inventory
    SET dispatched_quantity = dispatched_quantity - OLD.quantity_dispatched
    WHERE id = OLD.batch_inventory_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_batch_on_dispatch_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.dispatch_records
FOR EACH ROW
EXECUTE FUNCTION public.update_batch_on_dispatch();

-- Trigger to auto-update batch status based on available quantity
CREATE OR REPLACE FUNCTION public.auto_update_batch_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Update status based on available quantity
  IF NEW.available_quantity = 0 THEN
    NEW.status := 'out_of_stock';
  ELSIF NEW.available_quantity < 50 THEN
    NEW.status := 'low_stock';
  ELSE
    NEW.status := 'in_stock';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_update_batch_status_trigger
BEFORE INSERT OR UPDATE ON public.batch_inventory
FOR EACH ROW
EXECUTE FUNCTION public.auto_update_batch_status();

-- RLS Policies for batch_inventory
ALTER TABLE public.batch_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all batch inventory"
ON public.batch_inventory FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert batch inventory"
ON public.batch_inventory FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update batch inventory"
ON public.batch_inventory FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete batch inventory"
ON public.batch_inventory FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for dispatch_records
ALTER TABLE public.dispatch_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all dispatch records"
ON public.dispatch_records FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert dispatch records"
ON public.dispatch_records FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dispatch records"
ON public.dispatch_records FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete dispatch records"
ON public.dispatch_records FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_batch_inventory_product_id ON public.batch_inventory(product_id);
CREATE INDEX idx_batch_inventory_batch_id ON public.batch_inventory(batch_id);
CREATE INDEX idx_batch_inventory_status ON public.batch_inventory(status);
CREATE INDEX idx_dispatch_records_batch_inventory_id ON public.dispatch_records(batch_inventory_id);
CREATE INDEX idx_dispatch_records_order_id ON public.dispatch_records(order_id);
CREATE INDEX idx_dispatch_records_dispatch_date ON public.dispatch_records(dispatch_date);