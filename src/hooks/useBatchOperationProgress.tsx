import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OperationProgress {
  id: string;
  batch_id: string;
  operation: string;
  completed_pieces: number;
  mistake_pieces: number;
  type_index: number;
  size: string;
  notes: string | null;
  updated_at: string;
  created_at: string;
}

export const useBatchOperationProgress = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-operation-progress', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_operation_progress' as any)
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as OperationProgress[];
    },
    enabled: !!batchId,
  });
};

export const useDeleteOperationProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('batch_operation_progress' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-operation-progress'] });
      toast.success('Entry deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete entry');
    },
  });
};

export const useUpsertOperationProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ batchId, operation, completedPieces, mistakePieces, typeIndex, size }: { batchId: string; operation: string; completedPieces: number; mistakePieces: number; typeIndex: number; size: string }) => {
      const { data, error } = await supabase
        .from('batch_operation_progress' as any)
        .upsert(
          { batch_id: batchId, operation, completed_pieces: completedPieces, mistake_pieces: mistakePieces, type_index: typeIndex, size },
          { onConflict: 'batch_id,operation,type_index,size' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-operation-progress'] });
      toast.success('Progress updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update progress');
    },
  });
};
