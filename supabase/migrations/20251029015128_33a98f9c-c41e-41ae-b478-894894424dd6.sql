-- Add discount and offer message columns to products table
ALTER TABLE products 
ADD COLUMN discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 99),
ADD COLUMN offer_message text;