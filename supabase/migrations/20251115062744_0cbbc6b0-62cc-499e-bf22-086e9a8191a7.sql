-- Add cutting completion tracking to job_batches
ALTER TABLE job_batches 
ADD COLUMN IF NOT EXISTS cutting_data jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS cutting_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS overall_progress numeric DEFAULT 0;

COMMENT ON COLUMN job_batches.cutting_data IS 'Array of cut quantities for each type: [{ type_index: 0, cut_quantity: 100 }, ...]';
COMMENT ON COLUMN job_batches.cutting_completed IS 'Whether cutting phase is completed (triggers 35% progress)';
COMMENT ON COLUMN job_batches.overall_progress IS 'Overall batch progress percentage (35% after cutting, remaining based on production)';