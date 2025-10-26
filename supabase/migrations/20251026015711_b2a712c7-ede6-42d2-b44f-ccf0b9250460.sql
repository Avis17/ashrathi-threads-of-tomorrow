-- Create roles table to replace enum-based approach
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  is_system_role boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
  ('admin', 'Administrator', 'Full system access with all permissions', true),
  ('manager', 'Manager', 'Management level access', false),
  ('accountant', 'Accountant', 'Financial and accounting access', false),
  ('sales', 'Sales Representative', 'Sales and customer management', false),
  ('viewer', 'Viewer', 'Read-only access', false)
ON CONFLICT (name) DO NOTHING;

-- Update user_roles table to reference roles table instead of enum
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ALTER COLUMN role TYPE text;

-- Add foreign key to roles table
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_fkey 
  FOREIGN KEY (role) REFERENCES public.roles(name) ON DELETE CASCADE;

-- Update pending_user_roles similarly
ALTER TABLE public.pending_user_roles DROP CONSTRAINT IF EXISTS pending_user_roles_role_check;
ALTER TABLE public.pending_user_roles ALTER COLUMN role TYPE text;
ALTER TABLE public.pending_user_roles ADD CONSTRAINT pending_user_roles_role_fkey 
  FOREIGN KEY (role) REFERENCES public.roles(name) ON DELETE CASCADE;

-- Update role_permissions table
ALTER TABLE public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_check;
ALTER TABLE public.role_permissions ALTER COLUMN role TYPE text;
ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_fkey 
  FOREIGN KEY (role) REFERENCES public.roles(name) ON DELETE CASCADE;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get all roles
CREATE OR REPLACE FUNCTION public.get_all_roles()
RETURNS TABLE(name text, display_name text, description text, is_system_role boolean, user_count bigint, permission_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    r.name,
    r.display_name,
    r.description,
    r.is_system_role,
    COUNT(DISTINCT ur.user_id) as user_count,
    COUNT(DISTINCT rp.permission_id) as permission_count
  FROM public.roles r
  LEFT JOIN public.user_roles ur ON r.name = ur.role
  LEFT JOIN public.role_permissions rp ON r.name = rp.role
  GROUP BY r.name, r.display_name, r.description, r.is_system_role
  ORDER BY r.is_system_role DESC, r.name
$$;

-- Create function to create a new role
CREATE OR REPLACE FUNCTION public.create_role(
  _name text,
  _display_name text,
  _description text DEFAULT NULL,
  _permission_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _role_id uuid;
  _permission_id uuid;
BEGIN
  -- Only super admin can create roles
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admin can create roles';
  END IF;

  -- Validate name (lowercase, alphanumeric with underscores)
  IF _name !~ '^[a-z][a-z0-9_]*$' THEN
    RAISE EXCEPTION 'Role name must start with a letter and contain only lowercase letters, numbers, and underscores';
  END IF;

  -- Insert role
  INSERT INTO public.roles (name, display_name, description, is_system_role)
  VALUES (_name, _display_name, _description, false)
  RETURNING id INTO _role_id;

  -- Assign permissions if provided
  IF array_length(_permission_ids, 1) > 0 THEN
    FOREACH _permission_id IN ARRAY _permission_ids
    LOOP
      INSERT INTO public.role_permissions (role, permission_id)
      VALUES (_name, _permission_id);
    END LOOP;
  END IF;

  RETURN _role_id;
END;
$$;

-- Create function to delete a role
CREATE OR REPLACE FUNCTION public.delete_role(_role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _user_count bigint;
  _is_system boolean;
BEGIN
  -- Only super admin can delete roles
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admin can delete roles';
  END IF;

  -- Check if system role
  SELECT is_system_role INTO _is_system FROM public.roles WHERE name = _role_name;
  IF _is_system THEN
    RAISE EXCEPTION 'Cannot delete system roles';
  END IF;

  -- Check if role has users
  SELECT COUNT(*) INTO _user_count FROM public.user_roles WHERE role = _role_name;
  IF _user_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete role with active users. Found % user(s) with this role.', _user_count;
  END IF;

  -- Delete role (cascade will handle role_permissions)
  DELETE FROM public.roles WHERE name = _role_name;

  RETURN true;
END;
$$;

-- RLS Policies for roles table
CREATE POLICY "Admins can view all roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admin can manage roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Update trigger for roles
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();