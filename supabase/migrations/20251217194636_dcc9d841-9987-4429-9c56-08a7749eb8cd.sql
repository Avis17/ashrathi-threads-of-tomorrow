-- Drop the existing policy that checks user_id
DROP POLICY IF EXISTS "Users can view their own app access" ON public.internal_app_access;

-- Create new policy that checks by email from the JWT
CREATE POLICY "Users can view their own app access by email" 
ON public.internal_app_access 
FOR SELECT 
USING (
  user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);