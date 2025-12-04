import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExternalJobExpense {
  id: string;
  job_order_id: string;
  date: string;
  expense_type: string;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  rate_per_unit: number | null;
  amount: number;
  supplier_name: string | null;
  bill_number: string | null;
  notes: string | null;
  created_at: string;
}

export const useExternalJobExpenses = (jobOrderId?: string) => {
  return useQuery({
    queryKey: ['external-job-expenses', jobOrderId],
    queryFn: async () => {
      let query = supabase
        .from('external_job_expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (jobOrderId) {
        query = query.eq('job_order_id', jobOrderId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ExternalJobExpense[];
    },
    enabled: !!jobOrderId,
  });
};

export const useCreateExternalJobExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      job_order_id: string;
      date: string;
      expense_type: string;
      item_name: string;
      quantity?: number | null;
      unit?: string | null;
      rate_per_unit?: number | null;
      amount: number;
      supplier_name?: string | null;
      bill_number?: string | null;
      notes?: string | null;
    }) => {
      const { data: expense, error } = await supabase
        .from('external_job_expenses')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return expense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['external-job-expenses', variables.job_order_id] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order'] });
      toast.success('Expense added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add expense');
    },
  });
};

export const useUpdateExternalJobExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ExternalJobExpense> }) => {
      const { data: expense, error } = await supabase
        .from('external_job_expenses')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order'] });
      toast.success('Expense updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update expense');
    },
  });
};

export const useDeleteExternalJobExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_job_expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order'] });
      toast.success('Expense deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete expense');
    },
  });
};
