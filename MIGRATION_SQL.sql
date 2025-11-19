-- =====================================================
-- FEATHER FASHIONS DATABASE MIGRATION SCRIPT
-- Target: New Supabase Project (evatnzestvdodljghxcb)
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SECTION 1: ENUMS AND CUSTOM TYPES
-- =====================================================

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create expense_category enum
CREATE TYPE public.expense_category AS ENUM (
  'salary',
  'rent',
  'utilities',
  'raw_materials',
  'machinery',
  'maintenance',
  'transport',
  'marketing',
  'office_supplies',
  'professional_fees',
  'insurance',
  'taxes',
  'other'
);

-- =====================================================
-- SECTION 2: CREATE SEQUENCES
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS batch_number_seq START 1;

-- =====================================================
-- SECTION 3: CREATE TABLES (in dependency order)
-- =====================================================

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  gender TEXT,
  marital_status TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Pending user roles table
CREATE TABLE public.pending_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'admin',
  assigned_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  fabric TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  additional_images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  should_remove BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  price NUMERIC,
  quality_tier TEXT DEFAULT 'smart_basics' CHECK (quality_tier IN ('elite', 'smart_basics')),
  available_sizes TEXT[] DEFAULT '{}',
  available_colors JSONB DEFAULT '[]',
  discount_percentage NUMERIC,
  offer_messages TEXT[] DEFAULT '{}',
  combo_offers JSONB DEFAULT '[]',
  current_total_stock INTEGER DEFAULT 0,
  is_new_arrival BOOLEAN DEFAULT false,
  is_signature BOOLEAN DEFAULT false,
  hsn_code TEXT,
  product_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product inventory table
CREATE TABLE public.product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  original_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  ordered_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

-- Cart items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_size TEXT,
  selected_color TEXT,
  selected_for_checkout BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User favorites table
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Customer addresses table
CREATE TABLE public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT generate_order_number(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  subtotal NUMERIC NOT NULL,
  shipping_charges NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  delivery_name TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  delivery_address_line_1 TEXT NOT NULL,
  delivery_address_line_2 TEXT,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_pincode TEXT NOT NULL,
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_code TEXT,
  product_image_url TEXT NOT NULL,
  selected_size TEXT,
  selected_color TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact inquiries table
CREATE TABLE public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bulk order requests table
CREATE TABLE public.bulk_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  product_interest TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  requirements TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_number TEXT NOT NULL,
  address TEXT NOT NULL,
  building_type TEXT NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  building_size NUMERIC NOT NULL,
  electricity_sanctioned TEXT,
  facilities TEXT[],
  is_main_building BOOLEAN DEFAULT false,
  is_outlet BOOLEAN DEFAULT true,
  is_manufacturing_unit BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee contacts table
CREATE TABLE public.employee_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternative_contact TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  department TEXT NOT NULL,
  date_of_joining DATE,
  salary NUMERIC,
  photo TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category expense_category NOT NULL,
  subcategory TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  vendor_name TEXT,
  payment_method TEXT DEFAULT 'cash',
  receipt_number TEXT,
  branch_id UUID REFERENCES public.branches(id),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table (B2B)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  address_1 TEXT NOT NULL,
  address_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  gst_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice settings table
CREATE TABLE public.invoice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_invoice_number INTEGER NOT NULL DEFAULT 1,
  company_name TEXT DEFAULT 'Feather Fashions',
  company_tagline TEXT DEFAULT 'Feather-Light Comfort. Limitless Style.',
  company_address TEXT DEFAULT 'Sathya Complex, 176/1, Sathy Road, Annur, TN - 641653',
  company_gst_number TEXT DEFAULT '33AABCU9603R1ZM',
  company_phone TEXT DEFAULT '+91 97892 25510',
  company_email TEXT DEFAULT 'info@featherfashions.shop',
  company_website TEXT DEFAULT 'featherfashions.shop',
  company_logo_path TEXT DEFAULT '/logo.png',
  bank_name TEXT DEFAULT 'State Bank of India',
  bank_account_number TEXT DEFAULT 'XXXXXXXX',
  bank_account_display TEXT,
  bank_ifsc_code TEXT DEFAULT 'SBIN0XXXXXX',
  bank_branch TEXT DEFAULT 'Annur',
  upi_id TEXT DEFAULT 'featherfashions@upi',
  payment_modes TEXT DEFAULT 'Cash / Bank Transfer / UPI',
  place_of_supply TEXT DEFAULT 'Tamil Nadu (33)',
  default_terms JSONB DEFAULT '["Payment is due within 30 days of invoice date.", "Goods once sold will not be taken back or exchanged.", "All disputes are subject to Annur jurisdiction only."]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number INTEGER NOT NULL,
  invoice_date DATE NOT NULL,
  invoice_type TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  delivery_address TEXT NOT NULL,
  purchase_order_no TEXT,
  number_of_packages INTEGER NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  cgst_rate NUMERIC DEFAULT 0,
  cgst_amount NUMERIC DEFAULT 0,
  sgst_rate NUMERIC DEFAULT 0,
  sgst_amount NUMERIC DEFAULT 0,
  igst_rate NUMERIC DEFAULT 0,
  igst_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  terms_and_conditions TEXT[] DEFAULT ARRAY[
    'Payment is due within 30 days of invoice date.',
    'Goods once sold will not be taken back or exchanged.',
    'All disputes are subject to Tirupur jurisdiction only.'
  ],
  status TEXT DEFAULT 'generated',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_code TEXT NOT NULL,
  hsn_code TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  amount NUMERIC NOT NULL
);

-- Materials table
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'kg',
  current_cost_per_unit NUMERIC DEFAULT 0,
  available_stock NUMERIC DEFAULT 0,
  reorder_level NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production batches table
CREATE TABLE public.production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT NOT NULL UNIQUE,
  batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  target_quantity INTEGER NOT NULL,
  actual_quantity INTEGER DEFAULT 0,
  cut_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planning',
  notes TEXT,
  total_material_cost NUMERIC DEFAULT 0,
  total_labor_cost NUMERIC DEFAULT 0,
  total_overhead_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  cost_per_piece NUMERIC DEFAULT 0,
  total_sold_quantity INTEGER DEFAULT 0,
  total_sales_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch materials table
CREATE TABLE public.batch_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id),
  material_name TEXT NOT NULL,
  quantity_used NUMERIC NOT NULL,
  cost_per_unit NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch costs table
CREATE TABLE public.batch_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL,
  description TEXT NOT NULL,
  subcategory TEXT,
  quantity NUMERIC,
  unit_type TEXT,
  rate_per_unit NUMERIC,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch sales table
CREATE TABLE public.batch_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT NOT NULL,
  invoice_number TEXT,
  quantity_sold INTEGER NOT NULL,
  price_per_piece NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job styles table
CREATE TABLE public.job_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_code TEXT NOT NULL UNIQUE,
  pattern_number TEXT NOT NULL,
  style_name TEXT NOT NULL,
  style_image_url TEXT,
  fabric_type TEXT,
  gsm_range TEXT,
  fabric_per_piece NUMERIC DEFAULT 0,
  garment_type TEXT,
  category TEXT,
  season TEXT,
  fit TEXT,
  min_order_qty INTEGER,
  rate_cutting NUMERIC DEFAULT 0,
  rate_stitching_singer NUMERIC DEFAULT 0,
  rate_stitching_power_table NUMERIC DEFAULT 0,
  rate_ironing NUMERIC DEFAULT 0,
  rate_checking NUMERIC DEFAULT 0,
  rate_packing NUMERIC DEFAULT 0,
  accessories JSONB DEFAULT '[]',
  remarks TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job contractors table
CREATE TABLE public.job_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_code TEXT NOT NULL UNIQUE,
  contractor_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job employees table
CREATE TABLE public.job_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  employee_type TEXT NOT NULL,
  contractor_id UUID REFERENCES public.job_contractors(id),
  contractor_name TEXT,
  departments JSONB DEFAULT '[]',
  rate_type TEXT,
  salary_type TEXT,
  salary_amount NUMERIC,
  date_joined DATE,
  date_left DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job batches table
CREATE TABLE public.job_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE,
  style_id UUID REFERENCES public.job_styles(id),
  date_created DATE NOT NULL DEFAULT CURRENT_DATE,
  fabric_type TEXT NOT NULL,
  gsm TEXT NOT NULL,
  color TEXT NOT NULL,
  supplier_name TEXT,
  lot_number TEXT,
  fabric_width TEXT,
  total_fabric_received_kg NUMERIC NOT NULL,
  number_of_rolls INTEGER,
  rolls_data JSONB DEFAULT '[]',
  expected_pieces INTEGER NOT NULL,
  cut_quantity INTEGER DEFAULT 0,
  stitched_quantity INTEGER DEFAULT 0,
  ironing_quantity INTEGER DEFAULT 0,
  checked_quantity INTEGER DEFAULT 0,
  packed_quantity INTEGER DEFAULT 0,
  final_quantity INTEGER DEFAULT 0,
  cutting_data JSONB DEFAULT '[]',
  cutting_completed BOOLEAN DEFAULT false,
  dye_test_result TEXT,
  fabric_shrinkage_percent NUMERIC,
  marker_efficiency NUMERIC,
  wastage_percent NUMERIC DEFAULT 0,
  overall_progress NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'created',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job batch expenses table
CREATE TABLE public.job_batch_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.job_batches(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  rate_per_unit NUMERIC,
  amount NUMERIC NOT NULL,
  supplier_name TEXT,
  bill_number TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job production entries table
CREATE TABLE public.job_production_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.job_batches(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  employee_id UUID REFERENCES public.job_employees(id),
  employee_name TEXT NOT NULL,
  employee_type TEXT NOT NULL,
  section TEXT NOT NULL,
  quantity_completed INTEGER NOT NULL,
  rate_per_piece NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  settlement_id UUID,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job part payments table
CREATE TABLE public.job_part_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.job_employees(id),
  batch_id UUID REFERENCES public.job_batches(id),
  payment_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_mode TEXT DEFAULT 'cash',
  note TEXT,
  is_settled BOOLEAN DEFAULT false,
  settlement_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job weekly settlements table
CREATE TABLE public.job_weekly_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.job_employees(id),
  batch_id UUID REFERENCES public.job_batches(id),
  settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  section TEXT,
  week_start_date DATE,
  week_end_date DATE,
  total_production_amount NUMERIC DEFAULT 0,
  total_part_payments NUMERIC DEFAULT 0,
  advances_deducted NUMERIC DEFAULT 0,
  net_payable NUMERIC DEFAULT 0,
  payment_date DATE,
  payment_mode TEXT,
  payment_status TEXT DEFAULT 'pending',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job orders table
CREATE TABLE public.job_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_company TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_number TEXT,
  product_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  total_pieces INTEGER NOT NULL,
  start_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  overall_progress NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'planned',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job order processes table
CREATE TABLE public.job_order_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id UUID NOT NULL REFERENCES public.job_orders(id) ON DELETE CASCADE,
  process_name TEXT NOT NULL,
  assigned_labour TEXT[] DEFAULT '{}',
  rate_per_piece NUMERIC DEFAULT 0,
  total_pieces INTEGER DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  completion_percent NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job order labours table
CREATE TABLE public.job_order_labours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id UUID NOT NULL REFERENCES public.job_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  process_assigned TEXT NOT NULL,
  rate_per_piece NUMERIC DEFAULT 0,
  total_pieces INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job order cost summary table
CREATE TABLE public.job_order_cost_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id UUID NOT NULL UNIQUE REFERENCES public.job_orders(id) ON DELETE CASCADE,
  material_cost NUMERIC DEFAULT 0,
  labour_cost NUMERIC DEFAULT 0,
  transport_cost NUMERIC DEFAULT 0,
  misc_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 4: CREATE FUNCTIONS
-- =====================================================

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND email = 'info.featherfashions@gmail.com'
  )
$$;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN public.is_super_admin(_user_id) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
  END
$$;

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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

-- Function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE(permission_name TEXT, description TEXT, category TEXT, action TEXT, resource TEXT)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name, p.description, p.category, p.action, p.resource
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
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

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
END;
$$;

-- Function to generate batch codes
CREATE OR REPLACE FUNCTION public.generate_batch_code()
RETURNS TEXT
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_str TEXT;
  seq INT;
BEGIN
  year_str := to_char(current_date, 'YYYY');
  SELECT COALESCE(MAX((regexp_replace(batch_code, '^BATCH-' || year_str || '-', ''))::int), 0) + 1
    INTO seq
  FROM public.production_batches
  WHERE batch_code LIKE 'BATCH-' || year_str || '-%';
  RETURN 'BATCH-' || year_str || '-' || LPAD(seq::text, 4, '0');
END;
$$;

-- Function to set batch code
CREATE OR REPLACE FUNCTION public.set_batch_code()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.batch_code IS NULL OR NEW.batch_code = '' THEN
    NEW.batch_code := generate_batch_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Function to generate job batch numbers
CREATE OR REPLACE FUNCTION public.generate_job_batch_number()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  style_code TEXT;
  date_str TEXT;
  seq_num INTEGER;
  new_batch_num TEXT;
BEGIN
  SELECT job_styles.style_code INTO style_code
  FROM job_styles
  WHERE id = NEW.style_id;
  
  date_str := TO_CHAR(NEW.date_created, 'YYYYMMDD');
  
  SELECT COUNT(*) + 1 INTO seq_num
  FROM job_batches
  WHERE batch_number LIKE style_code || '-' || date_str || '-%';
  
  new_batch_num := style_code || '-' || date_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  
  NEW.batch_number := new_batch_num;
  RETURN NEW;
END;
$$;

-- Function to calculate production amount
CREATE OR REPLACE FUNCTION public.calculate_production_amount()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.total_amount := NEW.quantity_completed * NEW.rate_per_piece;
  RETURN NEW;
END;
$$;

-- Function to update batch totals
CREATE OR REPLACE FUNCTION public.update_batch_totals()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  batch RECORD;
  material_total NUMERIC;
  labor_total NUMERIC;
  overhead_total NUMERIC;
  sales_qty INTEGER;
  sales_amount NUMERIC;
BEGIN
  -- Get material costs
  SELECT COALESCE(SUM(total_cost), 0) INTO material_total
  FROM public.batch_materials
  WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id);
  
  -- Get labor costs
  SELECT COALESCE(SUM(amount), 0) INTO labor_total
  FROM public.batch_costs
  WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
    AND cost_type = 'labor';
  
  -- Get overhead costs
  SELECT COALESCE(SUM(amount), 0) INTO overhead_total
  FROM public.batch_costs
  WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
    AND cost_type IN ('overhead', 'transport', 'other');
  
  -- Get sales totals
  SELECT 
    COALESCE(SUM(quantity_sold), 0),
    COALESCE(SUM(total_amount), 0)
  INTO sales_qty, sales_amount
  FROM public.batch_sales
  WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id);
  
  -- Update batch
  UPDATE public.production_batches
  SET 
    total_material_cost = material_total,
    total_labor_cost = labor_total,
    total_overhead_cost = overhead_total,
    total_cost = material_total + labor_total + overhead_total,
    cost_per_piece = CASE 
      WHEN actual_quantity > 0 THEN (material_total + labor_total + overhead_total) / actual_quantity
      ELSE 0
    END,
    total_sold_quantity = sales_qty,
    total_sales_amount = sales_amount,
    status = CASE
      WHEN status = 'planning' THEN 'planning'
      WHEN actual_quantity = 0 THEN 'in_production'
      WHEN sales_qty = 0 THEN 'completed'
      WHEN sales_qty >= actual_quantity THEN 'fully_sold'
      WHEN sales_qty > 0 THEN 'partially_sold'
      ELSE 'completed'
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.batch_id, OLD.batch_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update available quantity
CREATE OR REPLACE FUNCTION public.update_available_quantity()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.available_quantity := NEW.original_quantity - NEW.reserved_quantity - NEW.ordered_quantity;
  
  IF NEW.available_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient inventory: available_quantity cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to reserve inventory
CREATE OR REPLACE FUNCTION public.reserve_inventory(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_inventory
  SET reserved_quantity = reserved_quantity + p_quantity
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN TRUE;
END;
$$;

-- Function to release inventory
CREATE OR REPLACE FUNCTION public.release_inventory(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_inventory
  SET reserved_quantity = GREATEST(0, reserved_quantity - p_quantity)
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN TRUE;
END;
$$;

-- Function to convert reserved to ordered
CREATE OR REPLACE FUNCTION public.convert_reserved_to_ordered(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_inventory
  SET reserved_quantity = GREATEST(0, reserved_quantity - p_quantity),
      ordered_quantity = ordered_quantity + p_quantity
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN TRUE;
END;
$$;

-- Function to restore inventory on cancel
CREATE OR REPLACE FUNCTION public.restore_inventory_on_cancel(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_inventory
  SET ordered_quantity = GREATEST(0, ordered_quantity - p_quantity)
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN TRUE;
END;
$$;

-- Function to check inventory available
CREATE OR REPLACE FUNCTION public.check_inventory_available(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT available_quantity INTO v_available
  FROM product_inventory
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  RETURN COALESCE(v_available, 0) >= p_quantity;
END;
$$;

-- Function to deduct inventory
CREATE OR REPLACE FUNCTION public.deduct_inventory(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Get current available quantity with row lock
  SELECT available_quantity INTO v_available
  FROM product_inventory
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color
  FOR UPDATE;
  
  -- Check if enough stock
  IF COALESCE(v_available, 0) < p_quantity THEN
    RAISE EXCEPTION 'Insufficient inventory for product % (Size: %, Color: %)', p_product_id, p_size, p_color;
  END IF;
  
  -- Deduct inventory
  UPDATE product_inventory
  SET available_quantity = available_quantity - p_quantity,
      updated_at = NOW()
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
  
  -- Update product's total stock
  UPDATE products
  SET current_total_stock = (
    SELECT COALESCE(SUM(available_quantity), 0)
    FROM product_inventory
    WHERE product_id = p_product_id
  )
  WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to update profile updated_at
CREATE OR REPLACE FUNCTION public.update_profile_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to check main building constraint
CREATE OR REPLACE FUNCTION public.check_main_building()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_main_building = true THEN
    IF EXISTS (
      SELECT 1 FROM public.branches 
      WHERE is_main_building = true 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Only one main building is allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to compute process total cost
CREATE OR REPLACE FUNCTION public.compute_process_total_cost()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  NEW.total_cost := COALESCE(NEW.rate_per_piece, 0) * COALESCE(NEW.total_pieces, 0);
  RETURN NEW;
END;
$$;

-- Function to compute labour total amount
CREATE OR REPLACE FUNCTION public.compute_labour_total_amount()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  NEW.total_amount := COALESCE(NEW.rate_per_piece, 0) * COALESCE(NEW.total_pieces, 0);
  RETURN NEW;
END;
$$;

-- Function to recalculate job order progress
CREATE OR REPLACE FUNCTION public.recalc_job_order_progress(p_job_order_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SET search_path = public
AS $$
DECLARE
  v_progress NUMERIC;
BEGIN
  SELECT COALESCE(AVG(completion_percent), 0) INTO v_progress
  FROM public.job_order_processes
  WHERE job_order_id = p_job_order_id;

  UPDATE public.job_orders
  SET overall_progress = COALESCE(v_progress, 0)
  WHERE id = p_job_order_id;
END;
$$;

-- Function after processes change
CREATE OR REPLACE FUNCTION public.after_processes_change()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  PERFORM public.recalc_job_order_progress(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.job_order_id ELSE NEW.job_order_id END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to refresh cost summary labour
CREATE OR REPLACE FUNCTION public.refresh_cost_summary_labour(p_job_order_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SET search_path = public
AS $$
DECLARE
  v_labour NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_amount), 0) INTO v_labour
  FROM public.job_order_labours
  WHERE job_order_id = p_job_order_id;

  UPDATE public.job_order_cost_summary
  SET labour_cost = v_labour,
      total_cost = COALESCE(material_cost, 0) + v_labour + COALESCE(transport_cost, 0) + COALESCE(misc_cost, 0)
  WHERE job_order_id = p_job_order_id;
END;
$$;

-- Function after labours change
CREATE OR REPLACE FUNCTION public.after_labours_change()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_cost_summary_labour(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.job_order_id ELSE NEW.job_order_id END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to compute cost summary total
CREATE OR REPLACE FUNCTION public.compute_cost_summary_total()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  NEW.total_cost := COALESCE(NEW.material_cost, 0) + COALESCE(NEW.labour_cost, 0) + COALESCE(NEW.transport_cost, 0) + COALESCE(NEW.misc_cost, 0);
  RETURN NEW;
END;
$$;

-- Function to get all roles
CREATE OR REPLACE FUNCTION public.get_all_roles()
RETURNS TABLE(
  name TEXT,
  display_name TEXT,
  description TEXT,
  is_system_role BOOLEAN,
  user_count BIGINT,
  permission_count BIGINT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
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

-- Function to create role
CREATE OR REPLACE FUNCTION public.create_role(
  _name TEXT,
  _display_name TEXT,
  _description TEXT DEFAULT NULL,
  _permission_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role_id UUID;
  _permission_id UUID;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admin can create roles';
  END IF;

  IF _name !~ '^[a-z][a-z0-9_]*$' THEN
    RAISE EXCEPTION 'Role name must start with a letter and contain only lowercase letters, numbers, and underscores';
  END IF;

  INSERT INTO public.roles (name, display_name, description, is_system_role)
  VALUES (_name, _display_name, _description, false)
  RETURNING id INTO _role_id;

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

-- Function to delete role
CREATE OR REPLACE FUNCTION public.delete_role(_role_name TEXT)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_count BIGINT;
  _is_system BOOLEAN;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admin can delete roles';
  END IF;

  SELECT is_system_role INTO _is_system FROM public.roles WHERE name = _role_name;
  IF _is_system THEN
    RAISE EXCEPTION 'Cannot delete system roles';
  END IF;

  SELECT COUNT(*) INTO _user_count FROM public.user_roles WHERE role = _role_name;
  IF _user_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete role with active users. Found % user(s) with this role.', _user_count;
  END IF;

  DELETE FROM public.roles WHERE name = _role_name;

  RETURN true;
END;
$$;

-- Function to generate FY invoice number
CREATE OR REPLACE FUNCTION public.generate_fy_invoice_number(invoice_num INTEGER, invoice_date DATE)
RETURNS TEXT
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fiscal_year TEXT;
  current_year INTEGER;
  next_year_short TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM invoice_date)::INTEGER;
  
  IF EXTRACT(MONTH FROM invoice_date) >= 4 THEN
    next_year_short := LPAD((current_year + 1 - 2000)::TEXT, 2, '0');
    fiscal_year := current_year::TEXT || '-' || next_year_short;
  ELSE
    next_year_short := LPAD((current_year - 2000)::TEXT, 2, '0');
    fiscal_year := (current_year - 1)::TEXT || '-' || next_year_short;
  END IF;
  
  RETURN 'FF/' || fiscal_year || '/' || LPAD(invoice_num::TEXT, 4, '0');
END;
$$;

-- =====================================================
-- SECTION 5: CREATE TRIGGERS
-- =====================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for batch code generation
CREATE TRIGGER set_batch_code_trigger
  BEFORE INSERT ON public.production_batches
  FOR EACH ROW EXECUTE FUNCTION public.set_batch_code();

-- Trigger for job batch number generation
CREATE TRIGGER generate_batch_number_trigger
  BEFORE INSERT ON public.job_batches
  FOR EACH ROW EXECUTE FUNCTION public.generate_job_batch_number();

-- Trigger for production amount calculation
CREATE TRIGGER calculate_production_amount_trigger
  BEFORE INSERT OR UPDATE ON public.job_production_entries
  FOR EACH ROW EXECUTE FUNCTION public.calculate_production_amount();

-- Trigger for batch materials totals
CREATE TRIGGER update_batch_totals_materials
  AFTER INSERT OR UPDATE OR DELETE ON public.batch_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_batch_totals();

-- Trigger for batch costs totals
CREATE TRIGGER update_batch_totals_costs
  AFTER INSERT OR UPDATE OR DELETE ON public.batch_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_batch_totals();

-- Trigger for batch sales totals
CREATE TRIGGER update_batch_totals_sales
  AFTER INSERT OR UPDATE OR DELETE ON public.batch_sales
  FOR EACH ROW EXECUTE FUNCTION public.update_batch_totals();

-- Trigger for available quantity calculation
CREATE TRIGGER calculate_available_quantity
  BEFORE INSERT OR UPDATE ON public.product_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_available_quantity();

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_updated_at();

-- Trigger for updated_at on branches
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on expenses
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on employee_contacts
CREATE TRIGGER update_employee_contacts_updated_at
  BEFORE UPDATE ON public.employee_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on materials
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on production_batches
CREATE TRIGGER update_production_batches_updated_at
  BEFORE UPDATE ON public.production_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on job_styles
CREATE TRIGGER update_job_styles_updated_at
  BEFORE UPDATE ON public.job_styles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on job_contractors
CREATE TRIGGER update_job_contractors_updated_at
  BEFORE UPDATE ON public.job_contractors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on job_batches
CREATE TRIGGER update_job_batches_updated_at
  BEFORE UPDATE ON public.job_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on job_orders
CREATE TRIGGER update_job_orders_updated_at
  BEFORE UPDATE ON public.job_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for main building check
CREATE TRIGGER check_main_building_trigger
  BEFORE INSERT OR UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.check_main_building();

-- Trigger for process total cost
CREATE TRIGGER compute_process_cost_trigger
  BEFORE INSERT OR UPDATE ON public.job_order_processes
  FOR EACH ROW EXECUTE FUNCTION public.compute_process_total_cost();

-- Trigger for labour total amount
CREATE TRIGGER compute_labour_amount_trigger
  BEFORE INSERT OR UPDATE ON public.job_order_labours
  FOR EACH ROW EXECUTE FUNCTION public.compute_labour_total_amount();

-- Trigger after processes change
CREATE TRIGGER after_processes_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.job_order_processes
  FOR EACH ROW EXECUTE FUNCTION public.after_processes_change();

-- Trigger after labours change
CREATE TRIGGER after_labours_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.job_order_labours
  FOR EACH ROW EXECUTE FUNCTION public.after_labours_change();

-- Trigger for cost summary total
CREATE TRIGGER compute_cost_summary_trigger
  BEFORE INSERT OR UPDATE ON public.job_order_cost_summary
  FOR EACH ROW EXECUTE FUNCTION public.compute_cost_summary_total();

-- =====================================================
-- SECTION 6: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_batch_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_part_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_weekly_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_order_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_order_labours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_order_cost_summary ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 7: CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Pending user roles policies
CREATE POLICY "Admins can view pending user roles"
  ON public.pending_user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pending user roles"
  ON public.pending_user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pending user roles"
  ON public.pending_user_roles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pending user roles"
  ON public.pending_user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Permissions policies
CREATE POLICY "Admins can view all permissions"
  ON public.permissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admin can manage permissions"
  ON public.permissions FOR ALL
  USING (is_super_admin(auth.uid()));

-- Roles policies
CREATE POLICY "Admins can view all roles"
  ON public.roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admin can manage roles"
  ON public.roles FOR ALL
  USING (is_super_admin(auth.uid()));

-- Role permissions policies
CREATE POLICY "Admins can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admin can manage role permissions"
  ON public.role_permissions FOR ALL
  USING (is_super_admin(auth.uid()));

-- Products policies
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Product inventory policies
CREATE POLICY "Anyone can view inventory"
  ON public.product_inventory FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage inventory"
  ON public.product_inventory FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Cart items policies
CREATE POLICY "Users can view their own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Customer addresses policies
CREATE POLICY "Users can view their own addresses"
  ON public.customer_addresses FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own addresses"
  ON public.customer_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON public.customer_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON public.customer_addresses FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses"
  ON public.customer_addresses FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Users can view items of their own orders"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert order items when creating orders"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update order items"
  ON public.order_items FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order items"
  ON public.order_items FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Newsletter subscribers policies
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Contact inquiries policies
CREATE POLICY "Anyone can submit inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inquiries"
  ON public.contact_inquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Bulk order requests policies
CREATE POLICY "Anyone can submit bulk order requests"
  ON public.bulk_order_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all bulk order requests"
  ON public.bulk_order_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bulk order requests"
  ON public.bulk_order_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Branches policies
CREATE POLICY "Admins can view all branches"
  ON public.branches FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert branches"
  ON public.branches FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update branches"
  ON public.branches FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete branches"
  ON public.branches FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Employee contacts policies
CREATE POLICY "Admins can view all employee contacts"
  ON public.employee_contacts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert employee contacts"
  ON public.employee_contacts FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employee contacts"
  ON public.employee_contacts FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employee contacts"
  ON public.employee_contacts FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Expenses policies
CREATE POLICY "Admins can view all expenses"
  ON public.expenses FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update expenses"
  ON public.expenses FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Customers policies
CREATE POLICY "Admins can view all customers"
  ON public.customers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customers"
  ON public.customers FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customers"
  ON public.customers FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Invoice settings policies
CREATE POLICY "Admins can view invoice settings"
  ON public.invoice_settings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoice settings"
  ON public.invoice_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Invoices policies
CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoices"
  ON public.invoices FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invoices"
  ON public.invoices FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Invoice items policies
CREATE POLICY "Admins can view all invoice items"
  ON public.invoice_items FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert invoice items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoice items"
  ON public.invoice_items FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invoice items"
  ON public.invoice_items FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Materials policies
CREATE POLICY "Admins can manage materials"
  ON public.materials FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Production batches policies
CREATE POLICY "Admins can manage production_batches"
  ON public.production_batches FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Batch materials policies
CREATE POLICY "Admins can manage batch_materials"
  ON public.batch_materials FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Batch costs policies
CREATE POLICY "Admins can manage batch_costs"
  ON public.batch_costs FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Batch sales policies
CREATE POLICY "Admins can manage batch_sales"
  ON public.batch_sales FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job styles policies
CREATE POLICY "Admins can manage job_styles"
  ON public.job_styles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job contractors policies
CREATE POLICY "Admins can manage job_contractors"
  ON public.job_contractors FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job employees policies
CREATE POLICY "Admins can manage job_employees"
  ON public.job_employees FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job batches policies
CREATE POLICY "Admins can manage job_batches"
  ON public.job_batches FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job batch expenses policies
CREATE POLICY "Admins can manage job_batch_expenses"
  ON public.job_batch_expenses FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job production entries policies
CREATE POLICY "Admins can manage job_production_entries"
  ON public.job_production_entries FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job part payments policies
CREATE POLICY "Admins can manage job_part_payments"
  ON public.job_part_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job weekly settlements policies
CREATE POLICY "Admins can manage job_weekly_settlements"
  ON public.job_weekly_settlements FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job orders policies
CREATE POLICY "Admins can manage job_orders"
  ON public.job_orders FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job order processes policies
CREATE POLICY "Admins can manage job_order_processes"
  ON public.job_order_processes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job order labours policies
CREATE POLICY "Admins can manage job_order_labours"
  ON public.job_order_labours FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Job order cost summary policies
CREATE POLICY "Admins can manage job_order_cost_summary"
  ON public.job_order_cost_summary FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- SECTION 8: INSERT INITIAL DATA
-- =====================================================

-- Insert default invoice settings
INSERT INTO public.invoice_settings (id) VALUES (gen_random_uuid());

-- Insert default permissions (example)
INSERT INTO public.permissions (name, description, category, action, resource) VALUES
('products:read', 'View products', 'Products', 'read', 'products'),
('products:write', 'Create and edit products', 'Products', 'write', 'products'),
('products:delete', 'Delete products', 'Products', 'delete', 'products'),
('orders:read', 'View orders', 'Orders', 'read', 'orders'),
('orders:write', 'Manage orders', 'Orders', 'write', 'orders'),
('customers:read', 'View customers', 'Customers', 'read', 'customers'),
('customers:write', 'Manage customers', 'Customers', 'write', 'customers'),
('admin:full', 'Full admin access', 'Admin', 'all', 'all');

-- Insert default roles
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
('admin', 'Administrator', 'Full system access', true),
('user', 'User', 'Regular user access', true);

-- Link admin role with all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify migration
SELECT 'Migration completed successfully!' AS status;

SELECT 
  'Tables created: ' || COUNT(*) AS tables_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

SELECT
  'Functions created: ' || COUNT(*) AS functions_count
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';
