-- Add new columns to invoice_settings for enhanced invoice features
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS place_of_supply text DEFAULT 'Tamil Nadu (33)',
ADD COLUMN IF NOT EXISTS upi_id text DEFAULT 'featherfashions@upi',
ADD COLUMN IF NOT EXISTS bank_account_display text;

-- Update existing row with masked bank account (show only last 4 digits)
UPDATE invoice_settings 
SET bank_account_display = 'XXXXXX' || RIGHT(bank_account_number, 4)
WHERE bank_account_display IS NULL;

-- Create function to generate FY-formatted invoice number
CREATE OR REPLACE FUNCTION generate_fy_invoice_number(invoice_num integer, invoice_date date)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  fiscal_year text;
  current_year integer;
  next_year_short text;
BEGIN
  current_year := EXTRACT(YEAR FROM invoice_date)::integer;
  
  -- Financial year runs Apr-Mar, so if month >= 4, use current year, else previous year
  IF EXTRACT(MONTH FROM invoice_date) >= 4 THEN
    next_year_short := LPAD((current_year + 1 - 2000)::text, 2, '0');
    fiscal_year := current_year::text || '-' || next_year_short;
  ELSE
    next_year_short := LPAD((current_year - 2000)::text, 2, '0');
    fiscal_year := (current_year - 1)::text || '-' || next_year_short;
  END IF;
  
  RETURN 'FF/' || fiscal_year || '/' || LPAD(invoice_num::text, 4, '0');
END;
$$;