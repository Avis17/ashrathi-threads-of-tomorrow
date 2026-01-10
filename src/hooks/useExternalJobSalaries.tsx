import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExternalJobSalary {
  id: string;
  job_order_id: string;
  employee_id: string;
  operation: string;
  number_of_pieces: number;
  rate_per_piece: number;
  total_amount: number;
  payment_date: string;
  payment_mode: string | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  job_order?: {
    job_id: string;
    style_name: string;
    number_of_pieces: number;
    is_custom_job: boolean | null;
    custom_products_data: Array<{ name?: string; quantity?: number; rate?: number; total?: number }> | null;
    company?: {
      company_name: string;
    };
  };
  employee?: {
    id: string;
    name: string;
    employee_code: string;
    contractor?: {
      contractor_name: string;
    } | null;
  };
}

export interface CreateSalaryInput {
  job_order_id: string;
  employee_id: string;
  operation: string;
  number_of_pieces: number;
  rate_per_piece: number;
  total_amount: number;
  payment_date: string;
  payment_mode?: string;
  payment_status?: string;
  notes?: string;
}

export const SALARY_OPERATIONS = [
  'CUTTING',
  'STITCHING(SINGER)',
  'STITCHING(POWERTABLE)',
  'STITCHING(OTHER)',
  'CHECKING',
  'IRONING',
  'IRONING AND PACKING',
] as const;

export const useExternalJobSalaries = () => {
  return useQuery({
    queryKey: ['external-job-salaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_salaries')
        .select(`
          *,
          job_order:external_job_orders(
            job_id,
            style_name,
            number_of_pieces,
            is_custom_job,
            custom_products_data,
            company:external_job_companies(company_name)
          ),
          employee:job_employees(
            id,
            name,
            employee_code,
            contractor:job_contractors(contractor_name)
          )
        `)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data as ExternalJobSalary[];
    },
  });
};

export const useExternalJobSalary = (id: string) => {
  return useQuery({
    queryKey: ['external-job-salary', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_salaries')
        .select(`
          *,
          job_order:external_job_orders(
            job_id,
            style_name,
            number_of_pieces,
            is_custom_job,
            custom_products_data,
            company:external_job_companies(company_name)
          ),
          employee:job_employees(
            id,
            name,
            employee_code,
            contractor:job_contractors(contractor_name)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ExternalJobSalary;
    },
    enabled: !!id,
  });
};

export const useExternalJobSalariesByJob = (jobOrderId: string) => {
  return useQuery({
    queryKey: ['external-job-salaries', 'by-job', jobOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_salaries')
        .select(`
          *,
          employee:job_employees(
            id,
            name,
            employee_code,
            contractor:job_contractors(contractor_name)
          )
        `)
        .eq('job_order_id', jobOrderId)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data as ExternalJobSalary[];
    },
    enabled: !!jobOrderId,
  });
};

export const useCreateExternalJobSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateSalaryInput) => {
      const { data, error } = await supabase
        .from('external_job_salaries')
        .insert([input])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-salaries'] });
      toast.success('Salary entry created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create salary entry');
    },
  });
};

export const useUpdateExternalJobSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateSalaryInput> }) => {
      const { data: result, error } = await supabase
        .from('external_job_salaries')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-salaries'] });
      toast.success('Salary entry updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update salary entry');
    },
  });
};

export const useDeleteExternalJobSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_job_salaries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-salaries'] });
      toast.success('Salary entry deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete salary entry');
    },
  });
};

export const useExternalJobSalaryStats = () => {
  return useQuery({
    queryKey: ['external-job-salary-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_salaries')
        .select('*');
      
      if (error) throw error;
      
      const salaries = data || [];
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      // Calculate stats
      const totalSalaryPaid = salaries
        .filter(s => s.payment_status === 'paid')
        .reduce((sum, s) => sum + Number(s.total_amount), 0);
      
      const totalSalaryPending = salaries
        .filter(s => s.payment_status === 'pending')
        .reduce((sum, s) => sum + Number(s.total_amount), 0);
      
      const thisMonthSalaries = salaries.filter(s => {
        const date = new Date(s.payment_date);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });
      
      const thisMonthTotal = thisMonthSalaries.reduce((sum, s) => sum + Number(s.total_amount), 0);
      
      // Group by operation
      const byOperation = salaries.reduce((acc, s) => {
        if (!acc[s.operation]) {
          acc[s.operation] = { count: 0, total: 0 };
        }
        acc[s.operation].count += 1;
        acc[s.operation].total += Number(s.total_amount);
        return acc;
      }, {} as Record<string, { count: number; total: number }>);
      
      // Group by employee
      const byEmployee = salaries.reduce((acc, s) => {
        if (!acc[s.employee_id]) {
          acc[s.employee_id] = { count: 0, total: 0 };
        }
        acc[s.employee_id].count += 1;
        acc[s.employee_id].total += Number(s.total_amount);
        return acc;
      }, {} as Record<string, { count: number; total: number }>);
      
      return {
        totalSalaryPaid,
        totalSalaryPending,
        thisMonthTotal,
        totalEntries: salaries.length,
        byOperation,
        byEmployee,
      };
    },
  });
};
