import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type JobContractor = {
  id: string;
  contractor_code: string;
  contractor_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gst_number: string | null;
  payment_terms: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const useJobContractors = () => {
  return useQuery({
    queryKey: ['job-contractors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_contractors')
        .select('*')
        .eq('is_active', true)
        .order('contractor_name');
      if (error) throw error;
      return data as JobContractor[];
    },
  });
};

export const useCreateJobContractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['job_contractors']['Insert']) => {
      const { data: contractor, error } = await supabase
        .from('job_contractors')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return contractor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-contractors'] });
      toast.success('Contractor created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create contractor');
    },
  });
};

export const useUpdateJobContractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['job_contractors']['Update'] }) => {
      const { data: contractor, error } = await supabase
        .from('job_contractors')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return contractor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-contractors'] });
      toast.success('Contractor updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update contractor');
    },
  });
};
