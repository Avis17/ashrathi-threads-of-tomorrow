-- Allow staff project (anon role) to insert into batch_delivery_info
CREATE POLICY "Allow anon insert batch_delivery_info"
ON public.batch_delivery_info
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow staff project (anon role) to update batch_delivery_info
CREATE POLICY "Allow anon update batch_delivery_info"
ON public.batch_delivery_info
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);