
-- Add type_index column to batch_operation_progress
ALTER TABLE public.batch_operation_progress ADD COLUMN type_index integer NOT NULL DEFAULT 0;

-- Drop existing unique constraint (batch_id, operation)
ALTER TABLE public.batch_operation_progress DROP CONSTRAINT IF EXISTS batch_operation_progress_batch_id_operation_key;

-- Add new unique constraint including type_index
ALTER TABLE public.batch_operation_progress ADD CONSTRAINT batch_operation_progress_batch_id_operation_type_key UNIQUE (batch_id, operation, type_index);
