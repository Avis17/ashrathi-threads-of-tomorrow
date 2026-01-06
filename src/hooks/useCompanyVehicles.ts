import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyVehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: '2_wheeler' | '3_wheeler' | '4_wheeler';
  ownership_type: 'own' | 'commercial';
  driver_name: string | null;
  driver_phone: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanyVehicles = (activeOnly = true) => {
  return useQuery({
    queryKey: ['company-vehicles', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('company_vehicles')
        .select('*')
        .order('vehicle_number');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompanyVehicle[];
    },
  });
};

export const useCreateCompanyVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<CompanyVehicle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: vehicle, error } = await supabase
        .from('company_vehicles')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return vehicle as CompanyVehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-vehicles'] });
      toast.success('Vehicle added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add vehicle: ' + error.message);
    },
  });
};

export const useUpdateCompanyVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CompanyVehicle> & { id: string }) => {
      const { data: vehicle, error } = await supabase
        .from('company_vehicles')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return vehicle as CompanyVehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-vehicles'] });
      toast.success('Vehicle updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update vehicle: ' + error.message);
    },
  });
};

export const useDeleteCompanyVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_vehicles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-vehicles'] });
      toast.success('Vehicle deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete vehicle: ' + error.message);
    },
  });
};
