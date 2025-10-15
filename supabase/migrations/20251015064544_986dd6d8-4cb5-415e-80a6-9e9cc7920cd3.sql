-- Add should_remove column to products table
ALTER TABLE products ADD COLUMN should_remove BOOLEAN DEFAULT FALSE;

-- Update existing products to not be removed
UPDATE products SET should_remove = FALSE WHERE should_remove IS NULL;