import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CuttingWastage {
  id: string;
  batch_id: string;
  type_index: number;
  color: string;
  wastage_pieces: number;
  actual_weight_kg: number | null;
  notes: string | null;
  log_date: string;
  created_at: string;
  updated_at: string;
}

export const useBatchCuttingWastage = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-cutting-wastage', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_cutting_wastage')
        .select('*')
        .eq('batch_id', batchId)
        .order('log_date', { ascending: false });
      if (error) throw error;
      return data as CuttingWastage[];
    },
    enabled: !!batchId,
  });
};

export const useAddCuttingWastage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      batch_id: string;
      type_index: number;
      color: string;
      wastage_pieces: number;
      actual_weight_kg?: number | null;
      notes?: string;
      log_date?: string;
    }) => {
      const { data: entry, error } = await supabase
        .from('batch_cutting_wastage')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return entry;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-cutting-wastage', variables.batch_id] });
      toast.success('Wastage entry added');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add wastage entry');
    },
  });
};

export const useDeleteCuttingWastage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, batchId }: { id: string; batchId: string }) => {
      const { error } = await supabase
        .from('batch_cutting_wastage')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return batchId;
    },
    onSuccess: (batchId) => {
      queryClient.invalidateQueries({ queryKey: ['batch-cutting-wastage', batchId] });
      toast.success('Wastage entry deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete wastage entry');
    },
  });
};
