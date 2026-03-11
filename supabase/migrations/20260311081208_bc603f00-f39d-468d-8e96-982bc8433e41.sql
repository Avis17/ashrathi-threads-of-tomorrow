
-- Add source and created_by_employee_code columns
ALTER TABLE public.delivery_challans 
  ADD COLUMN source TEXT NOT NULL DEFAULT 'admin',
  ADD COLUMN created_by_employee_code TEXT;

-- Make dc_number have a default so staff inserts don't need to provide it
ALTER TABLE public.delivery_challans ALTER COLUMN dc_number SET DEFAULT '';

-- RLS: Staff (anon) can read active job workers
CREATE POLICY "Public can read active job workers" ON public.job_workers
  FOR SELECT TO anon USING (is_active = true);

-- RLS: Staff (anon) can insert DCs with source='staff'
CREATE POLICY "Staff can insert DCs" ON public.delivery_challans
  FOR INSERT TO anon WITH CHECK (source = 'staff');

-- RLS: Staff (anon) can read staff-created DCs
CREATE POLICY "Staff can read own DCs" ON public.delivery_challans
  FOR SELECT TO anon USING (source = 'staff');

-- RLS: Staff (anon) can insert DC items for staff-created DCs
CREATE POLICY "Staff can insert DC items" ON public.delivery_challan_items
  FOR INSERT TO anon WITH CHECK (
    EXISTS (SELECT 1 FROM public.delivery_challans WHERE id = delivery_challan_id AND source = 'staff')
  );

-- RLS: Staff (anon) can read DC items for staff-created DCs
CREATE POLICY "Staff can read DC items" ON public.delivery_challan_items
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.delivery_challans WHERE id = delivery_challan_id AND source = 'staff')
  );
