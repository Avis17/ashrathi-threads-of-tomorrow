import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CuttingLog {
  id: string;
  batch_id: string;
  log_date: string;
  type_index: number;
  color: string;
  style_id: string | null;
  pieces_cut: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useBatchCuttingLogs = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-cutting-logs', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_cutting_logs')
        .select('*')
        .eq('batch_id', batchId)
        .order('log_date', { ascending: false });
      if (error) throw error;
      return data as CuttingLog[];
    },
    enabled: !!batchId,
  });
};

export const useAddCuttingLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      batch_id: string;
      log_date: string;
      type_index: number;
      color: string;
      style_id?: string | null;
      pieces_cut: number;
      notes?: string;
    }) => {
      const { data: log, error } = await supabase
        .from('batch_cutting_logs')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return log;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-cutting-logs', variables.batch_id] });
      queryClient.invalidateQueries({ queryKey: ['job-batch', variables.batch_id] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Cutting log added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add cutting log');
    },
  });
};

export const useDeleteCuttingLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, batchId }: { id: string; batchId: string }) => {
      const { error } = await supabase
        .from('batch_cutting_logs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return batchId;
    },
    onSuccess: (batchId) => {
      queryClient.invalidateQueries({ queryKey: ['batch-cutting-logs', batchId] });
      queryClient.invalidateQueries({ queryKey: ['job-batch', batchId] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Cutting log deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete cutting log');
    },
  });
};

// Helper to get cutting summary per color
export const useCuttingSummary = (batchId: string) => {
  const { data: logs } = useBatchCuttingLogs(batchId);
  
  const summary: Record<number, { total: number; logs: CuttingLog[] }> = {};
  
  logs?.forEach(log => {
    if (!summary[log.type_index]) {
      summary[log.type_index] = { total: 0, logs: [] };
    }
    summary[log.type_index].total += log.pieces_cut;
    summary[log.type_index].logs.push(log);
  });
  
  return summary;
};
