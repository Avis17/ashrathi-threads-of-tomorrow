-- Add GST fields to external_job_orders table
ALTER TABLE external_job_orders 
ADD COLUMN IF NOT EXISTS gst_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS gst_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_with_gst numeric DEFAULT 0;

-- Update existing records to have default values
UPDATE external_job_orders 
SET gst_percentage = 0, 
    gst_amount = 0, 
    total_with_gst = 0 
WHERE gst_percentage IS NULL;