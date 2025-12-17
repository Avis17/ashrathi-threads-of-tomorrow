-- Create enum for app names
CREATE TYPE public.internal_app AS ENUM ('market_intel', 'analytics_hub', 'production_tracker', 'inventory_scanner');

-- Create table for app access control
CREATE TABLE public.internal_app_access (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    app_name internal_app NOT NULL,
    is_approved boolean DEFAULT false,
    approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, app_name)
);

-- Enable RLS
ALTER TABLE public.internal_app_access ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own access
CREATE POLICY "Users can view their own app access"
ON public.internal_app_access
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins can view all access records
CREATE POLICY "Admins can view all app access"
ON public.internal_app_access
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can insert access records
CREATE POLICY "Admins can insert app access"
ON public.internal_app_access
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can update access records
CREATE POLICY "Admins can update app access"
ON public.internal_app_access
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can delete access records
CREATE POLICY "Admins can delete app access"
ON public.internal_app_access
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to check if user has app access
CREATE OR REPLACE FUNCTION public.has_app_access(_user_id uuid, _app_name internal_app)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.internal_app_access
    WHERE user_id = _user_id
      AND app_name = _app_name
      AND is_approved = true
  ) OR public.has_role(_user_id, 'admin')
$$;