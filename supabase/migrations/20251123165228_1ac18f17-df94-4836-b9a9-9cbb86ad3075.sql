-- Fix search_path for external job order functions
DROP FUNCTION IF EXISTS calculate_external_job_order_totals() CASCADE;
CREATE OR REPLACE FUNCTION calculate_external_job_order_totals()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.balance_amount := NEW.total_amount - COALESCE(NEW.paid_amount, 0);
  
  IF NEW.balance_amount = 0 THEN
    NEW.payment_status := 'paid';
  ELSIF NEW.paid_amount > 0 THEN
    NEW.payment_status := 'partial';
  ELSE
    NEW.payment_status := 'unpaid';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_external_job_order_totals_trigger
  BEFORE INSERT OR UPDATE ON public.external_job_orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_external_job_order_totals();

DROP FUNCTION IF EXISTS update_external_job_order_payment() CASCADE;
CREATE OR REPLACE FUNCTION update_external_job_order_payment()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.external_job_orders
    SET paid_amount = paid_amount + NEW.payment_amount
    WHERE id = NEW.job_order_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.external_job_orders
    SET paid_amount = paid_amount - OLD.payment_amount
    WHERE id = OLD.job_order_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.external_job_orders
    SET paid_amount = paid_amount - OLD.payment_amount + NEW.payment_amount
    WHERE id = NEW.job_order_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_external_job_order_payment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.external_job_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_external_job_order_payment();