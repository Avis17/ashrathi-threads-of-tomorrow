import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WeightEntry {
  id: string;
  size: string;
  part: 'top' | 'bottom' | 'single'; // top/bottom for set items, single otherwise
  weight_grams: number;
}

export interface BatchDeliveryInfo {
  id: string;
  batch_id: string;
  style_id: string;
  pieces_given: number;
  sample_pieces_given: number;
  weight_entries: WeightEntry[];
  total_product_weight_grams: number;
  total_fabric_weight_grams: number;
  fabric_wastage_percent: number;
  manual_fabric_weight_kg: number | null;
  weight_adjustment_kg: number;
  created_at: string;
  updated_at: string;
}

export function useBatchDeliveryInfo(batchId: string) {
  return useQuery({
    queryKey: ['batch-delivery-info', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_delivery_info')
        .select('*')
        .eq('batch_id', batchId);
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        weight_entries: (d.weight_entries || []) as unknown as WeightEntry[],
      })) as BatchDeliveryInfo[];
    },
    enabled: !!batchId,
  });
}

export function useUpsertBatchDeliveryInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (info: {
      batch_id: string;
      style_id: string;
      pieces_given: number;
      sample_pieces_given: number;
      weight_entries: WeightEntry[];
      total_product_weight_grams: number;
      total_fabric_weight_grams: number;
      fabric_wastage_percent: number;
      manual_fabric_weight_kg?: number | null;
      weight_adjustment_kg?: number;
    }) => {
      const { data, error } = await supabase
        .from('batch_delivery_info')
        .upsert(
          {
            batch_id: info.batch_id,
            style_id: info.style_id,
            pieces_given: info.pieces_given,
            sample_pieces_given: info.sample_pieces_given,
            weight_entries: info.weight_entries as any,
            total_product_weight_grams: info.total_product_weight_grams,
            total_fabric_weight_grams: info.total_fabric_weight_grams,
            fabric_wastage_percent: info.fabric_wastage_percent,
            manual_fabric_weight_kg: info.manual_fabric_weight_kg ?? null,
            weight_adjustment_kg: info.weight_adjustment_kg ?? 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'batch_id,style_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['batch-delivery-info', vars.batch_id] });
    },
  });
}
