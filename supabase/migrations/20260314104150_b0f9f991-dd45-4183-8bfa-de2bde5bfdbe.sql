
-- Anon can read job_styles (for style dropdown)
CREATE POLICY "Anon can select job_styles"
ON public.job_styles FOR SELECT TO anon USING (true);

-- Anon can read batch_cutting_logs (for cut pieces reference)
CREATE POLICY "Anon can select batch_cutting_logs"
ON public.batch_cutting_logs FOR SELECT TO anon USING (true);
