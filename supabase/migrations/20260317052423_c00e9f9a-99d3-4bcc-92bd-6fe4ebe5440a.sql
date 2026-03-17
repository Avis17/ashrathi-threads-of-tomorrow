ALTER TABLE public.batch_delivery_info 
  ADD COLUMN IF NOT EXISTS manual_fabric_weight_kg numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS weight_adjustment_kg numeric DEFAULT 0;