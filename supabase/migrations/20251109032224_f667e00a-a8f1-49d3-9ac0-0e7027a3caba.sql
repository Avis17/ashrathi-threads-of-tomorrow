-- Function to restore inventory when order is cancelled
CREATE OR REPLACE FUNCTION public.restore_inventory_on_cancel(
  p_product_id uuid,
  p_size text,
  p_color text,
  p_quantity integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_inventory
  SET ordered_quantity = GREATEST(0, ordered_quantity - p_quantity)
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN TRUE;
END;
$$;