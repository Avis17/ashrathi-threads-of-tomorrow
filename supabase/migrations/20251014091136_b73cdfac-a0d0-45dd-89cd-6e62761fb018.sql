-- Add terms and conditions column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN terms_and_conditions TEXT[] DEFAULT ARRAY[
  'Payment is due within 30 days of invoice date.',
  'Goods once sold will not be taken back or exchanged.',
  'All disputes are subject to Tirupur jurisdiction only.'
];