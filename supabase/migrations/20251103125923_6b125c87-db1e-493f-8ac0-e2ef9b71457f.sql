-- Drop all existing production and stock related tables
DROP TABLE IF EXISTS public.dispatch_records CASCADE;
DROP TABLE IF EXISTS public.batch_inventory CASCADE;
DROP TABLE IF EXISTS public.production_overhead_costs CASCADE;
DROP TABLE IF EXISTS public.production_labor_costs CASCADE;
DROP TABLE IF EXISTS public.production_analytics CASCADE;
DROP TABLE IF EXISTS public.batch_predictions CASCADE;
DROP TABLE IF EXISTS public.production_material_usage CASCADE;
DROP TABLE IF EXISTS public.production_run_costs CASCADE;
DROP TABLE IF EXISTS public.production_run_materials CASCADE;
DROP TABLE IF EXISTS public.purchase_batch_items CASCADE;
DROP TABLE IF EXISTS public.purchase_batches CASCADE;
DROP TABLE IF EXISTS public.production_runs CASCADE;
DROP TABLE IF EXISTS public.production_batches CASCADE;
DROP TABLE IF EXISTS public.product_materials CASCADE;
DROP TABLE IF EXISTS public.raw_materials CASCADE;

-- Create materials table for storing all raw materials
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  current_cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  available_stock NUMERIC NOT NULL DEFAULT 0,
  reorder_level NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create production batches table - main workflow table
CREATE TABLE public.production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT NOT NULL UNIQUE,
  batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  target_quantity INTEGER NOT NULL,
  actual_quantity INTEGER NOT NULL DEFAULT 0,
  
  -- Costs
  total_material_cost NUMERIC NOT NULL DEFAULT 0,
  total_labor_cost NUMERIC NOT NULL DEFAULT 0,
  total_overhead_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  cost_per_piece NUMERIC NOT NULL DEFAULT 0,
  
  -- Sales
  total_sold_quantity INTEGER NOT NULL DEFAULT 0,
  total_sales_amount NUMERIC NOT NULL DEFAULT 0,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_production', 'completed', 'partially_sold', 'fully_sold')),
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create batch materials table - track material usage per batch
CREATE TABLE public.batch_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id),
  material_name TEXT NOT NULL,
  quantity_used NUMERIC NOT NULL,
  cost_per_unit NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create batch costs table - track all other costs
CREATE TABLE public.batch_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('labor', 'overhead', 'transport', 'other')),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create batch sales table - track sales from each batch
CREATE TABLE public.batch_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT NOT NULL,
  quantity_sold INTEGER NOT NULL,
  price_per_piece NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to generate batch code
CREATE OR REPLACE FUNCTION generate_batch_code()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq INT;
BEGIN
  year_str := to_char(current_date, 'YYYY');
  SELECT COALESCE(MAX((regexp_replace(batch_code, '^BATCH-' || year_str || '-', ''))::int), 0) + 1
    INTO seq
  FROM public.production_batches
  WHERE batch_code LIKE 'BATCH-' || year_str || '-%';
  RETURN 'BATCH-' || year_str || '-' || LPAD(seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate batch code
CREATE OR REPLACE FUNCTION set_batch_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.batch_code IS NULL OR NEW.batch_code = '' THEN
    NEW.batch_code := generate_batch_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_batch_code
  BEFORE INSERT ON public.production_batches
  FOR EACH ROW
  EXECUTE FUNCTION set_batch_code();

-- Create function to update batch totals
CREATE OR REPLACE FUNCTION update_batch_totals()
RETURNS TRIGGER AS $$
DECLARE
  batch RECORD;
  material_total NUMERIC;
  labor_total NUMERIC;
  overhead_total NUMERIC;
  sales_qty INTEGER;
  sales_amount NUMERIC;
BEGIN
  -- Get material costs
  SELECT COALESCE(SUM(total_cost), 0) INTO material_total
  FROM public.batch_materials
  WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id);
  
  -- Get labor costs
  SELECT COALESCE(SUM(amount), 0) INTO labor_total
  FROM public.batch_costs
  WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
    AND cost_type = 'labor';
  
  -- Get overhead costs (transport + overhead + other)
  SELECT COALESCE(SUM(amount), 0) INTO overhead_total
  FROM public.batch_costs
  WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
    AND cost_type IN ('overhead', 'transport', 'other');
  
  -- Get sales totals
  SELECT 
    COALESCE(SUM(quantity_sold), 0),
    COALESCE(SUM(total_amount), 0)
  INTO sales_qty, sales_amount
  FROM public.batch_sales
  WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id);
  
  -- Update batch
  UPDATE public.production_batches
  SET 
    total_material_cost = material_total,
    total_labor_cost = labor_total,
    total_overhead_cost = overhead_total,
    total_cost = material_total + labor_total + overhead_total,
    cost_per_piece = CASE 
      WHEN actual_quantity > 0 THEN (material_total + labor_total + overhead_total) / actual_quantity
      ELSE 0
    END,
    total_sold_quantity = sales_qty,
    total_sales_amount = sales_amount,
    status = CASE
      WHEN status = 'planning' THEN 'planning'
      WHEN actual_quantity = 0 THEN 'in_production'
      WHEN sales_qty = 0 THEN 'completed'
      WHEN sales_qty >= actual_quantity THEN 'fully_sold'
      WHEN sales_qty > 0 THEN 'partially_sold'
      ELSE 'completed'
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.batch_id, OLD.batch_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for auto-updating batch totals
CREATE TRIGGER trg_update_batch_on_material
  AFTER INSERT OR UPDATE OR DELETE ON public.batch_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_totals();

CREATE TRIGGER trg_update_batch_on_cost
  AFTER INSERT OR UPDATE OR DELETE ON public.batch_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_totals();

CREATE TRIGGER trg_update_batch_on_sale
  AFTER INSERT OR UPDATE OR DELETE ON public.batch_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_totals();

-- Create trigger for updated_at
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_batches_updated_at
  BEFORE UPDATE ON public.production_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage materials"
  ON public.materials FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage production_batches"
  ON public.production_batches FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage batch_materials"
  ON public.batch_materials FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage batch_costs"
  ON public.batch_costs FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage batch_sales"
  ON public.batch_sales FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_batch_materials_batch_id ON public.batch_materials(batch_id);
CREATE INDEX idx_batch_costs_batch_id ON public.batch_costs(batch_id);
CREATE INDEX idx_batch_sales_batch_id ON public.batch_sales(batch_id);
CREATE INDEX idx_production_batches_status ON public.production_batches(status);
CREATE INDEX idx_materials_active ON public.materials(is_active);