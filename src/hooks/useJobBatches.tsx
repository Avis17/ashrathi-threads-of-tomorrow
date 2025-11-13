import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type JobBatch = {
  id: string;
  batch_number: string;
  style_id: string;
  date_created: string;
  fabric_type: string;
  gsm: string;
  color: string;
  total_fabric_received_kg: number;
  expected_pieces: number;
  cut_quantity: number;
  stitched_quantity: number;
  checked_quantity: number;
  packed_quantity: number;
  final_quantity: number;
  wastage_percent: number;
  supplier_name: string | null;
  lot_number: string | null;
  fabric_width: string | null;
  fabric_shrinkage_percent: number | null;
  dye_test_result: string | null;
  marker_efficiency: number | null;
  status: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export const useJobBatches = () => {
  return useQuery({
    queryKey: ['job-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_batches')
        .select('*, job_styles(style_name, style_code)')
        .order('date_created', { ascending: false });
      if (error) throw error;
      return data;
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
    mutationFn: async (data: Partial<JobBatch>) => {
      const { data: batch, error } = await supabase
        .from('job_batches')
        .insert(data)
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobBatch> }) => {
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
