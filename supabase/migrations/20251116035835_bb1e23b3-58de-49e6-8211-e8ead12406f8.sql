-- Add ironing_quantity column to job_batches table
ALTER TABLE job_batches
ADD COLUMN IF NOT EXISTS ironing_quantity INTEGER DEFAULT 0;