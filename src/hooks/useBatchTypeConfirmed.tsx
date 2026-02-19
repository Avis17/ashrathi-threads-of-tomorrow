import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchTypeConfirmed {
  id: string;
  batch_id: string;
  type_index: number;
  confirmed_pieces: number;
  updated_at: string;
  created_at: string;
}

export const useBatchTypeConfirmed = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-type-confirmed', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_type_confirmed' as any)
        .select('*')
        .eq('batch_id', batchId);
      if (error) throw error;
      const rows = (data || []) as unknown as BatchTypeConfirmed[];
      // Return as a map: type_index -> confirmed_pieces
      const map: Record<number, number> = {};
      rows.forEach(r => { map[r.type_index] = r.confirmed_pieces; });
      return map;
    },
    enabled: !!batchId,
  });
};

export const useUpsertBatchTypeConfirmed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ batchId, typeIndex, confirmedPieces }: { batchId: string; typeIndex: number; confirmedPieces: number }) => {
      const { error } = await supabase
        .from('batch_type_confirmed' as any)
        .upsert(
          { batch_id: batchId, type_index: typeIndex, confirmed_pieces: confirmedPieces, updated_at: new Date().toISOString() },
          { onConflict: 'batch_id,type_index' }
        );
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-type-confirmed', variables.batchId] });
      toast.success('Confirmed pieces updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update confirmed pieces');
    },
  });
};
