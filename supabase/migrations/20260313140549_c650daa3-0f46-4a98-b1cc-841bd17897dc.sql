CREATE OR REPLACE FUNCTION public.update_job_work_totals()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ops_total numeric;
  v_profit numeric;
  v_pieces integer;
  v_job_work_id uuid;
BEGIN
  v_job_work_id := COALESCE(NEW.job_work_id, OLD.job_work_id);
  
  SELECT COALESCE(SUM(rate_per_piece * quantity), 0)
  INTO v_ops_total
  FROM public.batch_job_work_operations
  WHERE job_work_id = v_job_work_id;

  SELECT COALESCE(company_profit, 0), COALESCE(pieces, 0)
  INTO v_profit, v_pieces
  FROM public.batch_job_works
  WHERE id = v_job_work_id;

  UPDATE public.batch_job_works
  SET total_amount = v_ops_total + (v_profit * v_pieces),
      balance_amount = (v_ops_total + (v_profit * v_pieces)) - paid_amount,
      updated_at = now()
  WHERE id = v_job_work_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;