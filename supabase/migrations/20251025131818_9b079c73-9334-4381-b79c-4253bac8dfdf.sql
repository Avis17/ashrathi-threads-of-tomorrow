-- Extend expense_category enum to support new categories used in the app
DO $$
BEGIN
  -- Add new values if they don't already exist
  ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'security';
  ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'machinery';
  ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'raw_materials';
  ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'materials_purchase';
  ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'professional_fees';
  ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'marketing';
  ALTER TYPE public.expense_category ADD VALUE IF NOT EXISTS 'insurance';
END $$;