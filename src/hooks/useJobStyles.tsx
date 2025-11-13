import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type JobStyle = Database['public']['Tables']['job_styles']['Row'];

export const useJobStyles = () => {
  return useQuery({
    queryKey: ['job-styles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_styles')
        .select('*')
        .order('style_code');
      if (error) throw error;
      return data as JobStyle[];
    },
  });
};

export const useJobStyle = (id: string) => {
  return useQuery({
    queryKey: ['job-style', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_styles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as JobStyle;
    },
    enabled: !!id,
  });
};

export const useCreateJobStyle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['job_styles']['Insert']) => {
      const { data: style, error } = await supabase
        .from('job_styles')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return style;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-styles'] });
      toast.success('Style created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create style');
    },
  });
};

export const useUpdateJobStyle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['job_styles']['Update'] }) => {
      const { data: style, error } = await supabase
        .from('job_styles')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return style;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-styles'] });
      toast.success('Style updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update style');
    },
  });
};

export const useDeleteJobStyle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_styles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-styles'] });
      toast.success('Style deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete style');
    },
  });
};
