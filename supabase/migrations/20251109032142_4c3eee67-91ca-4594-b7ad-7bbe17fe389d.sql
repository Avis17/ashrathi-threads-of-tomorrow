-- Create RPC functions to atomically update inventory reservations

-- Function to reserve inventory (increase reserved_quantity)
CREATE OR REPLACE FUNCTION public.reserve_inventory(
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
  SET reserved_quantity = reserved_quantity + p_quantity
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN TRUE;
END;
$$;

-- Function to release inventory (decrease reserved_quantity)
CREATE OR REPLACE FUNCTION public.release_inventory(
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
  SET reserved_quantity = GREATEST(0, reserved_quantity - p_quantity)
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN TRUE;
END;
$$;

-- Function to convert reserved to ordered (on order placement)
CREATE OR REPLACE FUNCTION public.convert_reserved_to_ordered(
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
  SET reserved_quantity = GREATEST(0, reserved_quantity - p_quantity),
      ordered_quantity = ordered_quantity + p_quantity
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN TRUE;
END;
$$;