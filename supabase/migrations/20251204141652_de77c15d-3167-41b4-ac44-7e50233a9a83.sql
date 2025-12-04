-- Drop and recreate the trigger function to NOT auto-update payment_status
-- This allows users to manually set payment status without it being overwritten

CREATE OR REPLACE FUNCTION public.calculate_external_job_order_totals()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only calculate balance_amount, do NOT auto-update payment_status
  -- Users can manually control the payment_status
  NEW.balance_amount := NEW.total_amount - COALESCE(NEW.paid_amount, 0);
  
  RETURN NEW;
END;
$function$;