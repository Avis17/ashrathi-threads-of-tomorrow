-- Add original_quantity and ordered_quantity columns to product_inventory table
ALTER TABLE public.product_inventory
ADD COLUMN IF NOT EXISTS original_quantity integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS ordered_quantity integer NOT NULL DEFAULT 0;

-- Add comment to explain the columns
COMMENT ON COLUMN public.product_inventory.original_quantity IS 'Initial stock quantity when first added to inventory';
COMMENT ON COLUMN public.product_inventory.ordered_quantity IS 'Total quantity that has been ordered/sold';

-- Update existing records to set original_quantity to current available_quantity + ordered_quantity
-- This ensures historical data makes sense
UPDATE public.product_inventory
SET original_quantity = available_quantity + reserved_quantity
WHERE original_quantity = 0;