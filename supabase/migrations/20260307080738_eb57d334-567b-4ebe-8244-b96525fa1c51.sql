
-- Create debit_notes table
CREATE TABLE public.debit_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debit_note_no TEXT NOT NULL,
  debit_note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  original_invoice_no TEXT,
  original_invoice_date DATE,
  party_name TEXT NOT NULL,
  party_address TEXT,
  party_gstin TEXT,
  party_state TEXT,
  party_state_code TEXT,
  reason TEXT,
  tax_type TEXT NOT NULL DEFAULT 'intra',
  cgst_rate NUMERIC NOT NULL DEFAULT 9,
  sgst_rate NUMERIC NOT NULL DEFAULT 9,
  igst_rate NUMERIC NOT NULL DEFAULT 18,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  cgst_amount NUMERIC NOT NULL DEFAULT 0,
  sgst_amount NUMERIC NOT NULL DEFAULT 0,
  igst_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create debit_note_items table
CREATE TABLE public.debit_note_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debit_note_id UUID NOT NULL REFERENCES public.debit_notes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hsn_code TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  rate NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_note_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for authenticated users
CREATE POLICY "Authenticated users can manage debit notes" ON public.debit_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage debit note items" ON public.debit_note_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
