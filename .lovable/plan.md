

# Leave Management System — External Table Schema & Implementation Plan

## Context

Your current project manages staff absences via the `staff_absences` table with fields: `staff_id`, `from_date`, `to_date`, `reason`. The external project (where staff apply leaves) needs a new `leave_requests` table that staff submit to, and your admin dashboard will fetch, display, approve/reject, and sync approved leaves into your local `staff_absences` table — following the same pattern as `cash_requests` ↔ `BillsManagement`.

---

## External Project Table: `leave_requests`

Here is the schema you should create in your **external project's database**:

```sql
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL,              -- maps to your project's staff_members.id
  employee_code TEXT NOT NULL,          -- e.g. "E001" — for display/lookup
  auth_user_id UUID,                   -- external project's auth user (who submitted)
  
  -- Leave details
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'full_day',  -- 'full_day', 'first_half', 'second_half'
  reason TEXT,
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'Pending',       -- 'Pending', 'Approved', 'Rejected'
  admin_note TEXT,
  approved_at TIMESTAMPTZ,
  
  -- Sync tracking
  synced_absence_id UUID,              -- stores your project's staff_absences.id after sync
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: allow anon to insert (staff submitting) and allow anon to select/update (your admin dashboard)
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access on leave_requests"
ON public.leave_requests FOR ALL TO anon USING (true) WITH CHECK (true);
```

### Field Explanations

| Field | Purpose |
|---|---|
| `staff_id` | Links to your project's `staff_members.id` for syncing |
| `employee_code` | Quick identifier (e.g. "E001") so admin can identify without extra lookups |
| `from_date` / `to_date` | Leave date range. For half-day, both dates will be the same |
| `leave_type` | `full_day`, `first_half`, or `second_half` — critical for half-day support |
| `reason` | Staff's reason for leave |
| `status` | Workflow: Pending → Approved/Rejected |
| `admin_note` | Admin feedback (especially for rejections) |
| `approved_at` | Timestamp when approved |
| `synced_absence_id` | After approval, stores the `staff_absences.id` created in your project — prevents duplicate syncs |

---

## Implementation Plan (Your Project)

### 1. Update `staff_absences` table (migration)
Add a `leave_type` column to support half-day tracking:
```sql
ALTER TABLE public.staff_absences 
ADD COLUMN leave_type TEXT NOT NULL DEFAULT 'full_day';
```

### 2. Create Leave Management page (`src/pages/admin/LeaveManagement.tsx`)
- Fetch `leave_requests` from external project via `externalSupabase`
- Resolve staff names using local `job_employees` (same pattern as BillsManagement)
- Display table with columns: Employee Name, Date Range, Leave Type, Reason, Status, Actions
- Filters: status, employee, date range, leave type
- Search by employee name/code
- Sort by date, status, created_at

### 3. Approve/Reject workflow
- **Approve**: Update external `leave_requests.status` to "Approved", then insert into local `staff_absences` with matching `staff_id`, `from_date`, `to_date`, `leave_type`, `reason`. Store the created absence ID back in `synced_absence_id`.
- **Reject**: Update external `leave_requests.status` to "Rejected" with mandatory `admin_note`.

### 4. Add route and navigation
- Route: `/admin/leave-management`
- Add to `AdminSidebar` menu items
- Add to `Admin.tsx` routes

### 5. Half-day leave support
- Display half-day badges ("AM"/"PM") in both the leave management dashboard and the staff details page
- Update the existing absence recording in StaffDetailsPage to also support `leave_type`

---

## Summary of What You Need to Do First

**In your external project**, create the `leave_requests` table with the SQL above, including the RLS policy for anon access. Once that's done, confirm and I'll implement the full leave management dashboard in your admin panel.

