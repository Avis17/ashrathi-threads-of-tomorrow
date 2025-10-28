-- Add discount column to invoices table
ALTER TABLE invoices 
ADD COLUMN discount numeric DEFAULT 0;