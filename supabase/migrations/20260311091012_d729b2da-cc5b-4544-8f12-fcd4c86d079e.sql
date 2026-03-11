
CREATE OR REPLACE FUNCTION public.update_dc_total_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.delivery_challans
    SET total_quantity = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM public.delivery_challan_items
      WHERE delivery_challan_id = OLD.delivery_challan_id
    )
    WHERE id = OLD.delivery_challan_id;
    RETURN OLD;
  ELSE
    UPDATE public.delivery_challans
    SET total_quantity = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM public.delivery_challan_items
      WHERE delivery_challan_id = NEW.delivery_challan_id
    )
    WHERE id = NEW.delivery_challan_id;
    RETURN NEW;
  END IF;
END;
$function$;

-- Fix existing staff DCs with 0 total_quantity
UPDATE public.delivery_challans dc
SET total_quantity = (
  SELECT COALESCE(SUM(quantity), 0)
  FROM public.delivery_challan_items dci
  WHERE dci.delivery_challan_id = dc.id
)
WHERE dc.source = 'staff' AND dc.total_quantity = 0;
