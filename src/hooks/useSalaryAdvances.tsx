import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SalaryAdvanceEntry {
  id: string;
  employee_id: string;
  operation: string;
  amount: number;
  advance_date: string;
  notes: string | null;
  status: string;
  closed_at: string | null;
  salary_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  employee?: {
    id: string;
    name: string;
    employee_code: string;
    contractor?: {
      contractor_name: string;
    } | null;
  };
}

export interface CreateAdvanceInput {
  employee_id: string;
  operation: string;
  amount: number;
  advance_date: string;
  notes?: string;
}

export const useSalaryAdvances = () => {
  return useQuery({
    queryKey: ['salary-advances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_advance_entries')
        .select(`
          *,
          employee:job_employees(
            id,
            name,
            employee_code,
            contractor:job_contractors(contractor_name)
          )
        `)
        .order('advance_date', { ascending: false });
      
      if (error) throw error;
      return data as SalaryAdvanceEntry[];
    },
  });
};

export const useOpenAdvancesByOperation = (operation: string) => {
  return useQuery({
    queryKey: ['salary-advances', 'open', operation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_advance_entries')
        .select(`
          *,
          employee:job_employees(
            id,
            name,
            employee_code,
            contractor:job_contractors(contractor_name)
          )
        `)
        .eq('operation', operation)
        .eq('status', 'open')
        .order('advance_date', { ascending: false });
      
      if (error) throw error;
      return data as SalaryAdvanceEntry[];
    },
    enabled: !!operation,
  });
};

export const useCreateSalaryAdvance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateAdvanceInput) => {
      const { data, error } = await supabase
        .from('salary_advance_entries')
        .insert([{
          ...input,
          status: 'open',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-advances'] });
      toast.success('Advance entry created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create advance entry');
    },
  });
};

export const useUpdateSalaryAdvance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAdvanceInput & { status: string }> }) => {
      const { data: result, error } = await supabase
        .from('salary_advance_entries')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-advances'] });
      toast.success('Advance entry updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update advance entry');
    },
  });
};

export const useDeleteSalaryAdvance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salary_advance_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-advances'] });
      toast.success('Advance entry deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete advance entry');
    },
  });
};

export const useCloseAdvances = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ advanceIds, salaryId }: { advanceIds: string[]; salaryId: string }) => {
      const { error } = await supabase
        .from('salary_advance_entries')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          salary_id: salaryId,
        })
        .in('id', advanceIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-advances'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to close advance entries');
    },
  });
};

export const useSalaryAdvanceStats = () => {
  return useQuery({
    queryKey: ['salary-advance-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_advance_entries')
        .select('*');
      
      if (error) throw error;
      
      const advances = data || [];
      
      const totalOpen = advances
        .filter(a => a.status === 'open')
        .reduce((sum, a) => sum + Number(a.amount), 0);
      
      const totalClosed = advances
        .filter(a => a.status === 'closed')
        .reduce((sum, a) => sum + Number(a.amount), 0);
      
      const openCount = advances.filter(a => a.status === 'open').length;
      const closedCount = advances.filter(a => a.status === 'closed').length;
      
      return {
        totalOpen,
        totalClosed,
        openCount,
        closedCount,
        total: advances.length,
      };
    },
  });
};
