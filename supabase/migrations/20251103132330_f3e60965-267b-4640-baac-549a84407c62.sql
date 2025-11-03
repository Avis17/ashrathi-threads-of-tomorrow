-- Add labor unit tracking (piece/shift wise) to batch_costs
ALTER TABLE public.batch_costs
ADD COLUMN unit_type text,
ADD COLUMN quantity numeric,
ADD COLUMN rate_per_unit numeric;

COMMENT ON COLUMN public.batch_costs.unit_type IS 'Unit type for labor costs: piece or shift';
COMMENT ON COLUMN public.batch_costs.quantity IS 'Number of pieces or shifts';
COMMENT ON COLUMN public.batch_costs.rate_per_unit IS 'Rate per piece or per shift';

-- Add cut_quantity to production_batches to track pieces after cutting
ALTER TABLE public.production_batches
ADD COLUMN cut_quantity integer DEFAULT 0;

COMMENT ON COLUMN public.production_batches.cut_quantity IS 'Actual pieces counted after cutting stage';