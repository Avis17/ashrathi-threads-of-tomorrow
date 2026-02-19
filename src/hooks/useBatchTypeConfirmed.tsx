import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchTypeConfirmed {
  id: string;
  batch_id: string;
  type_index: number;
  confirmed_pieces: number;
  delivery_status: string;
  updated_at: string;
  created_at: string;
}

export const DELIVERY_STATUSES = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
] as const;

export type DeliveryStatus = 'in_progress' | 'completed' | 'delivered';

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
      const confirmedMap: Record<number, number> = {};
      const statusMap: Record<number, DeliveryStatus> = {};
      rows.forEach(r => {
        confirmedMap[r.type_index] = r.confirmed_pieces;
        statusMap[r.type_index] = (r.delivery_status || 'in_progress') as DeliveryStatus;
      });
      return { confirmedMap, statusMap };
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

export const useUpsertDeliveryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ batchId, typeIndex, deliveryStatus }: { batchId: string; typeIndex: number; deliveryStatus: DeliveryStatus }) => {
      const { error } = await supabase
        .from('batch_type_confirmed' as any)
        .upsert(
          { batch_id: batchId, type_index: typeIndex, delivery_status: deliveryStatus, updated_at: new Date().toISOString() },
          { onConflict: 'batch_id,type_index' }
        );
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-type-confirmed', variables.batchId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
};
