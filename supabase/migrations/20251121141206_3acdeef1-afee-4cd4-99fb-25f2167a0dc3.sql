-- Fix search_path security issue for the function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;