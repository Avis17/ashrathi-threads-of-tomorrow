
-- Staff advances table
CREATE TABLE public.staff_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  remaining_amount NUMERIC NOT NULL,
  advance_date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff weekly payouts table
CREATE TABLE public.staff_weekly_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  week_start_date TEXT NOT NULL,
  week_end_date TEXT NOT NULL,
  daily_rate NUMERIC NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 7,
  absent_days NUMERIC NOT NULL DEFAULT 0,
  working_days NUMERIC NOT NULL DEFAULT 7,
  gross_salary NUMERIC NOT NULL,
  advance_deducted NUMERIC NOT NULL DEFAULT 0,
  net_paid NUMERIC NOT NULL,
  payment_date TEXT NOT NULL,
  payment_mode TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff advance deductions (tracks which advances were deducted in which payout)
CREATE TABLE public.staff_advance_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES public.staff_weekly_payouts(id) ON DELETE CASCADE,
  advance_id UUID NOT NULL REFERENCES public.staff_advances(id) ON DELETE CASCADE,
  amount_deducted NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.staff_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_weekly_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_advance_deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage staff_advances" ON public.staff_advances FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage staff_weekly_payouts" ON public.staff_weekly_payouts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage staff_advance_deductions" ON public.staff_advance_deductions FOR ALL TO authenticated USING (true) WITH CHECK (true);
