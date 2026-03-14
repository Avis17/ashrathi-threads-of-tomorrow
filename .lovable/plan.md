

## Plan: Enable Staff Project Read Access to Supporting Tables

Two RLS policies need to be added so the staff project can populate its dropdowns with style names and cutting data.

### Database Migration

**Add anon SELECT policies on two tables:**

1. **`job_styles`** — Allow anon to read style names/codes for the style dropdown
2. **`batch_cutting_logs`** — Allow anon to read cutting data so staff can see how many pieces were cut per color/type

```sql
-- Anon can read job_styles (for style dropdown)
CREATE POLICY "Anon can select job_styles"
ON public.job_styles FOR SELECT TO anon USING (true);

-- Anon can read batch_cutting_logs (for cut pieces reference)
CREATE POLICY "Anon can select batch_cutting_logs"
ON public.batch_cutting_logs FOR SELECT TO anon USING (true);
```

No code changes needed — this is purely a database access update.

### Updated Staff Integration Guide

After this migration, staff project can query:
- `job_batches` → batch list + `rolls_data` (already accessible)
- `job_styles` → style name/code lookup (new)
- `batch_cutting_logs` → cut pieces per style/type (new)
- `batch_operation_progress` → read/write progress (already accessible)

