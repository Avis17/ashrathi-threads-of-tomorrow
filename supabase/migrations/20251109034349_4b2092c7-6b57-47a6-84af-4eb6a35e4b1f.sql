-- Add selected_for_checkout column to cart_items table
ALTER TABLE cart_items 
ADD COLUMN selected_for_checkout BOOLEAN NOT NULL DEFAULT true;

-- Add index for better query performance
CREATE INDEX idx_cart_items_selected ON cart_items(user_id, selected_for_checkout);