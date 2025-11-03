-- Add color tracking and prediction fields to existing tables
ALTER TABLE public.raw_materials
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'Natural',
ADD COLUMN IF NOT EXISTS gsm NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 5;

ALTER TABLE public.production_batches
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS predicted_yield INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fabric_used_kg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS wastage_kg NUMERIC DEFAULT 0;

-- Create purchases table for tracking raw material purchases with transport costs
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  material_id UUID REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  rate_per_kg NUMERIC NOT NULL DEFAULT 0,
  transport_cost NUMERIC DEFAULT 0,
  other_costs NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity_kg * rate_per_kg + transport_cost + other_costs) STORED,
  supplier_name TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create batch predictions table
CREATE TABLE IF NOT EXISTS public.batch_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.production_batches(id) ON DELETE CASCADE,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  predicted_quantity INTEGER NOT NULL,
  predicted_cost NUMERIC NOT NULL,
  model_version TEXT DEFAULT 'rule-based-v1',
  confidence_score NUMERIC DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics table for tracking prediction accuracy
CREATE TABLE IF NOT EXISTS public.production_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.production_batches(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  predicted_value NUMERIC,
  actual_value NUMERIC,
  deviation_percent NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN predicted_value > 0 THEN ((actual_value - predicted_value) / predicted_value * 100)
      ELSE 0
    END
  ) STORED,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchases_material_id ON public.purchases(material_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON public.purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_batch_predictions_batch_id ON public.batch_predictions(batch_id);
CREATE INDEX IF NOT EXISTS idx_analytics_batch_id ON public.production_analytics(batch_id);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchases
CREATE POLICY "Admins can view all purchases" ON public.purchases FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert purchases" ON public.purchases FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update purchases" ON public.purchases FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete purchases" ON public.purchases FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for batch_predictions
CREATE POLICY "Admins can view all predictions" ON public.batch_predictions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert predictions" ON public.batch_predictions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update predictions" ON public.batch_predictions FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete predictions" ON public.batch_predictions FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for production_analytics
CREATE POLICY "Admins can view all analytics" ON public.production_analytics FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert analytics" ON public.production_analytics FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update analytics" ON public.production_analytics FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete analytics" ON public.production_analytics FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to auto-generate predictions when batch is created
CREATE OR REPLACE FUNCTION generate_batch_prediction()
RETURNS TRIGGER AS $$
DECLARE
  material_cost NUMERIC;
  estimated_labor NUMERIC;
  estimated_overhead NUMERIC;
  wastage_factor NUMERIC;
BEGIN
  -- Calculate predicted yield (target qty * 0.95 as default)
  NEW.predicted_yield := ROUND(NEW.target_quantity * 0.95);
  
  -- Get material wastage percentage
  SELECT COALESCE(AVG(wastage_percentage), 5) INTO wastage_factor
  FROM public.product_materials pm
  JOIN public.raw_materials rm ON pm.raw_material_id = rm.id
  WHERE pm.product_id = NEW.product_id;
  
  -- Calculate estimated costs
  SELECT COALESCE(SUM(pm.quantity_required * rm.cost_per_unit * NEW.target_quantity * (1 + wastage_factor/100)), 0)
  INTO material_cost
  FROM public.product_materials pm
  JOIN public.raw_materials rm ON pm.raw_material_id = rm.id
  WHERE pm.product_id = NEW.product_id;
  
  estimated_labor := NEW.target_quantity * 15; -- ₹15 per piece labor estimate
  estimated_overhead := material_cost * 0.15; -- 15% overhead
  
  -- Insert prediction record
  INSERT INTO public.batch_predictions (
    batch_id, predicted_quantity, predicted_cost
  ) VALUES (
    NEW.id, 
    NEW.predicted_yield,
    material_cost + estimated_labor + estimated_overhead
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_generate_prediction
  BEFORE INSERT ON public.production_batches
  FOR EACH ROW
  EXECUTE FUNCTION generate_batch_prediction();

-- Function to record analytics when batch is completed
CREATE OR REPLACE FUNCTION record_batch_analytics()
RETURNS TRIGGER AS $$
DECLARE
  pred RECORD;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get prediction data
    SELECT predicted_quantity, predicted_cost INTO pred
    FROM public.batch_predictions
    WHERE batch_id = NEW.id
    ORDER BY prediction_date DESC
    LIMIT 1;
    
    IF pred IS NOT NULL THEN
      -- Record quantity deviation
      INSERT INTO public.production_analytics (batch_id, metric_type, predicted_value, actual_value)
      VALUES (NEW.id, 'quantity', pred.predicted_quantity, NEW.actual_quantity);
      
      -- Record cost deviation
      INSERT INTO public.production_analytics (batch_id, metric_type, predicted_value, actual_value)
      VALUES (NEW.id, 'total_cost', pred.predicted_cost, NEW.total_cost);
      
      -- Record efficiency
      INSERT INTO public.production_analytics (batch_id, metric_type, predicted_value, actual_value)
      VALUES (NEW.id, 'efficiency', 100, (NEW.actual_quantity::NUMERIC / NULLIF(NEW.target_quantity, 0) * 100));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_record_analytics
  AFTER UPDATE ON public.production_batches
  FOR EACH ROW
  EXECUTE FUNCTION record_batch_analytics();