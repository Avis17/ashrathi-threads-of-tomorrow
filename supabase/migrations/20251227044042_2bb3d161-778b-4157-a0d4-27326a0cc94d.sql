-- Add is_custom_job flag and custom_products_data to store individual products
ALTER TABLE public.external_job_orders
ADD COLUMN is_custom_job BOOLEAN DEFAULT false,
ADD COLUMN custom_products_data JSONB DEFAULT NULL;