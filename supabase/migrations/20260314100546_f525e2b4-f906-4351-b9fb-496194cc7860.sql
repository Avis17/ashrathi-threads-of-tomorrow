
-- Drop the overly broad existing policy
DROP POLICY IF EXISTS "Authenticated users can manage operation progress" ON public.batch_operation_progress;

-- Authenticated users: full access
CREATE POLICY "Authenticated users full access on batch_operation_progress"
ON public.batch_operation_progress
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Anon role: SELECT (read progress)
CREATE POLICY "Anon can select batch_operation_progress"
ON public.batch_operation_progress
FOR SELECT
TO anon
USING (true);

-- Anon role: INSERT (staff can add new progress entries)
CREATE POLICY "Anon can insert batch_operation_progress"
ON public.batch_operation_progress
FOR INSERT
TO anon
WITH CHECK (true);

-- Anon role: UPDATE (staff can update existing progress entries)
CREATE POLICY "Anon can update batch_operation_progress"
ON public.batch_operation_progress
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
