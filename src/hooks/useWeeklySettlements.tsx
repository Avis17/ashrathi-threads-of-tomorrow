import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type WeeklySettlement = Database['public']['Tables']['job_weekly_settlements']['Row'];

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
    mutationFn: async (data: Database['public']['Tables']['job_weekly_settlements']['Insert']) => {
      const { data: settlement, error } = await supabase
        .from('job_weekly_settlements')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return settlement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-weekly-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      toast.success('Weekly settlement recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record settlement');
    },
  });
};

export const useUpdateWeeklySettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['job_weekly_settlements']['Update'] }) => {
      const { data: settlement, error } = await supabase
        .from('job_weekly_settlements')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return settlement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-weekly-settlements'] });
      toast.success('Settlement updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settlement');
    },
  });
};