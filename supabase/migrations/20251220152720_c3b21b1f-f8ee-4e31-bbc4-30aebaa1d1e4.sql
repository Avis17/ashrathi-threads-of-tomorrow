-- Drop the existing check constraint
ALTER TABLE orders DROP CONSTRAINT orders_status_check;

-- Add updated check constraint with 'payment_pending' status
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_pending']));