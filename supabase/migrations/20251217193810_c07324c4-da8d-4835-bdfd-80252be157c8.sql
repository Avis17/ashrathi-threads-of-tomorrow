-- Add email column to internal_app_access table
ALTER TABLE public.internal_app_access 
ADD COLUMN user_email text;

-- Make user_id nullable (so we can add by email before user exists)
ALTER TABLE public.internal_app_access 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop the unique constraint on user_id, app_name and add one on email, app_name
ALTER TABLE public.internal_app_access 
DROP CONSTRAINT IF EXISTS internal_app_access_user_id_app_name_key;

ALTER TABLE public.internal_app_access 
ADD CONSTRAINT internal_app_access_email_app_name_key UNIQUE (user_email, app_name);

-- Update the has_app_access function to check by email as well
CREATE OR REPLACE FUNCTION public.has_app_access(_user_id uuid, _app_name internal_app)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.internal_app_access iaa
    JOIN public.profiles p ON p.email = iaa.user_email
    WHERE p.id = _user_id
      AND iaa.app_name = _app_name
      AND iaa.is_approved = true
  ) OR public.has_role(_user_id, 'admin')
$$;