import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DispatchRecord {
  id: string;
  batch_inventory_id: string;
  order_id: string | null;
  invoice_id: string | null;
  quantity_dispatched: number;
  dispatch_date: string;
  destination: string;
  courier_name: string | null;
  tracking_number: string | null;
  dispatched_by: string;
  notes: string | null;
  created_at: string;
}

export const useDispatchHistory = (batchInventoryId: string) => {
  return useQuery({
    queryKey: ['dispatch-records', batchInventoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispatch_records')
        .select('*')
        .eq('batch_inventory_id', batchInventoryId)
        .order('dispatch_date', { ascending: false });

      if (error) throw error;
      return data as DispatchRecord[];
    },
    enabled: !!batchInventoryId,
  });
};

export const useCreateDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<DispatchRecord, 'id' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from('dispatch_records')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-records'] });
      queryClient.invalidateQueries({ queryKey: ['batch-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
      toast.success('Dispatch recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record dispatch: ${error.message}`);
    },
  });
};

export const useUpdateDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<DispatchRecord> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('dispatch_records')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-records'] });
      queryClient.invalidateQueries({ queryKey: ['batch-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
      toast.success('Dispatch record updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dispatch: ${error.message}`);
    },
  });
};

export const useDeleteDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dispatch_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-records'] });
      queryClient.invalidateQueries({ queryKey: ['batch-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
      toast.success('Dispatch record deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete dispatch: ${error.message}`);
    },
  });
};
