import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type ExternalJobProduct = Database['public']['Tables']['external_job_products']['Row'];
export type ExternalJobTask = Database['public']['Tables']['external_job_tasks']['Row'];

// Products
export const useExternalJobProducts = () => {
  return useQuery({
    queryKey: ['external-job-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_products')
        .select('*')
        .eq('is_active', true)
        .order('product_name', { ascending: true });
      if (error) throw error;
      return data as ExternalJobProduct[];
    },
  });
};

export const useCreateExternalJobProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productName: string) => {
      const { data, error } = await supabase
        .from('external_job_products')
        .insert([{ product_name: productName, category: 'Unisex' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-products'] });
      toast.success('Product added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add product');
    },
  });
};

// Tasks
export const useExternalJobTasks = (productId?: string) => {
  return useQuery({
    queryKey: ['external-job-tasks', productId],
    queryFn: async () => {
      let query = supabase
        .from('external_job_tasks')
        .select('*')
        .eq('is_active', true);

      if (productId) {
        // Get tasks for this product OR common tasks
        query = query.or(`product_id.eq.${productId},is_common.eq.true`);
      } else {
        // Get all common tasks
        query = query.eq('is_common', true);
      }

      const { data, error } = await query.order('task_name', { ascending: true });
      if (error) throw error;
      return data as ExternalJobTask[];
    },
    enabled: true,
  });
};

export const useCreateExternalJobTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskName, productId, description }: { taskName: string; productId?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('external_job_tasks')
        .insert([{ 
          task_name: taskName, 
          product_id: productId || null,
          is_common: !productId,
          description: description || null
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-tasks'] });
      toast.success('Job task added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add job task');
    },
  });
};