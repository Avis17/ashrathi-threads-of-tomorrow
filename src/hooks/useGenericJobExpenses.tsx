import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GenericJobExpense {
  id: string;
  date: string;
  expense_time: string | null;
  category: string;
  subcategory: string | null;
  description: string;
  amount: number;
  supplier_name: string | null;
  bill_number: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateGenericJobExpenseData = Omit<GenericJobExpense, 'id' | 'created_at' | 'updated_at'>;
export type UpdateGenericJobExpenseData = Partial<CreateGenericJobExpenseData>;

// Fetch all generic job expenses
export const useGenericJobExpenses = (filters?: {
  category?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['generic-job-expenses', filters],
    queryFn: async () => {
      let query = supabase
        .from('generic_job_expenses')
        .select('*')
        .order('date', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GenericJobExpense[];
    },
  });
};

// Fetch generic job expense stats
export const useGenericJobExpenseStats = () => {
  return useQuery({
    queryKey: ['generic-job-expense-stats'],
    queryFn: async () => {
      const { data: expenses, error } = await supabase
        .from('generic_job_expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);

      // Total expenses
      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      // This month's expenses
      const thisMonthExpenses = expenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      // Last month's expenses
      const lastMonthExpenses = expenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === lastMonthDate.getMonth() && 
                 expDate.getFullYear() === lastMonthDate.getFullYear();
        })
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      // Category breakdown
      const categoryBreakdown = expenses.reduce((acc, exp) => {
        const category = exp.category || 'Other';
        acc[category] = (acc[category] || 0) + (exp.amount || 0);
        return acc;
      }, {} as Record<string, number>);

      // Convert to array for charts
      const categoryData = Object.entries(categoryBreakdown)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Monthly trend (last 6 months)
      const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(currentYear, currentMonth - (5 - i), 1);
        const monthExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === date.getMonth() && 
                 expDate.getFullYear() === date.getFullYear();
        });
        return {
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          amount: monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
          count: monthExpenses.length,
        };
      });

      // Average monthly expense
      const avgMonthlyExpense = monthlyTrend.reduce((sum, m) => sum + m.amount, 0) / 6;

      // Count by category
      const categoryCount = expenses.reduce((acc, exp) => {
        const category = exp.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalExpenses,
        thisMonthExpenses,
        lastMonthExpenses,
        avgMonthlyExpense,
        categoryBreakdown,
        categoryData,
        categoryCount,
        monthlyTrend,
        totalCount: expenses.length,
      };
    },
  });
};

// Get total generic expenses for deduction calculations
export const useGenericJobExpensesTotal = () => {
  return useQuery({
    queryKey: ['generic-job-expenses-total'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generic_job_expenses')
        .select('amount');

      if (error) throw error;
      return data.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    },
  });
};

// Create new generic job expense
export const useCreateGenericJobExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGenericJobExpenseData) => {
      const { data: expense, error } = await supabase
        .from('generic_job_expenses')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generic-job-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['generic-job-expense-stats'] });
      queryClient.invalidateQueries({ queryKey: ['generic-job-expenses-total'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order-stats'] });
      toast.success('Expense added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add expense');
    },
  });
};

// Update generic job expense
export const useUpdateGenericJobExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGenericJobExpenseData }) => {
      const { data: expense, error } = await supabase
        .from('generic_job_expenses')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generic-job-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['generic-job-expense-stats'] });
      queryClient.invalidateQueries({ queryKey: ['generic-job-expenses-total'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order-stats'] });
      toast.success('Expense updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update expense');
    },
  });
};

// Delete generic job expense
export const useDeleteGenericJobExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('generic_job_expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generic-job-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['generic-job-expense-stats'] });
      queryClient.invalidateQueries({ queryKey: ['generic-job-expenses-total'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order-stats'] });
      toast.success('Expense deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete expense');
    },
  });
};
