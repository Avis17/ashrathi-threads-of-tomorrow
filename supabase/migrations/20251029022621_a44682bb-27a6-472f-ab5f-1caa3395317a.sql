-- Change offer_message from text to jsonb array to support multiple messages
ALTER TABLE products 
ALTER COLUMN offer_message TYPE jsonb USING 
  CASE 
    WHEN offer_message IS NULL THEN '[]'::jsonb
    WHEN offer_message = '' THEN '[]'::jsonb
    ELSE jsonb_build_array(offer_message)
  END;

-- Set default to empty array
ALTER TABLE products 
ALTER COLUMN offer_message SET DEFAULT '[]'::jsonb;