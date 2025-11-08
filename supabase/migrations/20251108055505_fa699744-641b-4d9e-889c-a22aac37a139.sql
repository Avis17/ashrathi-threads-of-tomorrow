-- Add combo_offers column to products table
ALTER TABLE products 
ADD COLUMN combo_offers jsonb DEFAULT '[]'::jsonb;

-- Add helpful comment
COMMENT ON COLUMN products.combo_offers IS 'Array of combo offers: [{"quantity": 2, "price": 500}, {"quantity": 3, "price": 600}]';

-- Add validation to ensure proper structure
ALTER TABLE products 
ADD CONSTRAINT combo_offers_structure CHECK (
  jsonb_typeof(combo_offers) = 'array'
);