import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchTypeConfirmed {
  id: string;
  batch_id: string;
  type_index: number;
  confirmed_pieces: number;
  delivery_status: string;
  actual_delivery_date: string | null;
  delivery_notes: string | null;
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
      const actualDeliveryDateMap: Record<number, string | null> = {};
      const deliveryNotesMap: Record<number, string | null> = {};
      rows.forEach(r => {
        confirmedMap[r.type_index] = r.confirmed_pieces;
        statusMap[r.type_index] = (r.delivery_status || 'in_progress') as DeliveryStatus;
        actualDeliveryDateMap[r.type_index] = r.actual_delivery_date || null;
        deliveryNotesMap[r.type_index] = r.delivery_notes || null;
      });
      return { confirmedMap, statusMap, actualDeliveryDateMap, deliveryNotesMap };
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
    mutationFn: async ({ batchId, typeIndex, deliveryStatus, actualDeliveryDate, deliveryNotes }: { batchId: string; typeIndex: number; deliveryStatus: DeliveryStatus; actualDeliveryDate?: string | null; deliveryNotes?: string | null }) => {
      const { error } = await supabase
        .from('batch_type_confirmed' as any)
        .upsert(
          { batch_id: batchId, type_index: typeIndex, delivery_status: deliveryStatus, actual_delivery_date: actualDeliveryDate ?? null, delivery_notes: deliveryNotes ?? null, updated_at: new Date().toISOString() },
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
