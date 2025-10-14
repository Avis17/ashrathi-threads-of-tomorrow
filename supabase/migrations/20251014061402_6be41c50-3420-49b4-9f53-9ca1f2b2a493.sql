-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  gst_number TEXT,
  address_1 TEXT NOT NULL,
  address_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invoice_number INTEGER NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  invoice_type TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  delivery_address TEXT NOT NULL,
  purchase_order_no TEXT,
  number_of_packages INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  cgst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  cgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sgst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  sgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  igst_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  igst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated'
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  hsn_code TEXT NOT NULL,
  product_code TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL
);

-- Create invoice_settings table
CREATE TABLE public.invoice_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_invoice_number INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial invoice settings
INSERT INTO public.invoice_settings (current_invoice_number) VALUES (1);

-- Add new columns to products table
ALTER TABLE public.products
ADD COLUMN hsn_code TEXT,
ADD COLUMN product_code TEXT,
ADD COLUMN price DECIMAL(10, 2);

-- Enable RLS on new tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers
CREATE POLICY "Admins can view all customers"
ON public.customers FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert customers"
ON public.customers FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customers"
ON public.customers FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customers"
ON public.customers FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for invoices
CREATE POLICY "Admins can view all invoices"
ON public.invoices FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert invoices"
ON public.invoices FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoices"
ON public.invoices FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invoices"
ON public.invoices FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for invoice_items
CREATE POLICY "Admins can view all invoice items"
ON public.invoice_items FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert invoice items"
ON public.invoice_items FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoice items"
ON public.invoice_items FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invoice items"
ON public.invoice_items FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for invoice_settings
CREATE POLICY "Admins can view invoice settings"
ON public.invoice_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoice settings"
ON public.invoice_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);