-- Job Management System - Complete Database Schema

-- 1. JOB STYLES TABLE
CREATE TABLE job_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_code TEXT NOT NULL UNIQUE,
  pattern_number TEXT NOT NULL,
  style_name TEXT NOT NULL,
  style_image_url TEXT,
  fabric_type TEXT,
  gsm_range TEXT,
  garment_type TEXT,
  category TEXT,
  season TEXT,
  fit TEXT,
  
  fabric_per_piece NUMERIC DEFAULT 0,
  accessories JSONB DEFAULT '[]'::jsonb,
  
  rate_cutting NUMERIC DEFAULT 0,
  rate_stitching_singer NUMERIC DEFAULT 0,
  rate_stitching_power_table NUMERIC DEFAULT 0,
  rate_ironing NUMERIC DEFAULT 0,
  rate_checking NUMERIC DEFAULT 0,
  rate_packing NUMERIC DEFAULT 0,
  
  min_order_qty INTEGER,
  remarks TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOB BATCHES TABLE
CREATE TABLE job_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE,
  style_id UUID REFERENCES job_styles(id) ON DELETE CASCADE,
  
  date_created DATE NOT NULL DEFAULT CURRENT_DATE,
  fabric_type TEXT NOT NULL,
  gsm TEXT NOT NULL,
  color TEXT NOT NULL,
  total_fabric_received_kg NUMERIC NOT NULL,
  
  expected_pieces INTEGER NOT NULL,
  cut_quantity INTEGER DEFAULT 0,
  stitched_quantity INTEGER DEFAULT 0,
  checked_quantity INTEGER DEFAULT 0,
  packed_quantity INTEGER DEFAULT 0,
  final_quantity INTEGER DEFAULT 0,
  
  wastage_percent NUMERIC DEFAULT 0,
  
  supplier_name TEXT,
  lot_number TEXT,
  fabric_width TEXT,
  fabric_shrinkage_percent NUMERIC,
  dye_test_result TEXT,
  marker_efficiency NUMERIC,
  
  status TEXT DEFAULT 'created',
  
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to generate batch number
CREATE OR REPLACE FUNCTION generate_job_batch_number()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_job_batch_number
BEFORE INSERT ON job_batches
FOR EACH ROW
EXECUTE FUNCTION generate_job_batch_number();

-- 3. JOB BATCH EXPENSES TABLE
CREATE TABLE job_batch_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES job_batches(id) ON DELETE CASCADE,
  
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

-- 4. JOB EMPLOYEES TABLE
CREATE TABLE job_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  employee_type TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  
  contractor_name TEXT,
  rate_type TEXT,
  
  date_joined DATE,
  date_left DATE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. JOB PRODUCTION ENTRIES TABLE
CREATE TABLE job_production_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES job_batches(id) ON DELETE CASCADE,
  
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  section TEXT NOT NULL,
  employee_id UUID REFERENCES job_employees(id) ON DELETE SET NULL,
  employee_name TEXT NOT NULL,
  employee_type TEXT NOT NULL,
  
  quantity_completed INTEGER NOT NULL,
  rate_per_piece NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to calculate total amount
CREATE OR REPLACE FUNCTION calculate_production_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_amount := NEW.quantity_completed * NEW.rate_per_piece;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_production_amount
BEFORE INSERT OR UPDATE ON job_production_entries
FOR EACH ROW
EXECUTE FUNCTION calculate_production_amount();

-- 6. JOB PART PAYMENTS TABLE
CREATE TABLE job_part_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES job_employees(id) ON DELETE CASCADE,
  
  payment_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_mode TEXT DEFAULT 'cash',
  note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. JOB WEEKLY SETTLEMENTS TABLE
CREATE TABLE job_weekly_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES job_employees(id) ON DELETE CASCADE,
  
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  total_production_amount NUMERIC DEFAULT 0,
  total_part_payments NUMERIC DEFAULT 0,
  net_payable NUMERIC DEFAULT 0,
  
  payment_status TEXT DEFAULT 'pending',
  payment_date DATE,
  payment_mode TEXT,
  
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE job_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_batch_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_part_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_weekly_settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only access)
CREATE POLICY "Admins can manage job_styles" ON job_styles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage job_batches" ON job_batches FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage job_batch_expenses" ON job_batch_expenses FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage job_employees" ON job_employees FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage job_production_entries" ON job_production_entries FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage job_part_payments" ON job_part_payments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage job_weekly_settlements" ON job_weekly_settlements FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));