import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type JobProductionEntry = Database['public']['Tables']['job_production_entries']['Row'];

export const useJobProductionEntries = (batchId?: string) => {
  return useQuery({
    queryKey: ['job-production-entries', batchId],
    queryFn: async () => {
      let query = supabase
        .from('job_production_entries')
        // join with employees to exclude deleted/disabled employees
        .select('*, job_employees!inner(id, is_active)')
        .not('employee_id', 'is', null)
        .eq('job_employees.is_active', true)
        .order('date', { ascending: false });
      
      if (batchId) {
        query = query.eq('batch_id', batchId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as JobProductionEntry[];
    },
  });
};

export const useCreateJobProductionEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['job_production_entries']['Insert']) => {
      const { data: entry, error } = await supabase
        .from('job_production_entries')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return entry as Database['public']['Tables']['job_production_entries']['Row'];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-production-entries'] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-settlements'] });
      toast.success('Production entry added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add production entry');
    },
  });
};

export const useUpdateJobProductionEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['job_production_entries']['Update'] }) => {
      const { data: entry, error } = await supabase
        .from('job_production_entries')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-production-entries'] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Production entry updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update production entry');
    },
  });
};

export const useDeleteJobProductionEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_production_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-production-entries'] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Production entry deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete production entry');
    },
  });
};
