
-- Drop the old trigger that generates style-based batch numbers
DROP TRIGGER IF EXISTS trg_set_job_batch_number ON public.job_batches;
DROP TRIGGER IF EXISTS generate_job_batch_number ON public.job_batches;

-- Replace with new auto-increment function
CREATE OR REPLACE FUNCTION public.generate_job_batch_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  max_num INTEGER;
BEGIN
  -- Extract max numeric suffix from existing batch_X numbers
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(batch_number FROM 'batch_(\d+)$') AS INTEGER)
  ), 0) INTO max_num
  FROM public.job_batches
  WHERE batch_number ~ '^batch_\d+$';

  -- Also check any other batch numbers to get overall max
  IF max_num IS NULL THEN
    max_num := 0;
  END IF;

  NEW.batch_number := 'batch_' || (max_num + 1);
  RETURN NEW;
END;
$$;

-- Create new trigger
CREATE TRIGGER trg_auto_batch_number
BEFORE INSERT ON public.job_batches
FOR EACH ROW
EXECUTE FUNCTION public.generate_job_batch_number();
