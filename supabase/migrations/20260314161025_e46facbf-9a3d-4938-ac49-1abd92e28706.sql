
CREATE OR REPLACE FUNCTION public.update_job_work_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_ops_total numeric;
  v_profit numeric;
  v_pieces integer;
  v_confirmed jsonb;
  v_job_work_id uuid;
  v_billable_total numeric;
  v_top_rate numeric;
  v_pant_rate numeric;
  v_top_count integer;
  v_pant_count integer;
BEGIN
  v_job_work_id := COALESCE(NEW.job_work_id, OLD.job_work_id);
  
  SELECT COALESCE(SUM(rate_per_piece * quantity), 0)
  INTO v_ops_total
  FROM public.batch_job_work_operations
  WHERE job_work_id = v_job_work_id;

  SELECT COALESCE(company_profit, 0), COALESCE(pieces, 0), confirmed_return_pieces
  INTO v_profit, v_pieces, v_confirmed
  FROM public.batch_job_works
  WHERE id = v_job_work_id;

  IF v_confirmed IS NOT NULL THEN
    IF v_confirmed ? 'top' AND v_confirmed ? 'pant' THEN
      v_top_count := COALESCE((v_confirmed->>'top')::integer, 0);
      v_pant_count := COALESCE((v_confirmed->>'pant')::integer, 0);
      
      SELECT COALESCE(rate_per_piece, 0) INTO v_top_rate
      FROM public.batch_job_work_operations
      WHERE job_work_id = v_job_work_id AND operation ILIKE '%Top%'
      LIMIT 1;
      
      SELECT COALESCE(rate_per_piece, 0) INTO v_pant_rate
      FROM public.batch_job_work_operations
      WHERE job_work_id = v_job_work_id AND operation ILIKE '%Pant%'
      LIMIT 1;
      
      v_top_rate := COALESCE(v_top_rate, 0);
      v_pant_rate := COALESCE(v_pant_rate, 0);
      
      v_billable_total := (v_top_rate * v_top_count) + (v_pant_rate * v_pant_count) + (v_profit * GREATEST(v_top_count, v_pant_count));
    ELSE
      v_billable_total := (CASE WHEN v_pieces > 0 THEN v_ops_total / v_pieces ELSE 0 END + v_profit) * COALESCE((v_confirmed->>'total')::integer, v_pieces);
    END IF;
  ELSE
    v_billable_total := v_ops_total + (v_profit * v_pieces);
  END IF;

  UPDATE public.batch_job_works
  SET total_amount = v_billable_total,
      balance_amount = v_billable_total - paid_amount,
      updated_at = now()
  WHERE id = v_job_work_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.recalc_job_work_on_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_ops_total numeric;
  v_profit numeric;
  v_pieces integer;
  v_confirmed jsonb;
  v_billable_total numeric;
  v_top_rate numeric;
  v_pant_rate numeric;
  v_top_count integer;
  v_pant_count integer;
BEGIN
  IF (OLD.confirmed_return_pieces IS DISTINCT FROM NEW.confirmed_return_pieces) OR (OLD.company_profit IS DISTINCT FROM NEW.company_profit) THEN
    SELECT COALESCE(SUM(rate_per_piece * quantity), 0)
    INTO v_ops_total
    FROM public.batch_job_work_operations
    WHERE job_work_id = NEW.id;

    v_profit := COALESCE(NEW.company_profit, 0);
    v_pieces := COALESCE(NEW.pieces, 0);
    v_confirmed := NEW.confirmed_return_pieces;

    IF v_confirmed IS NOT NULL THEN
      IF v_confirmed ? 'top' AND v_confirmed ? 'pant' THEN
        v_top_count := COALESCE((v_confirmed->>'top')::integer, 0);
        v_pant_count := COALESCE((v_confirmed->>'pant')::integer, 0);
        
        SELECT COALESCE(rate_per_piece, 0) INTO v_top_rate
        FROM public.batch_job_work_operations
        WHERE job_work_id = NEW.id AND operation ILIKE '%Top%'
        LIMIT 1;
        
        SELECT COALESCE(rate_per_piece, 0) INTO v_pant_rate
        FROM public.batch_job_work_operations
        WHERE job_work_id = NEW.id AND operation ILIKE '%Pant%'
        LIMIT 1;
        
        v_top_rate := COALESCE(v_top_rate, 0);
        v_pant_rate := COALESCE(v_pant_rate, 0);
        
        v_billable_total := (v_top_rate * v_top_count) + (v_pant_rate * v_pant_count) + (v_profit * GREATEST(v_top_count, v_pant_count));
      ELSE
        v_billable_total := (CASE WHEN v_pieces > 0 THEN v_ops_total / v_pieces ELSE 0 END + v_profit) * COALESCE((v_confirmed->>'total')::integer, v_pieces);
      END IF;
    ELSE
      v_billable_total := v_ops_total + (v_profit * v_pieces);
    END IF;

    NEW.total_amount := v_billable_total;
    NEW.balance_amount := v_billable_total - NEW.paid_amount;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalc_job_work_on_update ON public.batch_job_works;
CREATE TRIGGER trg_recalc_job_work_on_update
  BEFORE UPDATE ON public.batch_job_works
  FOR EACH ROW
  EXECUTE FUNCTION public.recalc_job_work_on_update();
