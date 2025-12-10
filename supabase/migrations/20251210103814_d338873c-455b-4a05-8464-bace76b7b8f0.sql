-- Add invoice_number_format column to job_order_invoice_settings
ALTER TABLE public.job_order_invoice_settings
ADD COLUMN IF NOT EXISTS invoice_number_format text NOT NULL DEFAULT 'FF/{fiscal_year}/{number}';

-- Add a comment explaining the format placeholders
COMMENT ON COLUMN public.job_order_invoice_settings.invoice_number_format IS 'Format string for invoice numbers. Placeholders: {prefix} for custom prefix, {fiscal_year} for FY (e.g., 2025-26), {year} for YYYY, {month} for MM, {number} for padded sequence number';