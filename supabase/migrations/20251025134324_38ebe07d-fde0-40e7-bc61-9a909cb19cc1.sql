-- Create table for pre-configuring users before they register
CREATE TABLE public.pending_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'admin',
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.pending_user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pending user roles
CREATE POLICY "Admins can view pending user roles"
  ON public.pending_user_roles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pending user roles"
  ON public.pending_user_roles FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pending user roles"
  ON public.pending_user_roles FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pending user roles"
  ON public.pending_user_roles FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Update the handle_new_user function to auto-assign roles from pending_user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_role app_role;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Check if there's a pending role assignment for this email
  SELECT role INTO pending_role
  FROM public.pending_user_roles
  WHERE email = NEW.email;

  -- If found, assign the role and delete the pending entry
  IF pending_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, pending_role);
    
    DELETE FROM public.pending_user_roles
    WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$;