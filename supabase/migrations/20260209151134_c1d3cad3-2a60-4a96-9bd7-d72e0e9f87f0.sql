
-- E-Way Bill table
CREATE TABLE public.dc_eway_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_challan_id UUID NOT NULL REFERENCES public.delivery_challans(id) ON DELETE CASCADE,
  eway_bill_no TEXT,
  eway_bill_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_upto TIMESTAMP WITH TIME ZONE,
  generated_by_gstin TEXT,
  supply_type TEXT DEFAULT 'Outward-Supply',
  mode TEXT DEFAULT '1 - Road',
  approx_distance TEXT,
  transaction_type TEXT DEFAULT 'Regular',
  
  -- From details
  from_name TEXT,
  from_gstin TEXT,
  from_state TEXT,
  from_address TEXT,
  
  -- To details
  to_name TEXT DEFAULT 'Feather Fashions',
  to_gstin TEXT DEFAULT '33FWTPS1281P1ZJ',
  to_state TEXT DEFAULT 'Tamil Nadu',
  to_address TEXT DEFAULT '251/1, Vadivel Nagar, Tiruppur, Tamil Nadu 641602',
  
  -- Dispatch / Ship
  dispatch_from TEXT,
  ship_to TEXT,
  
  -- Goods details
  hsn_code TEXT,
  product_description TEXT,
  quantity NUMERIC DEFAULT 0,
  uom TEXT DEFAULT 'KGS',
  taxable_amount NUMERIC DEFAULT 0,
  tax_rate_cgst NUMERIC DEFAULT 0,
  tax_rate_sgst NUMERIC DEFAULT 0,
  cgst_amount NUMERIC DEFAULT 0,
  sgst_amount NUMERIC DEFAULT 0,
  other_amount NUMERIC DEFAULT 0,
  total_invoice_amount NUMERIC DEFAULT 0,
  
  -- Tax invoice reference
  tax_invoice_no TEXT,
  tax_invoice_date DATE,
  irn TEXT,
  ack_no TEXT,
  ack_date DATE,
  
  -- Transport details
  transporter_id TEXT,
  transporter_name TEXT,
  doc_no TEXT,
  doc_date DATE,
  vehicle_no TEXT,
  vehicle_from TEXT,
  cewb_no TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dc_eway_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage eway bills"
ON public.dc_eway_bills FOR ALL
USING (true)
WITH CHECK (true);

-- Production Planning Sheet table
CREATE TABLE public.dc_production_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_challan_id UUID NOT NULL REFERENCES public.delivery_challans(id) ON DELETE CASCADE,
  pgm_no TEXT,
  plan_date DATE DEFAULT CURRENT_DATE,
  
  -- Basic info
  follow_up_by TEXT,
  supplier TEXT DEFAULT 'Feather Fashions',
  ic_no TEXT,
  item_name TEXT,
  sizes TEXT,
  side_cut_style TEXT,
  
  -- Fabric details
  fabric_details TEXT,
  
  -- Details / Approvals (checklist booleans)
  original_pattern BOOLEAN DEFAULT false,
  traced_pattern BOOLEAN DEFAULT false,
  original_sample BOOLEAN DEFAULT false,
  first_sample_approval BOOLEAN DEFAULT false,
  main_label BOOLEAN DEFAULT false,
  care_label BOOLEAN DEFAULT false,
  fusing_sticker BOOLEAN DEFAULT false,
  flag_label BOOLEAN DEFAULT false,
  rope BOOLEAN DEFAULT false,
  button BOOLEAN DEFAULT false,
  metal_badges BOOLEAN DEFAULT false,
  zippers BOOLEAN DEFAULT false,
  
  -- People
  follow_up_person TEXT,
  qc_person TEXT,
  others_detail TEXT,
  
  -- Post production
  print_detail TEXT,
  embroidery_detail TEXT,
  stone_detail TEXT,
  fusing_detail TEXT,
  coin_detail TEXT,
  others_post_production TEXT,
  
  -- Packing method approvals
  packing_type TEXT,
  poly_bag BOOLEAN DEFAULT false,
  atta BOOLEAN DEFAULT false,
  photo BOOLEAN DEFAULT false,
  tag BOOLEAN DEFAULT false,
  box BOOLEAN DEFAULT false,
  
  -- Special instructions
  special_instructions TEXT,
  
  -- Approval fields
  seal_original BOOLEAN DEFAULT false,
  mchart_original BOOLEAN DEFAULT false,
  ic_original BOOLEAN DEFAULT false,
  name_original TEXT,
  sign_original TEXT,
  
  seal_traced BOOLEAN DEFAULT false,
  mchart_traced BOOLEAN DEFAULT false,
  ic_traced BOOLEAN DEFAULT false,
  name_traced TEXT,
  sign_traced TEXT,
  
  authorised_sign_1 TEXT,
  authorised_sign_2 TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dc_production_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage production plans"
ON public.dc_production_plans FOR ALL
USING (true)
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_dc_eway_bills_updated_at
  BEFORE UPDATE ON public.dc_eway_bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dc_production_plans_updated_at
  BEFORE UPDATE ON public.dc_production_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
