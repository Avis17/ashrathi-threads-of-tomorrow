-- Extend invoice_settings table with company and bank details
ALTER TABLE public.invoice_settings
ADD COLUMN IF NOT EXISTS company_logo_path text DEFAULT '/logo.png',
ADD COLUMN IF NOT EXISTS company_name text DEFAULT 'Feather Fashions',
ADD COLUMN IF NOT EXISTS company_tagline text DEFAULT 'Feather-Light Comfort. Limitless Style.',
ADD COLUMN IF NOT EXISTS company_address text DEFAULT 'Sathya Complex, 176/1, Sathy Road, Annur, TN - 641653',
ADD COLUMN IF NOT EXISTS company_gst_number text DEFAULT '33AABCU9603R1ZM',
ADD COLUMN IF NOT EXISTS company_phone text DEFAULT '+91 97892 25510',
ADD COLUMN IF NOT EXISTS company_email text DEFAULT 'info@featherfashions.shop',
ADD COLUMN IF NOT EXISTS company_website text DEFAULT 'featherfashions.shop',
ADD COLUMN IF NOT EXISTS bank_name text DEFAULT 'State Bank of India',
ADD COLUMN IF NOT EXISTS bank_account_number text DEFAULT 'XXXXXXXX',
ADD COLUMN IF NOT EXISTS bank_ifsc_code text DEFAULT 'SBIN0XXXXXX',
ADD COLUMN IF NOT EXISTS bank_branch text DEFAULT 'Annur',
ADD COLUMN IF NOT EXISTS payment_modes text DEFAULT 'Cash / Bank Transfer / UPI',
ADD COLUMN IF NOT EXISTS default_terms jsonb DEFAULT '["Payment is due within 30 days of invoice date.", "Goods once sold will not be taken back or exchanged.", "All disputes are subject to Annur jurisdiction only."]'::jsonb;