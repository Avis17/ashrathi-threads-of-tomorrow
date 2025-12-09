-- Add payment-related columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS phonepe_order_id TEXT,
ADD COLUMN IF NOT EXISTS phonepe_transaction_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_phonepe_order_id ON public.orders(phonepe_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);