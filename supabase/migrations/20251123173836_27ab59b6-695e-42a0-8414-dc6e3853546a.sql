-- Create job order invoice settings table
CREATE TABLE IF NOT EXISTS public.job_order_invoice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_invoice_number integer NOT NULL DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

-- Insert default row
INSERT INTO public.job_order_invoice_settings (current_invoice_number)
VALUES (1)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.job_order_invoice_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Admins can manage job_order_invoice_settings"
  ON public.job_order_invoice_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_job_order_invoice_settings_updated_at
  BEFORE UPDATE ON public.job_order_invoice_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();