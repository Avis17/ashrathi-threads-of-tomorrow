-- Create proper RLS policies for market_intel_visits (visited_by is UUID)

-- Policy: Users can view their own visits
CREATE POLICY "Users can view their own visits" 
ON public.market_intel_visits 
FOR SELECT 
USING (
  visited_by::text = auth.uid()::text
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Users can update their own visits
CREATE POLICY "Users can update their own visits" 
ON public.market_intel_visits 
FOR UPDATE 
USING (
  visited_by::text = auth.uid()::text
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Users can insert visits
CREATE POLICY "Users can create visits" 
ON public.market_intel_visits 
FOR INSERT 
WITH CHECK (true);

-- Policy: Users can delete their own visits or admin can delete any
CREATE POLICY "Users can delete their own visits" 
ON public.market_intel_visits 
FOR DELETE 
USING (
  visited_by::text = auth.uid()::text
  OR public.has_role(auth.uid(), 'admin'::app_role)
);