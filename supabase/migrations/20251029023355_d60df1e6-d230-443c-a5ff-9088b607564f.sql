-- Rename offer_message column to offer_messages to match the code
ALTER TABLE products 
RENAME COLUMN offer_message TO offer_messages;