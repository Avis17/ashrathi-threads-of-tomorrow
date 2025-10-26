-- Replace roles policy to remove dependency on text overload
DROP POLICY IF EXISTS "Admins can view all roles" ON public.roles;
CREATE POLICY "Admins can view all roles" ON public.roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Now drop the text-based overload
DROP FUNCTION IF EXISTS public.has_role(uuid, text);

-- Ensure user_roles.role type is enum
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_fkey;
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role USING role::public.app_role;