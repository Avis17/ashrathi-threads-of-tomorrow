-- Add quality_tier column to products table
ALTER TABLE products 
ADD COLUMN quality_tier text NOT NULL DEFAULT 'smart_basics' 
CHECK (quality_tier IN ('elite', 'smart_basics'));

-- Add helpful comment
COMMENT ON COLUMN products.quality_tier IS 'Elite Collection: Premium quality, higher GSM, designer finish | Smart Basics: Economical everyday wear, surplus fabric';

-- Auto-categorize existing products based on price
-- Products over ₹500 -> Elite Collection
-- Products under ₹500 -> Smart Basics
UPDATE products 
SET quality_tier = CASE 
  WHEN price IS NULL THEN 'smart_basics'
  WHEN price >= 500 THEN 'elite'
  ELSE 'smart_basics'
END;