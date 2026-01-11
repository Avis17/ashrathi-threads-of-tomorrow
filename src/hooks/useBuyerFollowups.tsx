import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BuyerFollowupMessage {
  id: string;
  title: string;
  message: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFollowupData {
  title: string;
  message: string;
  category: string;
  is_active?: boolean;
}

export const useBuyerFollowups = (filters?: {
  category?: string;
  searchTerm?: string;
}) => {
  return useQuery({
    queryKey: ['buyer-followups', filters],
    queryFn: async () => {
      let query = supabase
        .from('buyer_followup_messages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data as BuyerFollowupMessage[];
      
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          item => 
            item.title.toLowerCase().includes(searchLower) ||
            item.message.toLowerCase().includes(searchLower)
        );
      }
      
      return filteredData;
    },
  });
};

export const useCreateFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateFollowupData) => {
      const { data: result, error } = await supabase
        .from('buyer_followup_messages')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-followups'] });
      toast.success('Message template created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create message');
    },
  });
};

export const useUpdateFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateFollowupData> }) => {
      const { data: result, error } = await supabase
        .from('buyer_followup_messages')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-followups'] });
      toast.success('Message template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update message');
    },
  });
};

export const useDeleteFollowup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('buyer_followup_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-followups'] });
      toast.success('Message template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete message');
    },
  });
};

export const FOLLOWUP_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'inquiry', label: 'Inquiry Response' },
  { value: 'samples', label: 'Samples' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'order', label: 'Order' },
  { value: 'production', label: 'Production' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'payment', label: 'Payment' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'thanks', label: 'Thank You' },
  { value: 'reengagement', label: 'Re-engagement' },
  { value: 'quality', label: 'Quality' },
  { value: 'custom', label: 'Custom Orders' },
  { value: 'greetings', label: 'Greetings' },
  { value: 'general', label: 'General' },
];
