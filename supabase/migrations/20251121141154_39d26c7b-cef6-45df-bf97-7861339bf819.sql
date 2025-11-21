-- Add payment tracking to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_amount NUMERIC DEFAULT 0;

-- Create invoice_payments table for tracking partial payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_paid NUMERIC NOT NULL CHECK (amount_paid > 0),
  payment_mode TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'bank_transfer', 'upi', 'cheque', 'card')),
  reference_number TEXT,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on invoice_payments
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_payments
CREATE POLICY "Admins can manage invoice_payments"
ON invoice_payments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Function to update invoice payment status
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  total_paid NUMERIC;
  invoice_total NUMERIC;
BEGIN
  -- Get total paid amount for this invoice
  SELECT COALESCE(SUM(amount_paid), 0) INTO total_paid
  FROM invoice_payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Get invoice total
  SELECT total_amount INTO invoice_total
  FROM invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update invoice payment status
  UPDATE invoices
  SET 
    paid_amount = total_paid,
    balance_amount = invoice_total - total_paid,
    payment_status = CASE
      WHEN total_paid = 0 THEN 'unpaid'
      WHEN total_paid >= invoice_total THEN 'paid'
      ELSE 'partial'
    END
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update payment status
DROP TRIGGER IF EXISTS update_invoice_payment_status_trigger ON invoice_payments;
CREATE TRIGGER update_invoice_payment_status_trigger
AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

-- Initialize balance_amount for existing invoices
UPDATE invoices 
SET balance_amount = total_amount - COALESCE(paid_amount, 0)
WHERE balance_amount IS NULL OR balance_amount = 0;