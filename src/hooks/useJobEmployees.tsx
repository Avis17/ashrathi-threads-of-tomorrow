import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type JobEmployee = {
  id: string;
  employee_code: string;
  name: string;
  employee_type: string;
  phone: string | null;
  address: string | null;
  contractor_name: string | null;
  rate_type: string | null;
  date_joined: string | null;
  date_left: string | null;
  is_active: boolean;
  created_at: string;
};

export const useJobEmployees = () => {
  return useQuery({
    queryKey: ['job-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_employees')
        .select('*')
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
    mutationFn: async (data: Partial<JobEmployee>) => {
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobEmployee> }) => {
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
      const { error } = await supabase
        .from('job_employees')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-employees'] });
      toast.success('Employee deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete employee');
    },
  });
};
