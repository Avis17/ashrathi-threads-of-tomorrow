-- Create external_job_companies table
CREATE TABLE IF NOT EXISTS public.external_job_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  address text NOT NULL,
  contact_number text NOT NULL,
  contact_person text NOT NULL,
  email text,
  alternate_number text,
  gst_number text,
  upi_id text,
  account_details text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create external_job_orders table
CREATE TABLE IF NOT EXISTS public.external_job_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text UNIQUE NOT NULL,
  company_id uuid REFERENCES public.external_job_companies(id) ON DELETE RESTRICT NOT NULL,
  style_name text NOT NULL,
  number_of_pieces integer NOT NULL CHECK (number_of_pieces > 0),
  delivery_date date NOT NULL,
  accessories_cost numeric DEFAULT 0,
  delivery_charge numeric DEFAULT 0,
  company_profit_type text CHECK (company_profit_type IN ('amount', 'percent')),
  company_profit_value numeric DEFAULT 0,
  rate_per_piece numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  balance_amount numeric DEFAULT 0,
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  job_status text DEFAULT 'pending' CHECK (job_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create external_job_operations table
CREATE TABLE IF NOT EXISTS public.external_job_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id uuid REFERENCES public.external_job_orders(id) ON DELETE CASCADE NOT NULL,
  operation_name text NOT NULL,
  total_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create external_job_operation_categories table
CREATE TABLE IF NOT EXISTS public.external_job_operation_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid REFERENCES public.external_job_operations(id) ON DELETE CASCADE NOT NULL,
  category_name text NOT NULL,
  rate numeric NOT NULL CHECK (rate >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create external_job_payments table
CREATE TABLE IF NOT EXISTS public.external_job_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id uuid REFERENCES public.external_job_orders(id) ON DELETE CASCADE NOT NULL,
  payment_amount numeric NOT NULL CHECK (payment_amount > 0),
  payment_date date DEFAULT CURRENT_DATE,
  payment_mode text DEFAULT 'cash',
  reference_number text,
  notes text,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create external_job_invoices table
CREATE TABLE IF NOT EXISTS public.external_job_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id uuid REFERENCES public.external_job_orders(id) ON DELETE CASCADE NOT NULL,
  invoice_number text UNIQUE NOT NULL,
  invoice_date date DEFAULT CURRENT_DATE,
  invoice_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_job_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_job_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_job_operation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_job_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_job_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only)
CREATE POLICY "Admins can manage external_job_companies"
  ON public.external_job_companies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage external_job_orders"
  ON public.external_job_orders FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage external_job_operations"
  ON public.external_job_operations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage external_job_operation_categories"
  ON public.external_job_operation_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage external_job_payments"
  ON public.external_job_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage external_job_invoices"
  ON public.external_job_invoices FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_external_job_companies_updated_at
  BEFORE UPDATE ON public.external_job_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_job_orders_updated_at
  BEFORE UPDATE ON public.external_job_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-calculate totals
CREATE OR REPLACE FUNCTION calculate_external_job_order_totals()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_external_job_order_totals_trigger
  BEFORE INSERT OR UPDATE ON public.external_job_orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_external_job_order_totals();

-- Function to update job order paid amount when payment is added
CREATE OR REPLACE FUNCTION update_external_job_order_payment()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_external_job_order_payment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.external_job_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_external_job_order_payment();