import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FinalizedRate {
  id: string;
  batch_id: string;
  operation: string;
  rate: number;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useBatchFinalizedRates = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-finalized-rates', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_finalized_rates')
        .select('*')
        .eq('batch_id', batchId)
        .order('operation');
      if (error) throw error;
      return data as FinalizedRate[];
    },
    enabled: !!batchId,
  });
};

export const useUpsertFinalizedRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      batch_id: string;
      operation: string;
      rate: number;
      image_url?: string | null;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('batch_finalized_rates')
        .upsert({
          batch_id: entry.batch_id,
          operation: entry.operation,
          rate: entry.rate,
          image_url: entry.image_url || null,
          notes: entry.notes || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'batch_id,operation' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-finalized-rates', variables.batch_id] });
      toast.success('Rate saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save rate');
    },
  });
};

export const uploadRateProofImage = async (batchId: string, operation: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop();
  const path = `${batchId}/${operation.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('salary-rate-proofs').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('salary-rate-proofs').getPublicUrl(path);
  return data.publicUrl;
};
