-- Add order_date column to external_job_orders for tracking when the order was placed (separate from created_at)
ALTER TABLE external_job_orders 
ADD COLUMN IF NOT EXISTS order_date date DEFAULT CURRENT_DATE;