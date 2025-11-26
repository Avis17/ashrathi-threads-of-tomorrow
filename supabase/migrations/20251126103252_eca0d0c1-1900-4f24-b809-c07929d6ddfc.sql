-- Create external_job_rate_cards table
CREATE TABLE IF NOT EXISTS public.external_job_rate_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_id TEXT NOT NULL UNIQUE,
  style_name TEXT NOT NULL,
  category TEXT NOT NULL,
  operations_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  accessories_cost NUMERIC NOT NULL DEFAULT 0,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  company_profit_type TEXT,
  company_profit_value NUMERIC DEFAULT 0,
  rate_per_piece NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_job_rate_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins only
CREATE POLICY "Admins can manage external_job_rate_cards"
  ON public.external_job_rate_cards
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index on style_id for faster lookups
CREATE INDEX idx_external_job_rate_cards_style_id ON public.external_job_rate_cards(style_id);

-- Create index on category for filtering
CREATE INDEX idx_external_job_rate_cards_category ON public.external_job_rate_cards(category);

-- Create trigger to update updated_at
CREATE TRIGGER update_external_job_rate_cards_updated_at
  BEFORE UPDATE ON public.external_job_rate_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();