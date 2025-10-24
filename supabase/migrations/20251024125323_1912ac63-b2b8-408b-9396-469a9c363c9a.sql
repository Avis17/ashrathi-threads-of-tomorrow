-- Fix search path for check_main_building function
DROP TRIGGER IF EXISTS enforce_single_main_building ON public.branches;
DROP FUNCTION IF EXISTS check_main_building();

CREATE OR REPLACE FUNCTION check_main_building()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_main_building = true THEN
    IF EXISTS (
      SELECT 1 FROM public.branches 
      WHERE is_main_building = true 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Only one main building is allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_single_main_building
BEFORE INSERT OR UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION check_main_building();