

# Plan: Expose Staff Absences to Staff Project

## Context
The staff project needs to display leaves taken by a staff member. The data lives in `staff_absences`, which references `staff_id` (UUID from `staff_members`). The staff project identifies users by `employee_code` (from `job_employees`).

## Current State
- `staff_absences` has RLS: only `authenticated` users can access
- The staff project uses the **anon** key
- `staff_absences` links to `staff_members.id` via `staff_id`
- `staff_members` links to `job_employees` via `employee_id`
- The staff project knows the logged-in user's `employee_code`

## What Needs to Change

### 1. Database Migration

Add an anon SELECT policy on `staff_absences` so the staff project can read absences. Also need anon SELECT on `staff_members` so they can resolve `employee_code` → `staff_id`.

```sql
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
```

### 2. Guidance for Staff Project

The staff project should:

**Step 1** — Resolve their `employee_code` to a `staff_id`:
```typescript
const { data: staffMember } = await supabase
  .from('staff_members')
  .select('id, employee:job_employees!inner(employee_code)')
  .eq('employee.employee_code', employeeCode)
  .single();
```

**Step 2** — Fetch absences using the `staff_id`:
```typescript
const { data: absences } = await supabase
  .from('staff_absences')
  .select('*')
  .eq('staff_id', staffMember.id)
  .order('from_date', { ascending: false });
```

**Columns available in `staff_absences`:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `staff_id` | uuid | References `staff_members.id` |
| `from_date` | date | Leave start date |
| `to_date` | date | Leave end date |
| `leave_type` | text | `full_day`, `first_half`, `second_half` |
| `reason` | text | Optional reason |
| `created_at` | timestamptz | When recorded |

### 3. No Changes Needed in This Project's UI
This is purely a backend policy update + guidance for the staff project.

### Files
- **Migration SQL**: Add 2 anon SELECT policies (`staff_members`, `staff_absences`)

