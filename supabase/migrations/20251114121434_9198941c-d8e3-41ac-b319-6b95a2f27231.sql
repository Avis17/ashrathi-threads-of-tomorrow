-- Add is_settled flag to track if part payment has been included in a settlement
ALTER TABLE job_part_payments 
ADD COLUMN is_settled BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX idx_part_payments_settled ON job_part_payments(employee_id, is_settled, payment_date);