import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SizePieces {
  [size: string]: number;
}

export interface CuttingLog {
  id: string;
  batch_id: string;
  log_date: string;
  type_index: number;
  color: string;
  style_id: string | null;
  pieces_cut: number;
  size_pieces: SizePieces | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Sync cutting log totals to batch_operation_progress for Cutting operation
const syncCuttingToProgress = async (batchId: string) => {
  // Fetch all cutting logs for this batch
  const { data: logs, error: fetchError } = await supabase
    .from('batch_cutting_logs')
    .select('type_index, size_pieces, pieces_cut')
    .eq('batch_id', batchId);
  if (fetchError) {
    console.error('Failed to fetch cutting logs for sync:', fetchError);
    return;
  }

  // Aggregate per type_index and size
  const totals: Record<string, { typeIndex: number; size: string; completed: number }> = {};
  (logs || []).forEach((log: any) => {
    const ti = log.type_index;
    if (log.size_pieces && typeof log.size_pieces === 'object' && Object.keys(log.size_pieces).length > 0) {
      const sp = log.size_pieces as Record<string, number>;
      Object.entries(sp).forEach(([size, count]) => {
        if (count > 0) {
          const key = `${ti}-${size}`;
          if (!totals[key]) totals[key] = { typeIndex: ti, size, completed: 0 };
          totals[key].completed += count;
        }
      });
    } else {
      // No size_pieces, use aggregate with empty size
      const key = `${ti}-`;
      if (!totals[key]) totals[key] = { typeIndex: ti, size: '', completed: 0 };
      totals[key].completed += log.pieces_cut || 0;
    }
  });

  // Upsert each entry into batch_operation_progress
  const upserts = Object.values(totals).map(({ typeIndex, size, completed }) => ({
    batch_id: batchId,
    operation: 'Cutting',
    type_index: typeIndex,
    size,
    completed_pieces: completed,
    mistake_pieces: 0,
  }));

  if (upserts.length > 0) {
    const { error } = await supabase
      .from('batch_operation_progress' as any)
      .upsert(upserts, { onConflict: 'batch_id,operation,type_index,size' });
    if (error) console.error('Failed to sync cutting to progress:', error);
  }

  // Delete Cutting progress entries for type_index/size combos that no longer exist
  const { data: existingProgress } = await supabase
    .from('batch_operation_progress' as any)
    .select('id, type_index, size')
    .eq('batch_id', batchId)
    .eq('operation', 'Cutting');

  if (existingProgress) {
    const validKeys = new Set(Object.keys(totals));
    const toDelete = (existingProgress as any[]).filter(p => {
      const key = `${p.type_index}-${p.size || ''}`;
      return !validKeys.has(key);
    });
    if (toDelete.length > 0) {
      await supabase
        .from('batch_operation_progress' as any)
        .delete()
        .in('id', toDelete.map((d: any) => d.id));
    }
  }
};

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
      size_pieces?: SizePieces | null;
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
    onSuccess: async (_, variables) => {
      await syncCuttingToProgress(variables.batch_id);
      queryClient.invalidateQueries({ queryKey: ['batch-cutting-logs', variables.batch_id] });
      queryClient.invalidateQueries({ queryKey: ['batch-operation-progress', variables.batch_id] });
      queryClient.invalidateQueries({ queryKey: ['job-batch', variables.batch_id] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Cutting log added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add cutting log');
    },
  });
};

export const useUpdateCuttingLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, batchId, pieces_cut, size_pieces }: { id: string; batchId: string; pieces_cut: number; size_pieces?: SizePieces | null }) => {
      const updateData: any = { pieces_cut };
      if (size_pieces !== undefined) updateData.size_pieces = size_pieces;
      const { error } = await supabase
        .from('batch_cutting_logs')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
      return batchId;
    },
    onSuccess: async (batchId) => {
      await syncCuttingToProgress(batchId);
      queryClient.invalidateQueries({ queryKey: ['batch-cutting-logs', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batch-operation-progress', batchId] });
      queryClient.invalidateQueries({ queryKey: ['job-batch', batchId] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Cutting log updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update cutting log');
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
    onSuccess: async (batchId) => {
      await syncCuttingToProgress(batchId);
      queryClient.invalidateQueries({ queryKey: ['batch-cutting-logs', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batch-operation-progress', batchId] });
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
