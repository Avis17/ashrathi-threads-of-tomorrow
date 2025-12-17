-- First just drop the problematic policies
DROP POLICY IF EXISTS "Staff can create visits" ON public.market_intel_visits;
DROP POLICY IF EXISTS "Staff can update their visits" ON public.market_intel_visits;
DROP POLICY IF EXISTS "Staff can view their visits, admins view all" ON public.market_intel_visits;