import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type ExternalJobRateCard = Database['public']['Tables']['external_job_rate_cards']['Row'];

export const useExternalJobRateCards = () => {
  return useQuery({
    queryKey: ['external-job-rate-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_rate_cards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ExternalJobRateCard[];
    },
  });
};

export const useExternalJobRateCard = (id: string) => {
  return useQuery({
    queryKey: ['external-job-rate-card', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_rate_cards')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ExternalJobRateCard;
    },
    enabled: !!id,
  });
};

export const useCreateExternalJobRateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['external_job_rate_cards']['Insert']) => {
      const { data: rateCard, error } = await supabase
        .from('external_job_rate_cards')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return rateCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-rate-cards'] });
      toast.success('Rate card created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create rate card');
    },
  });
};

export const useUpdateExternalJobRateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['external_job_rate_cards']['Update'] }) => {
      const { data: rateCard, error } = await supabase
        .from('external_job_rate_cards')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return rateCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-rate-cards'] });
      toast.success('Rate card updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update rate card');
    },
  });
};

export const useDeleteExternalJobRateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_job_rate_cards')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-rate-cards'] });
      toast.success('Rate card deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete rate card');
    },
  });
};
