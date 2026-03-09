CREATE POLICY "Allow public read access on job_employees"
ON public.job_employees
FOR SELECT
TO anon, authenticated
USING (true);