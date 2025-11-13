import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type JobBatchExpense = {
  id: string;
  batch_id: string;
  date: string;
  expense_type: string;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  rate_per_unit: number | null;
  amount: number;
  supplier_name: string | null;
  bill_number: string | null;
  note: string | null;
  created_at: string;
};

export const useJobBatchExpenses = (batchId?: string) => {
  return useQuery({
    queryKey: ['job-batch-expenses', batchId],
    queryFn: async () => {
      let query = supabase
        .from('job_batch_expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (batchId) {
        query = query.eq('batch_id', batchId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as JobBatchExpense[];
    },
  });
};

export const useCreateJobBatchExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<JobBatchExpense>) => {
      const { data: expense, error } = await supabase
        .from('job_batch_expenses')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batch-expenses'] });
      toast.success('Expense added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add expense');
    },
  });
};

export const useUpdateJobBatchExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobBatchExpense> }) => {
      const { data: expense, error } = await supabase
        .from('job_batch_expenses')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batch-expenses'] });
      toast.success('Expense updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update expense');
    },
  });
};

export const useDeleteJobBatchExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_batch_expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batch-expenses'] });
      toast.success('Expense deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete expense');
    },
  });
};
