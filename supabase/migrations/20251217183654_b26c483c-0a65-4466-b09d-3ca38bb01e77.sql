
-- Create suppliers table for PO system
CREATE TABLE public.po_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id UUID REFERENCES public.po_suppliers(id),
  category TEXT NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'cash',
  gst_type TEXT NOT NULL DEFAULT 'non_gst',
  invoice_number TEXT,
  invoice_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  cgst_rate NUMERIC DEFAULT 0,
  cgst_amount NUMERIC DEFAULT 0,
  sgst_rate NUMERIC DEFAULT 0,
  sgst_amount NUMERIC DEFAULT 0,
  igst_rate NUMERIC DEFAULT 0,
  igst_amount NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create po_line_items table
CREATE TABLE public.po_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'piece',
  rate NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create po_files table for bill uploads
CREATE TABLE public.po_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create PO number sequence function
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_str TEXT;
  seq INT;
BEGIN
  year_str := to_char(current_date, 'YYYY');
  SELECT COALESCE(MAX((regexp_replace(po_number, '^FF-PO-' || year_str || '-', ''))::int), 0) + 1
    INTO seq
  FROM public.purchase_orders
  WHERE po_number LIKE 'FF-PO-' || year_str || '-%';
  RETURN 'FF-PO-' || year_str || '-' || LPAD(seq::text, 4, '0');
END;
$$;

-- Trigger to auto-generate PO number
CREATE OR REPLACE FUNCTION public.set_po_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
    NEW.po_number := public.generate_po_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_po_number
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_po_number();

-- Updated_at trigger for po_suppliers
CREATE TRIGGER update_po_suppliers_updated_at
  BEFORE UPDATE ON public.po_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for purchase_orders
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.po_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage po_suppliers"
  ON public.po_suppliers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage purchase_orders"
  ON public.purchase_orders FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage po_line_items"
  ON public.po_line_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage po_files"
  ON public.po_files FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for purchase bills
INSERT INTO storage.buckets (id, name, public) VALUES ('purchase-bills', 'purchase-bills', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins can upload purchase bills"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'purchase-bills' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view purchase bills"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'purchase-bills' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete purchase bills"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'purchase-bills' AND has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_po_number ON public.purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_purchase_date ON public.purchase_orders(purchase_date);
CREATE INDEX idx_po_line_items_purchase_order_id ON public.po_line_items(purchase_order_id);
CREATE INDEX idx_po_files_purchase_order_id ON public.po_files(purchase_order_id);
