-- Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'manage', 'approve', 'generate')),
  resource TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Enable RLS on both tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND email = 'info.featherfashions@gmail.com'
  )
$$;

-- Create security definer function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Super admin always has all permissions
  SELECT CASE 
    WHEN public.is_super_admin(_user_id) THEN true
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role = rp.role
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = _user_id
        AND p.name = _permission_name
    )
  END
$$;

-- Create security definer function to get all user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(permission_name text, description text, category text, action text, resource text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name, p.description, p.category, p.action, p.resource
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
$$;

-- RLS Policies for permissions table
CREATE POLICY "Admins can view all permissions"
ON public.permissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admin can manage permissions"
ON public.permissions FOR ALL
USING (public.is_super_admin(auth.uid()));

-- RLS Policies for role_permissions table
CREATE POLICY "Admins can view role permissions"
ON public.role_permissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admin can manage role permissions"
ON public.role_permissions FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Seed default permissions
INSERT INTO public.permissions (name, description, category, action, resource) VALUES
  -- Dashboard
  ('view_dashboard', 'View dashboard and analytics', 'dashboard', 'view', 'dashboard'),
  
  -- Orders
  ('view_orders', 'View all orders', 'orders', 'view', 'orders'),
  ('create_orders', 'Create new orders', 'orders', 'create', 'orders'),
  ('update_orders', 'Update existing orders', 'orders', 'update', 'orders'),
  ('delete_orders', 'Delete orders', 'orders', 'delete', 'orders'),
  
  -- Production
  ('view_production', 'View production data', 'production', 'view', 'production'),
  ('create_production', 'Create production records', 'production', 'create', 'production'),
  ('update_production', 'Update production data', 'production', 'update', 'production'),
  ('delete_production', 'Delete production records', 'production', 'delete', 'production'),
  
  -- Branches
  ('view_branches', 'View all branches', 'branches', 'view', 'branches'),
  ('create_branches', 'Create new branches', 'branches', 'create', 'branches'),
  ('update_branches', 'Update branch information', 'branches', 'update', 'branches'),
  ('delete_branches', 'Delete branches', 'branches', 'delete', 'branches'),
  
  -- Expenses
  ('view_expenses', 'View all expenses', 'expenses', 'view', 'expenses'),
  ('create_expenses', 'Create expense records', 'expenses', 'create', 'expenses'),
  ('update_expenses', 'Update expense records', 'expenses', 'update', 'expenses'),
  ('delete_expenses', 'Delete expense records', 'expenses', 'delete', 'expenses'),
  ('approve_expenses', 'Approve expense records', 'expenses', 'approve', 'expenses'),
  
  -- Invoice
  ('view_invoice', 'View invoices', 'invoice', 'view', 'invoice'),
  ('create_invoice', 'Create new invoices', 'invoice', 'create', 'invoice'),
  ('generate_invoice', 'Generate invoice documents', 'invoice', 'generate', 'invoice'),
  
  -- Customers
  ('view_customers', 'View all customers', 'customers', 'view', 'customers'),
  ('create_customers', 'Create new customers', 'customers', 'create', 'customers'),
  ('update_customers', 'Update customer information', 'customers', 'update', 'customers'),
  ('delete_customers', 'Delete customers', 'customers', 'delete', 'customers'),
  
  -- Products
  ('view_products', 'View all products', 'products', 'view', 'products'),
  ('create_products', 'Create new products', 'products', 'create', 'products'),
  ('update_products', 'Update product information', 'products', 'update', 'products'),
  ('delete_products', 'Delete products', 'products', 'delete', 'products'),
  
  -- Contacts
  ('view_contacts', 'View employee contacts', 'contacts', 'view', 'contacts'),
  ('create_contacts', 'Create new contacts', 'contacts', 'create', 'contacts'),
  ('update_contacts', 'Update contact information', 'contacts', 'update', 'contacts'),
  ('delete_contacts', 'Delete contacts', 'contacts', 'delete', 'contacts'),
  
  -- History
  ('view_history', 'View invoice history', 'history', 'view', 'history'),
  
  -- Inquiries
  ('view_inquiries', 'View contact inquiries', 'inquiries', 'view', 'inquiries'),
  ('update_inquiries', 'Update inquiry status', 'inquiries', 'update', 'inquiries'),
  
  -- Bulk Orders
  ('view_bulk_orders', 'View bulk order requests', 'bulk_orders', 'view', 'bulk_orders'),
  ('update_bulk_orders', 'Update bulk order status', 'bulk_orders', 'update', 'bulk_orders'),
  
  -- Newsletter
  ('view_newsletter', 'View newsletter subscribers', 'newsletter', 'view', 'newsletter'),
  
  -- Invoice Reset
  ('manage_invoice_reset', 'Reset invoice numbering', 'invoice_reset', 'manage', 'invoice_reset'),
  
  -- RBAC Management
  ('manage_rbac', 'Manage roles and permissions', 'rbac', 'manage', 'rbac');

-- Assign all permissions to admin role by default
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions;