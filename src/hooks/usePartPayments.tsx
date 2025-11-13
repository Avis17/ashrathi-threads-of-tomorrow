import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type PartPayment = Database['public']['Tables']['job_part_payments']['Row'];

export const usePartPayments = (employeeId?: string) => {
  return useQuery({
    queryKey: ['job-part-payments', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('job_part_payments')
        .select('*')
        .order('payment_date', { ascending: false });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PartPayment[];
    },
  });
};

export const useCreatePartPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['job_part_payments']['Insert']) => {
      const { data: payment, error } = await supabase
        .from('job_part_payments')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-part-payments'] });
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      toast.success('Part payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record part payment');
    },
  });
};

export const useUpdatePartPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['job_part_payments']['Update'] }) => {
      const { data: payment, error } = await supabase
        .from('job_part_payments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-part-payments'] });
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      toast.success('Payment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payment');
    },
  });
};

export const useDeletePartPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_part_payments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-part-payments'] });
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });
};