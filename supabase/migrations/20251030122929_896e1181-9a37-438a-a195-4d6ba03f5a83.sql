-- Create trigger to auto-calculate costs when batch status changes to completed
CREATE OR REPLACE FUNCTION auto_calculate_costs_on_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only calculate when status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM calculate_batch_costs(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_calculate_batch_costs
AFTER UPDATE OF status ON public.production_batches
FOR EACH ROW
EXECUTE FUNCTION auto_calculate_costs_on_complete();

-- Create validation function to check if costs are recorded
CREATE OR REPLACE FUNCTION validate_batch_costs(batch_id UUID)
RETURNS TABLE(
  has_material_costs BOOLEAN,
  has_labor_costs BOOLEAN,
  has_overhead_costs BOOLEAN,
  material_count BIGINT,
  labor_count BIGINT,
  overhead_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS(SELECT 1 FROM public.production_material_usage WHERE production_batch_id = batch_id),
    EXISTS(SELECT 1 FROM public.production_labor_costs WHERE production_batch_id = batch_id),
    EXISTS(SELECT 1 FROM public.production_overhead_costs WHERE production_batch_id = batch_id),
    (SELECT COUNT(*) FROM public.production_material_usage WHERE production_batch_id = batch_id),
    (SELECT COUNT(*) FROM public.production_labor_costs WHERE production_batch_id = batch_id),
    (SELECT COUNT(*) FROM public.production_overhead_costs WHERE production_batch_id = batch_id);
END;
$$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_material_usage_batch ON public.production_material_usage(production_batch_id);
CREATE INDEX IF NOT EXISTS idx_labor_costs_batch ON public.production_labor_costs(production_batch_id);
CREATE INDEX IF NOT EXISTS idx_overhead_costs_batch ON public.production_overhead_costs(production_batch_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON public.production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batches_product ON public.production_batches(product_id);