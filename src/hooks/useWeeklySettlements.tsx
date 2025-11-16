import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type WeeklySettlement = Database['public']['Tables']['job_weekly_settlements']['Row'];

export type SettlementInsert = Database['public']['Tables']['job_weekly_settlements']['Insert'];
export type SettlementUpdate = Database['public']['Tables']['job_weekly_settlements']['Update'];

export const useWeeklySettlements = (employeeId?: string) => {
  return useQuery({
    queryKey: ['job-weekly-settlements', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('job_weekly_settlements')
        .select('*')
        .order('week_start_date', { ascending: false });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WeeklySettlement[];
    },
  });
};

export const useCreateWeeklySettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SettlementInsert) => {
      const { data: settlement, error } = await supabase
        .from('job_weekly_settlements')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return settlement as WeeklySettlement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-weekly-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      queryClient.invalidateQueries({ queryKey: ['job-part-payments'] });
      queryClient.invalidateQueries({ queryKey: ['job-production-entries'] });
      toast.success('Settlement recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record settlement');
    },
  });
};

export const useUpdateWeeklySettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SettlementUpdate }) => {
      const { data: settlement, error } = await supabase
        .from('job_weekly_settlements')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return settlement as WeeklySettlement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-weekly-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      toast.success('Settlement updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settlement');
    },
  });
};

export const useDeleteWeeklySettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settlement: WeeklySettlement) => {
      const { employee_id, batch_id, week_start_date, week_end_date } = settlement;
      
      // Step 1: Delete associated production entries
      const { error: prodError } = await supabase
        .from('job_production_entries')
        .delete()
        .eq('employee_id', employee_id)
        .gte('date', week_start_date)
        .lte('date', week_end_date)
        .match(batch_id ? { batch_id } : {});
      
      if (prodError) throw prodError;
      
      // Step 2: Mark part payments as un-settled for this week
      const { error: paymentError } = await supabase
        .from('job_part_payments')
        .update({ is_settled: false })
        .eq('employee_id', employee_id)
        .eq('is_settled', true)
        .gte('payment_date', week_start_date)
        .lte('payment_date', week_end_date);
      
      if (paymentError) throw paymentError;
      
      // Step 3: Delete the settlement record
      const { error: settlementError } = await supabase
        .from('job_weekly_settlements')
        .delete()
        .eq('id', settlement.id);
      
      if (settlementError) throw settlementError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-weekly-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      queryClient.invalidateQueries({ queryKey: ['job-production-entries'] });
      queryClient.invalidateQueries({ queryKey: ['job-part-payments'] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Settlement and related records deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete settlement');
    },
  });
};