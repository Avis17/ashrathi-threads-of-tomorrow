-- Add process_rate_details column to job_styles to store detailed category breakdown
ALTER TABLE job_styles 
ADD COLUMN IF NOT EXISTS process_rate_details jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN job_styles.process_rate_details IS 'Stores detailed breakdown of rates by operation and category. Structure: [{ operation: string, categories: [{ name: string, rate: number }] }]';