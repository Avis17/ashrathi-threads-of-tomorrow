-- Drop FK that ties pending_user_roles.role to roles.name
ALTER TABLE public.pending_user_roles DROP CONSTRAINT IF EXISTS pending_user_roles_role_fkey;

-- Convert pending_user_roles.role to enum and set default
ALTER TABLE public.pending_user_roles
  ALTER COLUMN role TYPE public.app_role USING role::public.app_role,
  ALTER COLUMN role SET DEFAULT 'admin'::public.app_role;