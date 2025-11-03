-- Add subcategory column to batch_costs for detailed labor categorization
ALTER TABLE public.batch_costs 
ADD COLUMN subcategory text;

-- Add comment explaining the subcategory usage
COMMENT ON COLUMN public.batch_costs.subcategory IS 'Subcategory for costs, especially labor costs like cutting, stitching, checking, ironing, packing, etc.';