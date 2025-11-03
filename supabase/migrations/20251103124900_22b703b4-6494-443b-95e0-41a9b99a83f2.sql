-- Add code generators and triggers for codes
CREATE OR REPLACE FUNCTION public.generate_purchase_batch_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_str TEXT;
  seq INT;
BEGIN
  year_str := to_char(current_date,'YYYY');
  SELECT COALESCE(MAX((regexp_replace(batch_code, '^PB-'||year_str||'-',''))::int),0)+1
    INTO seq
  FROM public.purchase_batches
  WHERE batch_code LIKE 'PB-'||year_str||'-%';
  RETURN 'PB-'||year_str||'-'||LPAD(seq::text,4,'0');
END;$$;

CREATE OR REPLACE FUNCTION public.set_purchase_batch_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.batch_code IS NULL OR NEW.batch_code = '' THEN
    NEW.batch_code := public.generate_purchase_batch_code();
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_set_purchase_batch_code ON public.purchase_batches;
CREATE TRIGGER trg_set_purchase_batch_code
BEFORE INSERT ON public.purchase_batches
FOR EACH ROW
EXECUTE FUNCTION public.set_purchase_batch_code();

-- Production run code
CREATE OR REPLACE FUNCTION public.generate_production_run_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_str TEXT;
  seq INT;
BEGIN
  year_str := to_char(current_date,'YYYY');
  SELECT COALESCE(MAX((regexp_replace(run_code, '^PR-'||year_str||'-',''))::int),0)+1
    INTO seq
  FROM public.production_runs
  WHERE run_code LIKE 'PR-'||year_str||'-%';
  RETURN 'PR-'||year_str||'-'||LPAD(seq::text,4,'0');
END;$$;

CREATE OR REPLACE FUNCTION public.set_production_run_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.run_code IS NULL OR NEW.run_code = '' THEN
    NEW.run_code := public.generate_production_run_code();
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_set_production_run_code ON public.production_runs;
CREATE TRIGGER trg_set_production_run_code
BEFORE INSERT ON public.production_runs
FOR EACH ROW
EXECUTE FUNCTION public.set_production_run_code();