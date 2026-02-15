import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchSalaryEntry {
  id: string;
  batch_id: string;
  style_id: string;
  operation: string;
  description: string;
  rate_per_piece: number;
  quantity: number;
  total_amount: number;
  payment_status: string;
  paid_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const useBatchSalaryEntries = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-salary', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_salary_entries')
        .select('*')
        .eq('batch_id', batchId)
        .order('operation');
      if (error) throw error;
      return data as BatchSalaryEntry[];
    },
    enabled: !!batchId,
  });
};

export const useUpsertBatchSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      id?: string;
      batch_id: string;
      style_id: string;
      operation: string;
      description: string;
      rate_per_piece: number;
      quantity: number;
      payment_status: string;
      paid_amount: number;
      notes: string;
    }) => {
      if (entry.id) {
        const { data, error } = await supabase
          .from('batch_salary_entries')
          .update({
            rate_per_piece: entry.rate_per_piece,
            quantity: entry.quantity,
            payment_status: entry.payment_status,
            paid_amount: entry.paid_amount,
            notes: entry.notes,
          })
          .eq('id', entry.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('batch_salary_entries')
          .upsert({
            batch_id: entry.batch_id,
            style_id: entry.style_id,
            operation: entry.operation,
            description: entry.description,
            rate_per_piece: entry.rate_per_piece,
            quantity: entry.quantity,
            payment_status: entry.payment_status,
            paid_amount: entry.paid_amount,
            notes: entry.notes,
          }, { onConflict: 'batch_id,style_id,operation,description' })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-salary', variables.batch_id] });
      toast.success('Salary entry saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save salary entry');
    },
  });
};

export const useDeleteBatchSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, batchId }: { id: string; batchId: string }) => {
      const { error } = await supabase
        .from('batch_salary_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return batchId;
    },
    onSuccess: (batchId) => {
      queryClient.invalidateQueries({ queryKey: ['batch-salary', batchId] });
      toast.success('Entry deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete');
    },
  });
};
