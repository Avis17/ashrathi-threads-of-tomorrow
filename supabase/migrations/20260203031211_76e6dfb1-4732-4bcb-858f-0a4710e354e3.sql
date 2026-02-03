-- Create CMT quotations table
CREATE TABLE public.cmt_quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_no TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  valid_until DATE NOT NULL,
  
  -- Buyer Details
  buyer_name TEXT NOT NULL,
  buyer_address TEXT,
  contact_person_name TEXT,
  contact_person_phone TEXT,
  
  -- Style Details
  style_name TEXT NOT NULL,
  style_code TEXT,
  fabric_type TEXT,
  gsm TEXT,
  fit_type TEXT,
  size_range TEXT,
  order_quantity INTEGER DEFAULT 0,
  
  -- Operations & Trims (stored as JSONB)
  operations JSONB DEFAULT '[]'::jsonb,
  trims JSONB DEFAULT '[]'::jsonb,
  
  -- Cost Summary
  total_stitching_cost NUMERIC(10,2) DEFAULT 0,
  finishing_packing_cost NUMERIC(10,2) DEFAULT 0,
  overheads_cost NUMERIC(10,2) DEFAULT 0,
  company_profit_percent NUMERIC(5,2) DEFAULT 0,
  final_cmt_per_piece NUMERIC(10,2) DEFAULT 0,
  total_order_value NUMERIC(12,2) DEFAULT 0,
  
  -- Terms & Signatory
  terms_and_conditions TEXT,
  signatory_name TEXT DEFAULT 'For Feather Fashions',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.cmt_quotations ENABLE ROW LEVEL SECURITY;

-- Create policies (allow authenticated users full access for now)
CREATE POLICY "Authenticated users can view all CMT quotations"
  ON public.cmt_quotations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create CMT quotations"
  ON public.cmt_quotations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update CMT quotations"
  ON public.cmt_quotations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete CMT quotations"
  ON public.cmt_quotations FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_cmt_quotations_updated_at
  BEFORE UPDATE ON public.cmt_quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_cmt_quotations_quotation_no ON public.cmt_quotations(quotation_no);
CREATE INDEX idx_cmt_quotations_buyer_name ON public.cmt_quotations(buyer_name);
CREATE INDEX idx_cmt_quotations_created_at ON public.cmt_quotations(created_at DESC);