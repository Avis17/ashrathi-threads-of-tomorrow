-- Set default value for batch_number in production_batches table
ALTER TABLE public.production_batches 
ALTER COLUMN batch_number SET DEFAULT public.generate_batch_number();