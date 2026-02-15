import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchJobWork {
  id: string;
  batch_id: string;
  style_id: string;
  type_index: number;
  color: string;
  pieces: number;
  company_id: string | null;
  company_name: string;
  notes: string | null;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface BatchJobWorkOperation {
  id: string;
  job_work_id: string;
  operation: string;
  rate_per_piece: number;
  quantity: number;
  amount: number;
  notes: string | null;
  created_at: string;
}

export const useBatchJobWorks = (batchId?: string) => {
  return useQuery({
    queryKey: ['batch-job-works', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const { data, error } = await supabase
        .from('batch_job_works')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BatchJobWork[];
    },
    enabled: !!batchId,
  });
};

export const useJobWorkOperations = (jobWorkId?: string) => {
  return useQuery({
    queryKey: ['job-work-operations', jobWorkId],
    queryFn: async () => {
      if (!jobWorkId) return [];
      const { data, error } = await supabase
        .from('batch_job_work_operations')
        .select('*')
        .eq('job_work_id', jobWorkId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as BatchJobWorkOperation[];
    },
    enabled: !!jobWorkId,
  });
};

export const useCreateJobWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobWork,
      operations,
    }: {
      jobWork: Omit<BatchJobWork, 'id' | 'total_amount' | 'balance_amount' | 'created_at' | 'updated_at'>;
      operations: Array<{ operation: string; rate_per_piece: number; quantity: number; notes?: string }>;
    }) => {
      const { data: jw, error: jwError } = await supabase
        .from('batch_job_works')
        .insert([jobWork])
        .select()
        .single();
      if (jwError) throw jwError;

      if (operations.length > 0) {
        const opsData = operations.map(op => ({
          job_work_id: jw.id,
          operation: op.operation,
          rate_per_piece: op.rate_per_piece,
          quantity: op.quantity,
          notes: op.notes || null,
        }));
        const { error: opError } = await supabase
          .from('batch_job_work_operations')
          .insert(opsData);
        if (opError) throw opError;
      }

      return jw;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-job-works'] });
      toast.success('Job Work created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create job work');
    },
  });
};

export const useUpdateJobWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BatchJobWork> }) => {
      const { error } = await supabase
        .from('batch_job_works')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-job-works'] });
      toast.success('Job Work updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update job work');
    },
  });
};

export const useDeleteJobWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('batch_job_works')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-job-works'] });
      toast.success('Job Work deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete job work');
    },
  });
};
