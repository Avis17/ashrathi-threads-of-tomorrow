-- Phase 1: Modify job_weekly_settlements table structure
-- Make week dates nullable (settlements are no longer weekly-bound)
ALTER TABLE job_weekly_settlements 
  ALTER COLUMN week_start_date DROP NOT NULL,
  ALTER COLUMN week_end_date DROP NOT NULL;

-- Add settlement_date for tracking when settlement occurred
ALTER TABLE job_weekly_settlements 
  ADD COLUMN settlement_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Add advances_deducted to track how much advance was deducted in this settlement
ALTER TABLE job_weekly_settlements 
  ADD COLUMN advances_deducted NUMERIC DEFAULT 0;

-- Add settlement_id to job_production_entries to link entries to settlements
ALTER TABLE job_production_entries 
  ADD COLUMN settlement_id UUID REFERENCES job_weekly_settlements(id) ON DELETE CASCADE;

-- Add settlement_id to job_part_payments to track which settlement cleared this advance
ALTER TABLE job_part_payments 
  ADD COLUMN settlement_id UUID REFERENCES job_weekly_settlements(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_production_entries_settlement ON job_production_entries(settlement_id);
CREATE INDEX idx_part_payments_settlement ON job_part_payments(settlement_id);
CREATE INDEX idx_settlements_date ON job_weekly_settlements(settlement_date);
CREATE INDEX idx_settlements_employee ON job_weekly_settlements(employee_id);

-- Add comment explaining the schema change
COMMENT ON COLUMN job_weekly_settlements.week_start_date IS 'Legacy field, nullable for multi-line settlements';
COMMENT ON COLUMN job_weekly_settlements.week_end_date IS 'Legacy field, nullable for multi-line settlements';
COMMENT ON COLUMN job_weekly_settlements.settlement_date IS 'Date when this settlement was recorded';
COMMENT ON COLUMN job_weekly_settlements.advances_deducted IS 'Total advances/part payments deducted from this settlement';
COMMENT ON COLUMN job_production_entries.settlement_id IS 'Links production entry to its settlement record';
COMMENT ON COLUMN job_part_payments.settlement_id IS 'Links advance to the settlement that cleared it';