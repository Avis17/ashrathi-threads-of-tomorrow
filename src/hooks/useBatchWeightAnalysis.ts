import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchWeightAnalysis {
  id: string;
  batch_id: string;
  style_id: string;
  is_set_item: boolean;
  actual_weight_grams: number | null;
  wastage_percent: number | null;
  top_weight_grams: number | null;
  bottom_weight_grams: number | null;
  top_wastage_percent: number | null;
  bottom_wastage_percent: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeightAnalysisUpsert {
  batch_id: string;
  style_id: string;
  is_set_item: boolean;
  actual_weight_grams?: number | null;
  wastage_percent?: number | null;
  top_weight_grams?: number | null;
  bottom_weight_grams?: number | null;
  top_wastage_percent?: number | null;
  bottom_wastage_percent?: number | null;
  notes?: string | null;
}

export const useBatchWeightAnalysis = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-weight-analysis', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_weight_analysis')
        .select('*')
        .eq('batch_id', batchId);
      if (error) throw error;
      return (data || []) as BatchWeightAnalysis[];
    },
    enabled: !!batchId,
  });
};

export const useUpsertWeightAnalysis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WeightAnalysisUpsert) => {
      const { data: result, error } = await supabase
        .from('batch_weight_analysis')
        .upsert([data], { onConflict: 'batch_id,style_id' })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-weight-analysis', variables.batch_id] });
      toast.success('Weight analysis saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save weight analysis');
    },
  });
};
