-- Production Cost Management System Schema

-- 1. Raw Materials Table
CREATE TABLE public.raw_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- e.g., 'kg', 'meters', 'pieces'
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  reorder_level NUMERIC NOT NULL DEFAULT 0,
  supplier_name TEXT,
  supplier_contact TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Product Materials (Bill of Materials - BOM)
CREATE TABLE public.product_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  quantity_required NUMERIC NOT NULL DEFAULT 0, -- Amount needed per piece
  wastage_percentage NUMERIC NOT NULL DEFAULT 0, -- Typical wastage (0-100)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, raw_material_id)
);

-- 3. Production Batches
CREATE TABLE public.production_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_number TEXT NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  target_quantity INTEGER NOT NULL DEFAULT 0,
  actual_quantity INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'cancelled'
  total_material_cost NUMERIC NOT NULL DEFAULT 0,
  total_labor_cost NUMERIC NOT NULL DEFAULT 0,
  total_overhead_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  cost_per_piece NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Production Material Usage
CREATE TABLE public.production_material_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  quantity_used NUMERIC NOT NULL DEFAULT 0,
  cost_at_time NUMERIC NOT NULL DEFAULT 0, -- Material cost per unit at time of use
  total_cost NUMERIC NOT NULL DEFAULT 0, -- quantity × cost_at_time
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- 5. Production Labor Costs
CREATE TABLE public.production_labor_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  labor_type TEXT NOT NULL, -- e.g., 'Cutting', 'Stitching', 'Quality Check'
  hours_spent NUMERIC NOT NULL DEFAULT 0,
  cost_per_hour NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  worker_name TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- 6. Production Overhead Costs
CREATE TABLE public.production_overhead_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL, -- e.g., 'Electricity', 'Machine depreciation', 'Factory rent'
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for batch numbers
CREATE SEQUENCE IF NOT EXISTS batch_number_seq START 1;

-- Function to generate batch numbers
CREATE OR REPLACE FUNCTION public.generate_batch_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'BATCH' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('batch_number_seq')::TEXT, 4, '0');
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_raw_materials_updated_at
BEFORE UPDATE ON public.raw_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_materials_updated_at
BEFORE UPDATE ON public.product_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_batches_updated_at
BEFORE UPDATE ON public.production_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate batch costs
CREATE OR REPLACE FUNCTION public.calculate_batch_costs(batch_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  material_cost NUMERIC;
  labor_cost NUMERIC;
  overhead_cost NUMERIC;
  total NUMERIC;
  quantity INTEGER;
  cost_per_unit NUMERIC;
BEGIN
  -- Get material costs
  SELECT COALESCE(SUM(total_cost), 0) INTO material_cost
  FROM public.production_material_usage
  WHERE production_batch_id = batch_id;

  -- Get labor costs
  SELECT COALESCE(SUM(total_cost), 0) INTO labor_cost
  FROM public.production_labor_costs
  WHERE production_batch_id = batch_id;

  -- Get overhead costs
  SELECT COALESCE(SUM(amount), 0) INTO overhead_cost
  FROM public.production_overhead_costs
  WHERE production_batch_id = batch_id;

  -- Calculate totals
  total := material_cost + labor_cost + overhead_cost;

  -- Get actual quantity
  SELECT actual_quantity INTO quantity
  FROM public.production_batches
  WHERE id = batch_id;

  -- Calculate cost per piece
  IF quantity > 0 THEN
    cost_per_unit := total / quantity;
  ELSE
    cost_per_unit := 0;
  END IF;

  -- Update batch
  UPDATE public.production_batches
  SET 
    total_material_cost = material_cost,
    total_labor_cost = labor_cost,
    total_overhead_cost = overhead_cost,
    total_cost = total,
    cost_per_piece = cost_per_unit
  WHERE id = batch_id;
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_material_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_labor_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_overhead_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin Only Access
CREATE POLICY "Admins can view all raw materials"
ON public.raw_materials
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert raw materials"
ON public.raw_materials
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update raw materials"
ON public.raw_materials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete raw materials"
ON public.raw_materials
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all product materials"
ON public.product_materials
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert product materials"
ON public.product_materials
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product materials"
ON public.product_materials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product materials"
ON public.product_materials
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all production batches"
ON public.production_batches
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert production batches"
ON public.production_batches
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update production batches"
ON public.production_batches
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete production batches"
ON public.production_batches
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all material usage"
ON public.production_material_usage
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert material usage"
ON public.production_material_usage
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update material usage"
ON public.production_material_usage
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete material usage"
ON public.production_material_usage
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all labor costs"
ON public.production_labor_costs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert labor costs"
ON public.production_labor_costs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update labor costs"
ON public.production_labor_costs
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete labor costs"
ON public.production_labor_costs
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all overhead costs"
ON public.production_overhead_costs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert overhead costs"
ON public.production_overhead_costs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update overhead costs"
ON public.production_overhead_costs
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete overhead costs"
ON public.production_overhead_costs
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_product_materials_product_id ON public.product_materials(product_id);
CREATE INDEX idx_product_materials_material_id ON public.product_materials(raw_material_id);
CREATE INDEX idx_production_batches_product_id ON public.production_batches(product_id);
CREATE INDEX idx_production_batches_status ON public.production_batches(status);
CREATE INDEX idx_material_usage_batch_id ON public.production_material_usage(production_batch_id);
CREATE INDEX idx_labor_costs_batch_id ON public.production_labor_costs(production_batch_id);
CREATE INDEX idx_overhead_costs_batch_id ON public.production_overhead_costs(production_batch_id);