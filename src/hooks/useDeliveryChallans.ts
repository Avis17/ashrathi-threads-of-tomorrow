import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { DeliveryChallan, DeliveryChallanItem, JobWorker, CreateDeliveryChallanInput } from '@/types/deliveryChallan';

export const useDeliveryChallans = () => {
  return useQuery({
    queryKey: ['delivery-challans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_challans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DeliveryChallan[];
    },
  });
};

export const useDeliveryChallan = (id: string) => {
  return useQuery({
    queryKey: ['delivery-challan', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_challans')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as DeliveryChallan;
    },
    enabled: !!id,
  });
};

export const useDeliveryChallanItems = (dcId: string) => {
  return useQuery({
    queryKey: ['delivery-challan-items', dcId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_challan_items')
        .select('*')
        .eq('delivery_challan_id', dcId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as DeliveryChallanItem[];
    },
    enabled: !!dcId,
  });
};

export const useJobWorkers = (activeOnly = true) => {
  return useQuery({
    queryKey: ['job-workers', activeOnly],
    queryFn: async () => {
      let query = supabase.from('job_workers').select('*').order('name');
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as JobWorker[];
    },
  });
};

export const useCreateDeliveryChallan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateDeliveryChallanInput) => {
      const { items, ...dcData } = input;
      
      // Create the DC
      const { data: dc, error: dcError } = await supabase
        .from('delivery_challans')
        .insert({
          dc_date: dcData.dc_date,
          dc_type: dcData.dc_type,
          purpose: dcData.purpose,
          purposes: dcData.purposes,
          job_work_direction: dcData.job_work_direction,
          job_worker_name: dcData.job_worker_name,
          job_worker_address: dcData.job_worker_address,
          job_worker_gstin: dcData.job_worker_gstin,
          vehicle_number: dcData.vehicle_number,
          driver_name: dcData.driver_name,
          driver_mobile: dcData.driver_mobile,
          expected_return_date: dcData.expected_return_date,
          notes: dcData.notes,
        } as any)
        .select()
        .single();
      
      if (dcError) throw dcError;
      
      // Create items
      if (items.length > 0) {
        const itemsWithDcId = items.map(item => ({
          ...item,
          delivery_challan_id: dc.id,
        }));
        
        const { error: itemsError } = await supabase
          .from('delivery_challan_items')
          .insert(itemsWithDcId as any);
        
        if (itemsError) throw itemsError;
      }
      
      return dc as DeliveryChallan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-challans'] });
      toast.success('Delivery Challan created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create Delivery Challan: ' + error.message);
    },
  });
};

export const useUpdateDeliveryChallan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, items, ...data }: Partial<DeliveryChallan> & { id: string; items?: Omit<DeliveryChallanItem, 'id' | 'delivery_challan_id' | 'created_at'>[] }) => {
      // Update the DC header
      const { data: dc, error } = await supabase
        .from('delivery_challans')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // If items provided, delete old items and insert new ones
      if (items && items.length > 0) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('delivery_challan_items')
          .delete()
          .eq('delivery_challan_id', id);
        
        if (deleteError) throw deleteError;
        
        // Insert new items
        const itemsWithDcId = items.map(item => ({
          ...item,
          delivery_challan_id: id,
        }));
        
        const { error: itemsError } = await supabase
          .from('delivery_challan_items')
          .insert(itemsWithDcId as any);
        
        if (itemsError) throw itemsError;
      }
      
      return dc as DeliveryChallan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-challans'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-challan', data.id] });
      queryClient.invalidateQueries({ queryKey: ['delivery-challan-items', data.id] });
      toast.success('Delivery Challan updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update Delivery Challan: ' + error.message);
    },
  });
};

export const useUpdateDeliveryChallanStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DeliveryChallan['status'] }) => {
      const { data, error } = await supabase
        .from('delivery_challans')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as DeliveryChallan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-challans'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-challan', data.id] });
      toast.success(`Status updated to ${data.status}`);
    },
    onError: (error: Error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });
};

export const useCreateJobWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<JobWorker, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: worker, error } = await supabase
        .from('job_workers')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return worker as JobWorker;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-workers'] });
      toast.success('Job Worker added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add Job Worker: ' + error.message);
    },
  });
};

export const useDeleteDeliveryChallan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete items first (due to foreign key)
      const { error: itemsError } = await supabase
        .from('delivery_challan_items')
        .delete()
        .eq('delivery_challan_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete the DC
      const { error } = await supabase
        .from('delivery_challans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-challans'] });
      toast.success('Delivery Challan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete Delivery Challan: ' + error.message);
    },
  });
};
