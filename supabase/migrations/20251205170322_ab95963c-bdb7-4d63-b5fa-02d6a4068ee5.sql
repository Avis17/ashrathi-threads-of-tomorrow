-- Add round_off column to external_job_operations table
ALTER TABLE external_job_operations ADD COLUMN IF NOT EXISTS round_off numeric;
ALTER TABLE external_job_operations ADD COLUMN IF NOT EXISTS adjustment numeric;