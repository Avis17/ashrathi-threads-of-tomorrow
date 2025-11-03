-- Direct table creation without IF NOT EXISTS to ensure they're created

DROP TABLE IF EXISTS public.production_run_costs CASCADE;
DROP TABLE IF EXISTS public.production_run_materials CASCADE;
DROP TABLE IF EXISTS public.production_runs CASCADE;
DROP TABLE IF EXISTS public.purchase_batch_items CASCADE;
DROP TABLE IF EXISTS public.purchase_batches CASCADE;

-- Create purchase_batches table
CREATE TABLE public.purchase_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT NOT NULL UNIQUE DEFAULT '',
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  supplier_address TEXT,
  transport_cost NUMERIC NOT NULL DEFAULT 0,
  loading_cost NUMERIC NOT NULL DEFAULT 0,
  other_costs NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create purchase_batch_items table
CREATE TABLE public.purchase_batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_batch_id UUID NOT NULL REFERENCES public.purchase_batches(id) ON DELETE CASCADE,
  raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id),
  color TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  rate_per_kg NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  remaining_quantity_kg NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create production_runs table
CREATE TABLE public.production_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code TEXT NOT NULL UNIQUE DEFAULT '',
  product_id UUID NOT NULL REFERENCES public.products(id),
  target_quantity INTEGER NOT NULL,
  actual_quantity INTEGER NOT NULL DEFAULT 0,
  predicted_yield INTEGER,
  cost_per_piece NUMERIC NOT NULL DEFAULT 0,
  total_material_cost NUMERIC NOT NULL DEFAULT 0,
  total_labor_cost NUMERIC NOT NULL DEFAULT 0,
  total_overhead_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('planned','in_progress','completed','cancelled'))
);

-- Create production_run_materials table
CREATE TABLE public.production_run_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_run_id UUID NOT NULL REFERENCES public.production_runs(id) ON DELETE CASCADE,
  purchase_batch_item_id UUID NOT NULL REFERENCES public.purchase_batch_items(id),
  quantity_used_kg NUMERIC NOT NULL,
  wastage_kg NUMERIC NOT NULL DEFAULT 0,
  cost_at_time NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create production_run_costs table
CREATE TABLE public.production_run_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_run_id UUID NOT NULL REFERENCES public.production_runs(id) ON DELETE CASCADE,
  cost_stage TEXT NOT NULL CHECK (cost_stage IN ('cutting','stitching','inspection','packing','transport','misc')),
  cost_category TEXT NOT NULL CHECK (cost_category IN ('material','labor','overhead')),
  amount NUMERIC NOT NULL,
  description TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_purchase_batch_items_batch ON public.purchase_batch_items(purchase_batch_id);
CREATE INDEX idx_purchase_batch_items_material ON public.purchase_batch_items(raw_material_id);
CREATE INDEX idx_production_runs_product ON public.production_runs(product_id);
CREATE INDEX idx_production_runs_status ON public.production_runs(status);
CREATE INDEX idx_production_run_materials_run ON public.production_run_materials(production_run_id);
CREATE INDEX idx_production_run_materials_item ON public.production_run_materials(purchase_batch_item_id);
CREATE INDEX idx_production_run_costs_run ON public.production_run_costs(production_run_id);

-- Enable RLS
ALTER TABLE public.purchase_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_run_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_run_costs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view purchase_batches" ON public.purchase_batches FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert purchase_batches" ON public.purchase_batches FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update purchase_batches" ON public.purchase_batches FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete purchase_batches" ON public.purchase_batches FOR DELETE USING (has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can view purchase_batch_items" ON public.purchase_batch_items FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert purchase_batch_items" ON public.purchase_batch_items FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update purchase_batch_items" ON public.purchase_batch_items FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete purchase_batch_items" ON public.purchase_batch_items FOR DELETE USING (has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can view production_runs" ON public.production_runs FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert production_runs" ON public.production_runs FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update production_runs" ON public.production_runs FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete production_runs" ON public.production_runs FOR DELETE USING (has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can view production_run_materials" ON public.production_run_materials FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert production_run_materials" ON public.production_run_materials FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update production_run_materials" ON public.production_run_materials FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete production_run_materials" ON public.production_run_materials FOR DELETE USING (has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can view production_run_costs" ON public.production_run_costs FOR SELECT USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert production_run_costs" ON public.production_run_costs FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update production_run_costs" ON public.production_run_costs FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete production_run_costs" ON public.production_run_costs FOR DELETE USING (has_role(auth.uid(),'admin'));