import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExportBuyerContact {
  id: string;
  buyer_name: string;
  email: string | null;
  phone: string;
  country: string;
  state: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBuyerContactData {
  buyer_name: string;
  email?: string;
  phone: string;
  country: string;
  state?: string;
  notes?: string;
  is_active?: boolean;
}

export const useExportBuyerContacts = (filters?: {
  country?: string;
  searchTerm?: string;
}) => {
  return useQuery({
    queryKey: ['export-buyer-contacts', filters],
    queryFn: async () => {
      let query = supabase
        .from('export_buyer_contacts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.country && filters.country !== 'all') {
        query = query.eq('country', filters.country);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data as ExportBuyerContact[];
      
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          item => 
            item.buyer_name.toLowerCase().includes(searchLower) ||
            item.phone.includes(searchLower) ||
            (item.email && item.email.toLowerCase().includes(searchLower)) ||
            (item.state && item.state.toLowerCase().includes(searchLower))
        );
      }
      
      return filteredData;
    },
  });
};

export const useCreateBuyerContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateBuyerContactData) => {
      const { data: result, error } = await supabase
        .from('export_buyer_contacts')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-buyer-contacts'] });
      toast.success('Buyer contact added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add buyer contact');
    },
  });
};

export const useUpdateBuyerContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBuyerContactData> }) => {
      const { data: result, error } = await supabase
        .from('export_buyer_contacts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-buyer-contacts'] });
      toast.success('Buyer contact updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update buyer contact');
    },
  });
};

export const useDeleteBuyerContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('export_buyer_contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-buyer-contacts'] });
      toast.success('Buyer contact deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete buyer contact');
    },
  });
};

// Export countries list for dropdown
export const EXPORT_COUNTRIES = [
  { value: 'all', label: 'All Countries' },
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'Morocco', label: 'Morocco' },
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Other', label: 'Other' },
];
