import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type ExternalJobCompany = Database['public']['Tables']['external_job_companies']['Row'];
export type ExternalJobOrder = Database['public']['Tables']['external_job_orders']['Row'];
export type ExternalJobOperation = Database['public']['Tables']['external_job_operations']['Row'];
export type ExternalJobOperationCategory = Database['public']['Tables']['external_job_operation_categories']['Row'];
export type ExternalJobPayment = Database['public']['Tables']['external_job_payments']['Row'];

// Companies hooks
export const useExternalJobCompanies = () => {
  return useQuery({
    queryKey: ['external-job-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_companies')
        .select('*')
        .eq('is_active', true)
        .order('company_name');
      if (error) throw error;
      return data as ExternalJobCompany[];
    },
  });
};

export const useCreateExternalJobCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['external_job_companies']['Insert']) => {
      const { data: company, error } = await supabase
        .from('external_job_companies')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-companies'] });
      toast.success('Company registered successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register company');
    },
  });
};

// Job Orders hooks
export const useExternalJobOrders = () => {
  return useQuery({
    queryKey: ['external-job-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_orders')
        .select(`
          *,
          external_job_companies (
            company_name
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useExternalJobOrder = (id: string) => {
  return useQuery({
    queryKey: ['external-job-order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_orders')
        .select(`
          *,
          external_job_companies (*),
          external_job_operations (
            *,
            external_job_operation_categories (*)
          ),
          external_job_payments (*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateExternalJobOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      jobOrder: Database['public']['Tables']['external_job_orders']['Insert'];
      operations: Array<{
        operation_name: string;
        categories: Array<{ category_name: string; rate: number }>;
      }>;
    }) => {
      // Insert job order
      const { data: jobOrder, error: jobError } = await supabase
        .from('external_job_orders')
        .insert([data.jobOrder])
        .select()
        .single();
      if (jobError) throw jobError;

      // Insert operations and categories
      for (const op of data.operations) {
        const totalRate = op.categories.reduce((sum, cat) => sum + cat.rate, 0);
        
        const { data: operation, error: opError } = await supabase
          .from('external_job_operations')
          .insert([{
            job_order_id: jobOrder.id,
            operation_name: op.operation_name,
            total_rate: totalRate,
          }])
          .select()
          .single();
        if (opError) throw opError;

        if (op.categories.length > 0) {
          const categories = op.categories.map(cat => ({
            operation_id: operation.id,
            category_name: cat.category_name,
            rate: cat.rate,
          }));
          
          const { error: catError } = await supabase
            .from('external_job_operation_categories')
            .insert(categories);
          if (catError) throw catError;
        }
      }

      return jobOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-orders'] });
      toast.success('Job order created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create job order');
    },
  });
};

export const useAddExternalJobPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['external_job_payments']['Insert']) => {
      const { data: payment, error } = await supabase
        .from('external_job_payments')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-orders'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
};

export const useUpdateExternalJobOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['external_job_orders']['Update'] }) => {
      const { data: jobOrder, error } = await supabase
        .from('external_job_orders')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return jobOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-orders'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order'] });
      toast.success('Job order updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update job order');
    },
  });
};

// Stats for dashboard
export const useExternalJobOrderStats = () => {
  return useQuery({
    queryKey: ['external-job-order-stats'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('external_job_orders')
        .select('total_amount, paid_amount, balance_amount, payment_status, job_status');
      if (error) throw error;

      const totalAmount = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const paidAmount = orders.reduce((sum, order) => sum + (order.paid_amount || 0), 0);
      const pendingAmount = orders.reduce((sum, order) => sum + (order.balance_amount || 0), 0);
      
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.payment_status] = (acc[order.payment_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const jobStatusCounts = orders.reduce((acc, order) => {
        acc[order.job_status] = (acc[order.job_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalAmount,
        paidAmount,
        pendingAmount,
        totalOrders: orders.length,
        statusCounts,
        jobStatusCounts,
      };
    },
  });
};