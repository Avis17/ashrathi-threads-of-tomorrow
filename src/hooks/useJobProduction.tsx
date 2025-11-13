import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type JobProductionEntry = {
  id: string;
  batch_id: string;
  date: string;
  section: string;
  employee_id: string | null;
  employee_name: string;
  employee_type: string;
  quantity_completed: number;
  rate_per_piece: number;
  total_amount: number;
  remarks: string | null;
  created_at: string;
};

export const useJobProductionEntries = (batchId?: string) => {
  return useQuery({
    queryKey: ['job-production-entries', batchId],
    queryFn: async () => {
      let query = supabase
        .from('job_production_entries')
        .select('*')
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
    mutationFn: async (data: Partial<JobProductionEntry>) => {
      const { data: entry, error } = await supabase
        .from('job_production_entries')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-production-entries'] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobProductionEntry> }) => {
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
