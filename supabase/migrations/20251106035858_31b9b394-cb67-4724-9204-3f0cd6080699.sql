-- Job Orders Schema

-- 1) Main job orders table
CREATE TABLE IF NOT EXISTS public.job_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_company TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_number TEXT NULL,
  job_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  total_pieces INTEGER NOT NULL,
  delivery_date DATE NOT NULL,
  start_date DATE NOT NULL,
  remarks TEXT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  overall_progress NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Processes table
CREATE TABLE IF NOT EXISTS public.job_order_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id UUID NOT NULL REFERENCES public.job_orders(id) ON DELETE CASCADE,
  process_name TEXT NOT NULL,
  rate_per_piece NUMERIC NOT NULL DEFAULT 0,
  total_pieces INTEGER NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  assigned_labour TEXT[] NOT NULL DEFAULT '{}',
  completion_percent NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ NULL,
  ended_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_order_processes_order_id ON public.job_order_processes(job_order_id);

-- 3) Labours table
CREATE TABLE IF NOT EXISTS public.job_order_labours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id UUID NOT NULL REFERENCES public.job_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  process_assigned TEXT NOT NULL,
  rate_per_piece NUMERIC NOT NULL DEFAULT 0,
  total_pieces INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_order_labours_order_id ON public.job_order_labours(job_order_id);

-- 4) Cost summary table (1:1 with job_orders)
CREATE TABLE IF NOT EXISTS public.job_order_cost_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id UUID NOT NULL UNIQUE REFERENCES public.job_orders(id) ON DELETE CASCADE,
  material_cost NUMERIC NOT NULL DEFAULT 0,
  labour_cost NUMERIC NOT NULL DEFAULT 0,
  transport_cost NUMERIC NOT NULL DEFAULT 0,
  misc_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_order_cost_summary_order_id ON public.job_order_cost_summary(job_order_id);

-- Triggers and helper functions

-- Update updated_at for job_orders and cost_summary
DROP TRIGGER IF EXISTS trg_job_orders_updated_at ON public.job_orders;
CREATE TRIGGER trg_job_orders_updated_at
BEFORE UPDATE ON public.job_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_job_order_cost_summary_updated_at ON public.job_order_cost_summary;
CREATE TRIGGER trg_job_order_cost_summary_updated_at
BEFORE UPDATE ON public.job_order_cost_summary
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Compute total_cost for processes (rate * pieces)
CREATE OR REPLACE FUNCTION public.compute_process_total_cost()
RETURNS trigger AS $$
BEGIN
  NEW.total_cost := COALESCE(NEW.rate_per_piece,0) * COALESCE(NEW.total_pieces,0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_processes_compute_total ON public.job_order_processes;
CREATE TRIGGER trg_processes_compute_total
BEFORE INSERT OR UPDATE ON public.job_order_processes
FOR EACH ROW EXECUTE FUNCTION public.compute_process_total_cost();

-- Compute labour total amount (rate * pieces)
CREATE OR REPLACE FUNCTION public.compute_labour_total_amount()
RETURNS trigger AS $$
BEGIN
  NEW.total_amount := COALESCE(NEW.rate_per_piece,0) * COALESCE(NEW.total_pieces,0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_labours_compute_total ON public.job_order_labours;
CREATE TRIGGER trg_labours_compute_total
BEFORE INSERT OR UPDATE ON public.job_order_labours
FOR EACH ROW EXECUTE FUNCTION public.compute_labour_total_amount();

-- Recalculate overall progress for a job order (avg of processes)
CREATE OR REPLACE FUNCTION public.recalc_job_order_progress(p_job_order_id uuid)
RETURNS void AS $$
DECLARE
  v_progress NUMERIC;
BEGIN
  SELECT COALESCE(AVG(completion_percent), 0) INTO v_progress
  FROM public.job_order_processes
  WHERE job_order_id = p_job_order_id;

  UPDATE public.job_orders
  SET overall_progress = COALESCE(v_progress,0)
  WHERE id = p_job_order_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to call progress recompute after changes in processes
CREATE OR REPLACE FUNCTION public.after_processes_change()
RETURNS trigger AS $$
BEGIN
  PERFORM public.recalc_job_order_progress(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.job_order_id ELSE NEW.job_order_id END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_processes_after_change ON public.job_order_processes;
CREATE TRIGGER trg_processes_after_change
AFTER INSERT OR UPDATE OR DELETE ON public.job_order_processes
FOR EACH ROW EXECUTE FUNCTION public.after_processes_change();

-- Update labour_cost and total_cost in cost summary when labours change
CREATE OR REPLACE FUNCTION public.refresh_cost_summary_labour(p_job_order_id uuid)
RETURNS void AS $$
DECLARE
  v_labour NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_amount),0) INTO v_labour
  FROM public.job_order_labours
  WHERE job_order_id = p_job_order_id;

  UPDATE public.job_order_cost_summary
  SET labour_cost = v_labour,
      total_cost = COALESCE(material_cost,0) + v_labour + COALESCE(transport_cost,0) + COALESCE(misc_cost,0)
  WHERE job_order_id = p_job_order_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.after_labours_change()
RETURNS trigger AS $$
BEGIN
  PERFORM public.refresh_cost_summary_labour(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.job_order_id ELSE NEW.job_order_id END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_labours_after_change ON public.job_order_labours;
CREATE TRIGGER trg_labours_after_change
AFTER INSERT OR UPDATE OR DELETE ON public.job_order_labours
FOR EACH ROW EXECUTE FUNCTION public.after_labours_change();

-- Compute total in cost summary when values change directly
CREATE OR REPLACE FUNCTION public.compute_cost_summary_total()
RETURNS trigger AS $$
BEGIN
  NEW.total_cost := COALESCE(NEW.material_cost,0) + COALESCE(NEW.labour_cost,0) + COALESCE(NEW.transport_cost,0) + COALESCE(NEW.misc_cost,0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_cost_summary_compute_total ON public.job_order_cost_summary;
CREATE TRIGGER trg_cost_summary_compute_total
BEFORE INSERT OR UPDATE ON public.job_order_cost_summary
FOR EACH ROW EXECUTE FUNCTION public.compute_cost_summary_total();

-- RLS
ALTER TABLE public.job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_order_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_order_labours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_order_cost_summary ENABLE ROW LEVEL SECURITY;

-- Admin manage policies
DROP POLICY IF EXISTS "Admins can manage job_orders" ON public.job_orders;
CREATE POLICY "Admins can manage job_orders" ON public.job_orders
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage job_order_processes" ON public.job_order_processes;
CREATE POLICY "Admins can manage job_order_processes" ON public.job_order_processes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage job_order_labours" ON public.job_order_labours;
CREATE POLICY "Admins can manage job_order_labours" ON public.job_order_labours
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage job_order_cost_summary" ON public.job_order_cost_summary;
CREATE POLICY "Admins can manage job_order_cost_summary" ON public.job_order_cost_summary
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));