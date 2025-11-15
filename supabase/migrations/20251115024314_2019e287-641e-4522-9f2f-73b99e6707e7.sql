-- Add columns for roll-based fabric tracking
ALTER TABLE job_batches
ADD COLUMN IF NOT EXISTS number_of_rolls integer,
ADD COLUMN IF NOT EXISTS rolls_data jsonb DEFAULT '[]'::jsonb;

-- Add comment to explain rolls_data structure
COMMENT ON COLUMN job_batches.rolls_data IS 'Array of roll objects with structure: [{"gsm": "180", "color": "Red", "weight": 25.5, "fabric_width": "60 inches"}]';