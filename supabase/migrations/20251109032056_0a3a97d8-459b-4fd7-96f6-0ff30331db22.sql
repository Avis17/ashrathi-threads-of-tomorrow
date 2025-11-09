-- Create trigger function to auto-calculate available_quantity
CREATE OR REPLACE FUNCTION public.update_available_quantity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.available_quantity := NEW.original_quantity - NEW.reserved_quantity - NEW.ordered_quantity;
  
  -- Ensure available_quantity doesn't go negative
  IF NEW.available_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient inventory: available_quantity cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on product_inventory to auto-calculate available_quantity
DROP TRIGGER IF EXISTS trigger_update_available_quantity ON public.product_inventory;
CREATE TRIGGER trigger_update_available_quantity
  BEFORE INSERT OR UPDATE OF original_quantity, reserved_quantity, ordered_quantity
  ON public.product_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_available_quantity();

-- Update existing records to recalculate available_quantity
UPDATE public.product_inventory
SET available_quantity = original_quantity - reserved_quantity - ordered_quantity;