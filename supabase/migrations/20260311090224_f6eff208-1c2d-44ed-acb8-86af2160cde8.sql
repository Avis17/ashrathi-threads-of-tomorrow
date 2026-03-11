
-- Staff project can read staff_members to resolve employee_code -> staff_id
CREATE POLICY "Anon can read staff members"
  ON public.staff_members
  FOR SELECT TO anon
  USING (true);

-- Staff project can read absences for any staff member
CREATE POLICY "Anon can read staff absences"
  ON public.staff_absences
  FOR SELECT TO anon
  USING (true);
