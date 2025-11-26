-- Add adjustment column to external_job_rate_cards table
ALTER TABLE external_job_rate_cards 
ADD COLUMN IF NOT EXISTS adjustment numeric DEFAULT 0;