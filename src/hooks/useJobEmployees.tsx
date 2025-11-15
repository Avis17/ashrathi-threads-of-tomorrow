import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type JobEmployee = Database['public']['Tables']['job_employees']['Row'];

export const useJobEmployees = () => {
  return useQuery({
    queryKey: ['job-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_employees')
        .select('*, contractor:job_contractors(*)')
        .order('name');
      if (error) throw error;
      return data as JobEmployee[];
    },
  });
};

export const useJobEmployee = (id: string) => {
  return useQuery({
    queryKey: ['job-employee', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as JobEmployee;
    },
    enabled: !!id,
  });
};

export const useCreateJobEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['job_employees']['Insert']) => {
      const { data: employee, error } = await supabase
        .from('job_employees')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      toast.success('Employee added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add employee');
    },
  });
};

export const useUpdateJobEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['job_employees']['Update'] }) => {
      const { data: employee, error } = await supabase
        .from('job_employees')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update employee');
    },
  });
};

export const useDeleteJobEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Cascade delete related records to avoid orphaned entries
      const { error: prodErr } = await supabase
        .from('job_production_entries')
        .delete()
        .eq('employee_id', id);
      if (prodErr) throw prodErr;

      const { error: settErr } = await supabase
        .from('job_weekly_settlements')
        .delete()
        .eq('employee_id', id);
      if (settErr) throw settErr;

      const { error: payErr } = await supabase
        .from('job_part_payments')
        .delete()
        .eq('employee_id', id);
      if (payErr) throw payErr;

      const { error } = await supabase
        .from('job_employees')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      queryClient.invalidateQueries({ queryKey: ['job-production-entries'] });
      queryClient.invalidateQueries({ queryKey: ['job-weekly-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['job-part-payments'] });
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Employee and related records deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete employee');
    },
  });
};
