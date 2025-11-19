-- =====================================================
-- FEATHER FASHIONS DATABASE MIGRATION SCRIPT (REORGANIZED)
-- Target: New Supabase Project (evatnzestvdodljghxcb)
-- Functions moved BEFORE tables to prevent execution errors
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SECTION 1: ENUMS AND CUSTOM TYPES
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.expense_category AS ENUM (
  'salary', 'rent', 'utilities', 'raw_materials', 'machinery',
  'maintenance', 'transport', 'marketing', 'office_supplies',
  'professional_fees', 'insurance', 'taxes', 'other'
);

-- =====================================================
-- SECTION 2: CREATE SEQUENCES
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS batch_number_seq START 1;

-- =====================================================
-- SECTION 3: CREATE ALL FUNCTIONS (BEFORE TABLES!)
-- =====================================================

-- Copy ALL function definitions from original lines 715-1424 here
-- This includes generate_order_number(), is_super_admin(), has_role(), etc.
-- [Full function definitions from MIGRATION_SQL.sql lines 715-1424]

-- =====================================================
-- SECTION 4: CREATE TABLES (AFTER FUNCTIONS!)
-- =====================================================

-- Now tables can reference functions in DEFAULT clauses
-- Copy ALL table definitions from original lines 42-713 here
-- [Full table definitions from MIGRATION_SQL.sql lines 42-713]

-- =====================================================
-- SECTION 5: CREATE TRIGGERS
-- =====================================================
-- [Trigger definitions]

-- =====================================================
-- SECTION 6-8: RLS, POLICIES, INITIAL DATA
-- =====================================================
-- [RLS and policies]
