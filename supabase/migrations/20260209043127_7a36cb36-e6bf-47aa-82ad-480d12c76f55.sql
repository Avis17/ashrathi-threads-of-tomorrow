-- Create employee reviews table
CREATE TABLE public.job_employee_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.job_employees(id) ON DELETE CASCADE,
  review_month integer NOT NULL CHECK (review_month >= 1 AND review_month <= 12),
  review_year integer NOT NULL CHECK (review_year >= 2020 AND review_year <= 2100),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(employee_id, review_month, review_year)
);

-- Enable RLS
ALTER TABLE public.job_employee_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on job_employee_reviews" 
ON public.job_employee_reviews 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.job_employee_reviews IS 'Monthly performance reviews for job employees';