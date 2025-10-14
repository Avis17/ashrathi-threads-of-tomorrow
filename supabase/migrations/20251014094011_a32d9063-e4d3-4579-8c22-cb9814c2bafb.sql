-- Fix function search_path warning for generate_order_number
-- First remove the default constraint
ALTER TABLE public.orders ALTER COLUMN order_number DROP DEFAULT;

-- Drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
END;
$$;

-- Restore the default constraint
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT public.generate_order_number();