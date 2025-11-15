-- Add section column to track which department/skill was settled
ALTER TABLE job_weekly_settlements 
ADD COLUMN section TEXT;

-- Add comment for clarity
COMMENT ON COLUMN job_weekly_settlements.section IS 'Department/skill that was settled (e.g., Cutting, Stitching-Singer, Ironing, Checking, Packing)';