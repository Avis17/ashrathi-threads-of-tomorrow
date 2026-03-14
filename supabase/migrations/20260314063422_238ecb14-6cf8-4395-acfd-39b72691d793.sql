
ALTER TABLE public.batch_salary_entries ADD COLUMN IF NOT EXISTS payment_mode text NOT NULL DEFAULT 'cash';
ALTER TABLE public.batch_salary_advances ADD COLUMN IF NOT EXISTS payment_mode text NOT NULL DEFAULT 'cash';
