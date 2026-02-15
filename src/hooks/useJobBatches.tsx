import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type JobBatch = Database['public']['Tables']['job_batches']['Row'];

export const useJobBatches = () => {
  return useQuery({
    queryKey: ['job-batches'],
    queryFn: async () => {
      const [{ data: batches, error }, { data: cuttingTotals, error: cutError }] = await Promise.all([
        supabase
          .from('job_batches')
          .select('*, job_styles(style_name, style_code)')
          .order('date_created', { ascending: false }),
        supabase
          .from('batch_cutting_logs')
          .select('batch_id, pieces_cut'),
      ]);
      if (error) throw error;
      if (cutError) throw cutError;

      // Aggregate cutting totals per batch
      const cutMap: Record<string, number> = {};
      cuttingTotals?.forEach((log: any) => {
        cutMap[log.batch_id] = (cutMap[log.batch_id] || 0) + log.pieces_cut;
      });

      return (batches || []).map((b: any) => ({
        ...b,
        total_cut_pieces: cutMap[b.id] || 0,
      }));
    },
  });
};

export const useJobBatch = (id: string) => {
  return useQuery({
    queryKey: ['job-batch', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_batches')
        .select('*, job_styles(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateJobBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['job_batches']['Insert']) => {
      const { data: batch, error } = await supabase
        .from('job_batches')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Batch created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create batch');
    },
  });
};

export const useUpdateJobBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['job_batches']['Update'] }) => {
      const { data: batch, error } = await supabase
        .from('job_batches')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      queryClient.invalidateQueries({ queryKey: ['job-batch'] });
      toast.success('Batch updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update batch');
    },
  });
};

export const useDeleteJobBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_batches')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Batch deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete batch');
    },
  });
};
