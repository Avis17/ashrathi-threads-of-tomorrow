import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReturnRejection {
  id: string;
  return_type: 'customer_return' | 'job_rejection';
  reference_id: string | null;
  reference_type: string | null;
  product_name: string;
  quantity: number;
  reason_category: 'stitch' | 'fabric' | 'size' | 'shade' | 'damage' | 'wrong_item' | 'quality' | 'other';
  reason_details: string | null;
  cost_per_unit: number;
  total_cost_impact: number;
  action_taken: 'refund' | 'replacement' | 'repair' | 'rejected' | 'pending' | null;
  customer_name: string | null;
  reported_by: string | null;
  reported_date: string;
  resolved_date: string | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  notes: string | null;
  images: string[] | null;
  batch_id: string | null;
  job_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ReturnType = 'customer_return' | 'job_rejection';
export type ReasonCategory = 'stitch' | 'fabric' | 'size' | 'shade' | 'damage' | 'wrong_item' | 'quality' | 'other';
export type ActionTaken = 'refund' | 'replacement' | 'repair' | 'rejected' | 'pending';
export type RecordStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface CreateReturnRejectionData {
  return_type: ReturnType;
  product_name: string;
  quantity: number;
  reason_category: ReasonCategory;
  reason_details?: string;
  cost_per_unit?: number;
  action_taken?: ActionTaken;
  customer_name?: string;
  reported_by?: string;
  reported_date: string;
  status: RecordStatus;
  notes?: string;
  reference_id?: string;
  reference_type?: string;
}

export const useReturnsRejections = (filters?: {
  type?: string;
  status?: string;
  reason?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['returns-rejections', filters],
    queryFn: async () => {
      let query = supabase
        .from('returns_rejections')
        .select('*')
        .order('reported_date', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('return_type', filters.type);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.reason && filters.reason !== 'all') {
        query = query.eq('reason_category', filters.reason);
      }
      if (filters?.dateFrom) {
        query = query.gte('reported_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('reported_date', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReturnRejection[];
    },
  });
};

export const useReturnsStats = () => {
  return useQuery({
    queryKey: ['returns-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns_rejections')
        .select('*');
      
      if (error) throw error;
      
      const items = data as ReturnRejection[];
      
      const totalReturns = items.filter(i => i.return_type === 'customer_return').length;
      const totalRejections = items.filter(i => i.return_type === 'job_rejection').length;
      const totalCostImpact = items.reduce((sum, i) => sum + (i.total_cost_impact || 0), 0);
      const pendingCount = items.filter(i => i.status === 'pending').length;
      const resolvedCount = items.filter(i => i.status === 'resolved' || i.status === 'closed').length;
      
      const reasonBreakdown = items.reduce((acc, item) => {
        acc[item.reason_category] = (acc[item.reason_category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const monthlyData = items.reduce((acc, item) => {
        const month = item.reported_date.substring(0, 7);
        if (!acc[month]) {
          acc[month] = { returns: 0, rejections: 0, cost: 0 };
        }
        if (item.return_type === 'customer_return') {
          acc[month].returns++;
        } else {
          acc[month].rejections++;
        }
        acc[month].cost += item.total_cost_impact || 0;
        return acc;
      }, {} as Record<string, { returns: number; rejections: number; cost: number }>);

      return {
        totalReturns,
        totalRejections,
        totalCostImpact,
        pendingCount,
        resolvedCount,
        reasonBreakdown,
        monthlyData,
        total: items.length,
      };
    },
  });
};

export const useCreateReturnRejection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateReturnRejectionData) => {
      const { data: result, error } = await supabase
        .from('returns_rejections')
        .insert([{
          ...data,
          total_cost_impact: (data.cost_per_unit || 0) * (data.quantity || 1),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns-rejections'] });
      queryClient.invalidateQueries({ queryKey: ['returns-stats'] });
      toast.success('Record added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add record');
    },
  });
};

export const useUpdateReturnRejection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateReturnRejectionData> }) => {
      const updateData: any = { ...data };
      if (data.cost_per_unit !== undefined && data.quantity !== undefined) {
        updateData.total_cost_impact = data.cost_per_unit * data.quantity;
      }
      
      const { data: result, error } = await supabase
        .from('returns_rejections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns-rejections'] });
      queryClient.invalidateQueries({ queryKey: ['returns-stats'] });
      toast.success('Record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update record');
    },
  });
};

export const useDeleteReturnRejection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('returns_rejections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns-rejections'] });
      queryClient.invalidateQueries({ queryKey: ['returns-stats'] });
      toast.success('Record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete record');
    },
  });
};
