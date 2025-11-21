-- Create a trigger function to initialize balance_amount on invoice insert/update
CREATE OR REPLACE FUNCTION initialize_invoice_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate balance_amount as total_amount - paid_amount
  NEW.balance_amount := NEW.total_amount - COALESCE(NEW.paid_amount, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on invoices table
CREATE TRIGGER set_invoice_balance_on_change
  BEFORE INSERT OR UPDATE OF total_amount, paid_amount
  ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION initialize_invoice_balance();

-- Update existing invoices to fix balance_amount
UPDATE invoices
SET balance_amount = total_amount - COALESCE(paid_amount, 0)
WHERE balance_amount != (total_amount - COALESCE(paid_amount, 0));