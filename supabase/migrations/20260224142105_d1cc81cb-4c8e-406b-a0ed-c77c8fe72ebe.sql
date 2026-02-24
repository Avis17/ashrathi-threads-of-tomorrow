-- Add payment_type and is_settled columns to job_work_payments
ALTER TABLE public.job_work_payments 
  ADD COLUMN payment_type text NOT NULL DEFAULT 'payment',
  ADD COLUMN is_settled boolean NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.job_work_payments.payment_type IS 'Type: advance or payment';
COMMENT ON COLUMN public.job_work_payments.is_settled IS 'Whether this advance has been settled in final payment';