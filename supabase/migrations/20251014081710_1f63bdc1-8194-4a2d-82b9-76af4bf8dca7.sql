-- Add new fields for collections
ALTER TABLE products 
ADD COLUMN is_new_arrival boolean DEFAULT false,
ADD COLUMN is_signature boolean DEFAULT false;

-- Update existing products to mark some as new arrivals
UPDATE products SET is_new_arrival = true 
WHERE name IN (
  'Cloud Whisper Lounge Set',
  'Dream Weaver Kids Set',
  'Serenity Cardigan',
  'FeatherSoft Lounge Tee',
  'DreamEase Night Pants',
  'FeatherFlow Co-ord Set',
  'Cloudyday Cotton Set',
  'DreamNest Pyjama Set'
);

-- Update existing products to mark some as signature collection
UPDATE products SET is_signature = true 
WHERE name IN (
  'Cloud Whisper Lounge Set',
  'FeatherSoft Lounge Tee',
  'FeatherFlow Co-ord Set',
  'Serenity Cardigan'
);

-- Update image paths to use public folder format
UPDATE products SET image_url = '/' || image_url WHERE image_url NOT LIKE '/%';
UPDATE products SET additional_images = (
  SELECT jsonb_agg('/' || value::text)
  FROM jsonb_array_elements_text(additional_images)
)
WHERE additional_images IS NOT NULL AND additional_images != '[]'::jsonb;