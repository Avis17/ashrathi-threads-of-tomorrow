-- Add salary fields to job_employees table
ALTER TABLE job_employees
ADD COLUMN salary_type TEXT CHECK (salary_type IN ('weekly', 'monthly')),
ADD COLUMN salary_amount NUMERIC CHECK (salary_amount >= 0);

COMMENT ON COLUMN job_employees.salary_type IS 'Type of salary: weekly or monthly';
COMMENT ON COLUMN job_employees.salary_amount IS 'Fixed salary amount (optional)';