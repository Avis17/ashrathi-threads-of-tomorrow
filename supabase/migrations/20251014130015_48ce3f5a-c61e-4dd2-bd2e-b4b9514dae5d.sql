-- Add size and color fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS available_sizes JSONB DEFAULT '["S", "M", "L", "XL", "XXL"]'::jsonb,
ADD COLUMN IF NOT EXISTS available_colors JSONB DEFAULT '[
  {"name": "Black", "hex": "#000000"},
  {"name": "White", "hex": "#FFFFFF"},
  {"name": "Navy Blue", "hex": "#001F3F"},
  {"name": "Grey", "hex": "#808080"}
]'::jsonb;

-- Add selected size and color to cart_items table
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS selected_size TEXT,
ADD COLUMN IF NOT EXISTS selected_color TEXT;

-- Drop existing unique constraint if it exists
ALTER TABLE public.cart_items
DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- Add new unique constraint including size and color variants
ALTER TABLE public.cart_items
ADD CONSTRAINT cart_items_user_product_variant_unique 
UNIQUE (user_id, product_id, selected_size, selected_color);

-- Add selected size and color to order_items table
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS selected_size TEXT,
ADD COLUMN IF NOT EXISTS selected_color TEXT;

-- Update all existing products with default sizes and colors
UPDATE public.products 
SET available_sizes = '["S", "M", "L", "XL", "XXL"]'::jsonb
WHERE available_sizes IS NULL;

UPDATE public.products 
SET available_colors = '[
  {"name": "Black", "hex": "#000000"},
  {"name": "White", "hex": "#FFFFFF"},
  {"name": "Navy Blue", "hex": "#001F3F"},
  {"name": "Grey", "hex": "#808080"}
]'::jsonb
WHERE available_colors IS NULL;