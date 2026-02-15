
-- Add payment_status column to job_batches
ALTER TABLE public.job_batches 
ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid';

-- Create batch_payments table
CREATE TABLE public.batch_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id uuid NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  style_id uuid REFERENCES public.job_styles(id),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_mode text NOT NULL DEFAULT 'cash',
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batch_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies (match job_batches pattern - allow all for authenticated)
CREATE POLICY "Allow all for authenticated users" ON public.batch_payments
  FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_batch_payments_batch_id ON public.batch_payments(batch_id);
