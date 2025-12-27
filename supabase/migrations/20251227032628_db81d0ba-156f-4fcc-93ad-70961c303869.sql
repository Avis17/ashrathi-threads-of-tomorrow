-- Add custom_product_name column for manual product entries
ALTER TABLE public.invoice_items ADD COLUMN custom_product_name TEXT;

-- Make product_id nullable to allow custom products
ALTER TABLE public.invoice_items ALTER COLUMN product_id DROP NOT NULL;