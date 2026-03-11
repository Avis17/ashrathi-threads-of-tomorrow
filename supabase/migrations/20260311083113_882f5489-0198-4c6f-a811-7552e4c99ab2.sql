
-- Drop existing purpose check constraint and add expanded one
ALTER TABLE public.delivery_challans DROP CONSTRAINT IF EXISTS delivery_challans_purpose_check;
ALTER TABLE public.delivery_challans ADD CONSTRAINT delivery_challans_purpose_check 
  CHECK (purpose IN ('cutting', 'stitching', 'stitching_singer', 'stitching_powertable', 'checking', 'ironing', 'washing', 'embroidery', 'printing', 'packing', 'other'));
