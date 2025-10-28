-- Fix search path for the FY invoice number generation function
CREATE OR REPLACE FUNCTION generate_fy_invoice_number(invoice_num integer, invoice_date date)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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