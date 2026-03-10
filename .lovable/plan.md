

# Plan: Bills Management Enhancements

## Overview
Three changes: (1) Add batch-wise and date range filters to Bills Management, (2) On approval, auto-create corresponding batch expense or company expense, (3) Create a new `company_expenses` table with its own page/route, (4) Migrate existing approved bills into their corresponding tables.

---

## 1. Database Migration

### New table: `company_expenses`
```sql
CREATE TABLE company_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_request_id TEXT NOT NULL,
  employee_code TEXT,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  note TEXT,
  supplier_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: admin only
```

### Add `cash_request_id` column to `job_batch_expenses`
To track which bills have already been synced and prevent duplicates:
```sql
ALTER TABLE job_batch_expenses ADD COLUMN cash_request_id TEXT;
```

### Data migration for existing approved bills
An edge function or a one-time SQL migration that:
- Fetches all approved/paid bills from the external `cash_requests` table (cannot do cross-DB in SQL, so this will be handled via a one-time script in the approval mutation or a manual button)

**Decision**: Since external DB can't be queried from a migration, we'll add a "Sync Existing Bills" button in the UI that processes all Approved/Paid bills and inserts them into the correct table.

---

## 2. Bills Management Page Updates (`BillsManagement.tsx`)

### Add to CashRequest interface
```typescript
batch_number: string | null;
request_date: string;
```

### New filters
- **Batch filter**: Dropdown populated from unique `batch_number` values in bills
- **Date range filter**: Two date pickers (from/to) filtering on `request_date`

### Approval logic change
When approving a bill, after updating external status:
1. Look up `batch_number` from the bill
2. If `batch_number` is `'COMPANY'` → insert into `company_expenses`
3. Otherwise → find matching `job_batches` row by `batch_number` → insert into `job_batch_expenses` with the batch's ID

### Sync existing button
A "Sync Past Approvals" button that iterates all Approved/Paid bills and inserts missing entries into `job_batch_expenses` or `company_expenses` (checking `cash_request_id` to skip duplicates).

---

## 3. Company Expenses Page

### New file: `src/pages/admin/CompanyExpenses.tsx`
- Lists all rows from `company_expenses` table
- Search, date range filter, category filter
- Summary cards (total amount, count, by category)
- Table view with date, employee, category, amount, notes

### Route & Navigation
- Route: `/admin/company-expenses` in `Admin.tsx`
- Sidebar entry in `AdminSidebar.tsx` near "Bills Management"

---

## 4. Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | Create `company_expenses` table, add `cash_request_id` to `job_batch_expenses` |
| `src/pages/admin/BillsManagement.tsx` | Add batch filter, date range filter, approval sync logic |
| `src/pages/admin/CompanyExpenses.tsx` | New page for company expenses |
| `src/hooks/useCompanyExpenses.tsx` | New hook for CRUD on company_expenses |
| `src/pages/Admin.tsx` | Add route for company expenses |
| `src/components/admin/AdminSidebar.tsx` | Add nav link |

---

## Technical Notes
- The external `cash_requests` table has `batch_number` and `request_date` fields that will be read but not modified
- Batch matching: `cash_request.batch_number` matched against `job_batches.batch_number`
- `cash_request_id` (the external ID) stored to prevent duplicate expense entries
- Company expenses are completely isolated in a new table — no existing tables are modified for this purpose

