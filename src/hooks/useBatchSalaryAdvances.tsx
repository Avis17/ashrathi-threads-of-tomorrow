import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchSalaryAdvance {
  id: string;
  batch_id: string;
  style_id: string;
  operation: string;
  description: string;
  amount: number;
  advance_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useBatchSalaryAdvances = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-salary-advances', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_salary_advances')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BatchSalaryAdvance[];
    },
    enabled: !!batchId,
  });
};

export const useAdvancesForOperation = (batchId: string, styleId: string, operation: string, description: string) => {
  return useQuery({
    queryKey: ['batch-salary-advances', batchId, styleId, operation, description],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_salary_advances')
        .select('*')
        .eq('batch_id', batchId)
        .eq('style_id', styleId)
        .eq('operation', operation)
        .eq('description', description)
        .order('advance_date', { ascending: false });
      if (error) throw error;
      return data as BatchSalaryAdvance[];
    },
    enabled: !!batchId && !!styleId && !!operation,
  });
};

export const useCreateBatchSalaryAdvance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      batch_id: string;
      style_id: string;
      operation: string;
      description: string;
      amount: number;
      advance_date: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('batch_salary_advances')
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-salary-advances', variables.batch_id] });
      toast.success('Advance recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record advance');
    },
  });
};

export const useDeleteBatchSalaryAdvance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, batchId }: { id: string; batchId: string }) => {
      const { error } = await supabase
        .from('batch_salary_advances')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return batchId;
    },
    onSuccess: (batchId) => {
      queryClient.invalidateQueries({ queryKey: ['batch-salary-advances', batchId] });
      toast.success('Advance deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete advance');
    },
  });
};
