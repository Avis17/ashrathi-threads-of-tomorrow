
ALTER TABLE public.batch_payments
  ADD COLUMN IF NOT EXISTS quantity integer,
  ADD COLUMN IF NOT EXISTS rate_per_piece numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_percent numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0;
