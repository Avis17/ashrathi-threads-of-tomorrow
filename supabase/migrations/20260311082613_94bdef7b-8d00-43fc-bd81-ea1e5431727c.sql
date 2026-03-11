
-- 1. Make driver_name and driver_mobile nullable
ALTER TABLE public.delivery_challans ALTER COLUMN driver_name DROP NOT NULL;
ALTER TABLE public.delivery_challans ALTER COLUMN driver_mobile DROP NOT NULL;

-- 2. Change dc_number default from 'STAFF-PENDING' to empty string
-- so the existing set_dc_number trigger auto-generates it
ALTER TABLE public.delivery_challans ALTER COLUMN dc_number SET DEFAULT '';
