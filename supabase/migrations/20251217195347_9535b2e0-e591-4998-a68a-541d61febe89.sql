-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own app access by email" ON public.internal_app_access;
DROP POLICY IF EXISTS "Users can view their own app access" ON public.internal_app_access;

-- Create new policy using auth.jwt() to get email (doesn't require auth.users access)
CREATE POLICY "Users can view their own app access by email" 
ON public.internal_app_access 
FOR SELECT 
USING (
  user_email = (auth.jwt() ->> 'email')
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update the has_app_access function to use profiles table instead of auth.users
CREATE OR REPLACE FUNCTION public.has_app_access(_user_id uuid, _app_name internal_app)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.internal_app_access iaa
    WHERE iaa.user_email = (SELECT email FROM public.profiles WHERE id = _user_id)
      AND iaa.app_name = _app_name
      AND iaa.is_approved = true
  ) OR public.has_role(_user_id, 'admin')
$$;