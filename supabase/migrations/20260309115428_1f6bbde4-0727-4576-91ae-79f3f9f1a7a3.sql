CREATE POLICY "Allow public select on job_batches"
ON public.job_batches
FOR SELECT
TO anon
USING (true);