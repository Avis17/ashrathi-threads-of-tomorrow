
-- Add size column to batch_operation_progress
ALTER TABLE public.batch_operation_progress
ADD COLUMN size text NOT NULL DEFAULT '';

-- Drop old unique constraint
ALTER TABLE public.batch_operation_progress
DROP CONSTRAINT IF EXISTS batch_operation_progress_batch_id_operation_type_index_key;

-- Create new unique constraint including size
ALTER TABLE public.batch_operation_progress
ADD CONSTRAINT batch_operation_progress_batch_id_operation_type_index_size_key
UNIQUE (batch_id, operation, type_index, size);
