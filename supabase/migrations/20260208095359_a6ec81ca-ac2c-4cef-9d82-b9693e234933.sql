-- Create table for daily cutting logs
CREATE TABLE public.batch_cutting_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.job_batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type_index INTEGER NOT NULL, -- Index of the type/color in rolls_data array
  color VARCHAR(255) NOT NULL,
  style_id UUID REFERENCES public.job_styles(id),
  pieces_cut INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batch_cutting_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for authenticated users"
ON public.batch_cutting_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_batch_cutting_logs_batch_id ON public.batch_cutting_logs(batch_id);
CREATE INDEX idx_batch_cutting_logs_date ON public.batch_cutting_logs(log_date);

-- Create trigger to update updated_at
CREATE TRIGGER update_batch_cutting_logs_updated_at
BEFORE UPDATE ON public.batch_cutting_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();