
-- Create returns and rejections tracking table
CREATE TABLE public.returns_rejections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_type TEXT NOT NULL CHECK (return_type IN ('customer_return', 'job_rejection')),
  reference_id TEXT, -- invoice number, job order id, etc.
  reference_type TEXT, -- 'invoice', 'job_order', 'batch'
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  reason_category TEXT NOT NULL CHECK (reason_category IN ('stitch', 'fabric', 'size', 'shade', 'damage', 'wrong_item', 'quality', 'other')),
  reason_details TEXT,
  cost_per_unit NUMERIC DEFAULT 0,
  total_cost_impact NUMERIC DEFAULT 0,
  action_taken TEXT CHECK (action_taken IN ('refund', 'replacement', 'repair', 'rejected', 'pending')),
  customer_name TEXT,
  reported_by TEXT,
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  notes TEXT,
  images TEXT[],
  batch_id UUID REFERENCES public.job_batches(id) ON DELETE SET NULL,
  job_order_id UUID REFERENCES public.external_job_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.returns_rejections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admins
CREATE POLICY "Admins can manage returns_rejections"
  ON public.returns_rejections
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_returns_rejections_updated_at
  BEFORE UPDATE ON public.returns_rejections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_returns_rejections_type ON public.returns_rejections(return_type);
CREATE INDEX idx_returns_rejections_status ON public.returns_rejections(status);
CREATE INDEX idx_returns_rejections_reason ON public.returns_rejections(reason_category);
CREATE INDEX idx_returns_rejections_date ON public.returns_rejections(reported_date);
