-- Remove the unique constraint on style_id to allow multiple rate cards per style
ALTER TABLE external_job_rate_cards DROP CONSTRAINT IF EXISTS external_job_rate_cards_style_id_key;