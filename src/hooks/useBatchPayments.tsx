import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchPayment {
  id: string;
  batch_id: string;
  style_id: string | null;
  payment_date: string;
  payment_mode: string;
  amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useBatchPayments = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-payments', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_payments')
        .select('*, job_styles(style_name, style_code)')
        .eq('batch_id', batchId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!batchId,
  });
};

export const useCreateBatchPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      batch_id: string;
      style_id?: string | null;
      payment_date: string;
      payment_mode: string;
      amount: number;
      notes?: string | null;
    }) => {
      const { data: payment, error } = await supabase
        .from('batch_payments')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return payment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-payments', variables.batch_id] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
};

export const useDeleteBatchPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, batchId }: { id: string; batchId: string }) => {
      const { error } = await supabase
        .from('batch_payments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return batchId;
    },
    onSuccess: (batchId) => {
      queryClient.invalidateQueries({ queryKey: ['batch-payments', batchId] });
      toast.success('Payment deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });
};
