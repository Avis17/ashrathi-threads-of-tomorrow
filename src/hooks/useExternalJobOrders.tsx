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

export const useDeleteExternalJobCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from('external_job_companies')
        .delete()
        .eq('id', companyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-companies'] });
      toast.success('Company deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete company');
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
        commission_percent?: number;
        round_off?: number | null;
        adjustment?: number;
        categories: Array<{ category_name: string; rate: number; job_name?: string }>;
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
        const commissionAmount = (totalRate * (op.commission_percent || 0)) / 100;
        const calculatedTotal = totalRate + commissionAmount;
        // Use round_off value if provided, otherwise use calculated total
        const finalTotal = (op.round_off !== null && op.round_off !== undefined) 
          ? op.round_off 
          : calculatedTotal;
        
        const { data: operation, error: opError } = await supabase
          .from('external_job_operations')
          .insert([{
            job_order_id: jobOrder.id,
            operation_name: op.operation_name,
            total_rate: finalTotal,
            commission_percent: op.commission_percent || 0,
            round_off: op.round_off ?? null,
            adjustment: op.adjustment ?? 0,
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
    },
  });
};

export const useDeleteExternalJobOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_job_orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-orders'] });
      toast.success('Job order deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete job order');
    },
  });
};

export const useUpdateExternalJobPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['external_job_payments']['Update'] }) => {
      const { data: payment, error } = await supabase
        .from('external_job_payments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-orders'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order'] });
      toast.success('Payment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payment');
    },
  });
};

export const useDeleteExternalJobPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_job_payments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-orders'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-order'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });
};

// Stats for dashboard (excludes disabled jobs)
export const useExternalJobOrderStats = () => {
  return useQuery({
    queryKey: ['external-job-order-stats'],
    queryFn: async () => {
      const { data: allOrders, error } = await supabase
        .from('external_job_orders')
        .select(`
          *,
          external_job_operations (
            *,
            external_job_operation_categories (*)
          )
        `);
      if (error) throw error;

      // Fetch generic job expenses
      const { data: genericExpenses, error: genericExpError } = await supabase
        .from('generic_job_expenses')
        .select('amount');
      if (genericExpError) throw genericExpError;
      
      const totalGenericExpenses = genericExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

      // Filter out disabled jobs for stats calculations
      const orders = allOrders.filter(order => !(order as any).is_disabled);

      const totalAmount = orders.reduce((sum, order) => sum + (order.total_with_gst || order.total_amount || 0), 0);
      const paidAmount = orders.reduce((sum, order) => sum + (order.paid_amount || 0), 0);
      // Calculate pending amount as total - paid (more accurate than using balance_amount field)
      const pendingAmount = totalAmount - paidAmount;
      const totalPieces = orders.reduce((sum, order) => sum + (order.number_of_pieces || 0), 0);
      
      const statusCounts = orders.reduce((acc, order) => {
        const status = order.payment_status || 'unpaid';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const jobStatusCounts = orders.reduce((acc, order) => {
        const status = order.job_status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate total commission and profit using commission_percent field
      let totalCommission = 0;
      let totalOperationsCost = 0;
      let totalOperationsCostForPaid = 0; // Operations cost only for paid orders
      
      // Calculate payment adjustments (difference between billed and paid for paid orders)
      let paymentAdjustments = 0;
      orders.forEach(order => {
        const isPaid = order.payment_status === 'paid';
        const billedAmount = order.total_with_gst || order.total_amount || 0;
        const paidAmt = order.paid_amount || 0;
        
        // If order is paid, calculate the adjustment (billed - paid)
        if (isPaid && billedAmount > paidAmt) {
          paymentAdjustments += (billedAmount - paidAmt);
        }
        
        order.external_job_operations?.forEach((op: any) => {
          const categoriesTotal = op.external_job_operation_categories
            ?.reduce((sum: number, cat: any) => sum + cat.rate, 0) || 0;
          
          const commissionPercent = op.commission_percent || 0;
          const roundOff = op.round_off || 0;
          const adjustment = op.adjustment || 0;
          
          // Calculate commission
          if (commissionPercent > 0) {
            const commissionAmount = (categoriesTotal * commissionPercent) / 100;
            totalCommission += commissionAmount * order.number_of_pieces;
          }
          
          // Calculate operations cost (using round_off if set, otherwise calculate)
          const operationTotal = roundOff > 0 ? roundOff : (categoriesTotal + (categoriesTotal * commissionPercent / 100) + adjustment);
          totalOperationsCost += operationTotal * order.number_of_pieces;
          
          // Track operations cost for paid orders only
          if (isPaid) {
            totalOperationsCostForPaid += operationTotal * order.number_of_pieces;
          }
        });
      });

      // Calculate gross profit (total amount - operations cost) - this is expected/projected
      const grossProfit = totalAmount - totalOperationsCost;
      
      // Calculate net profit based on actual paid amounts for paid orders
      // Net Profit = Paid Amount - Operations Cost (for paid orders only)
      const paidOrdersAmount = orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + (o.paid_amount || 0), 0);
      const netProfit = paidOrdersAmount - totalOperationsCostForPaid;

      // Calculate Net Profit (Receivable): Sum of PAID orders' (company_profit_value × number_of_pieces - job expenses)
      // Fetch expenses for all orders
      const orderIds = orders.map(o => o.id);
      const { data: expenses } = await supabase
        .from('external_job_expenses')
        .select('*')
        .in('job_order_id', orderIds);
      
      // Group expenses by job_order_id
      const expensesByJob = expenses?.reduce((acc, exp) => {
        acc[exp.job_order_id] = (acc[exp.job_order_id] || 0) + (exp.amount || 0);
        return acc;
      }, {} as Record<string, number>) || {};
      
      // Calculate Net Profit (Receivable) for PAID orders only: (company_profit_value × number_of_pieces) - job expenses - generic expenses
      const paidOrders = orders.filter(o => o.payment_status === 'paid');
      const netProfitReceivableBeforeGeneric = paidOrders.reduce((sum, order) => {
        const grossCompanyProfit = (order.company_profit_value || 0) * (order.number_of_pieces || 0);
        const jobExpenses = expensesByJob[order.id] || 0;
        return sum + (grossCompanyProfit - jobExpenses);
      }, 0);
      
      // Deduct generic expenses from net profit receivable
      const netProfitReceivable = netProfitReceivableBeforeGeneric - totalGenericExpenses;
      
      // Net Profit (Received) = Net Profit (Receivable) - Payment Shortfall
      const netProfitReceived = netProfitReceivable - paymentAdjustments;
      
      // Calculate total gross company profit for margin calculation (for paid orders)
      const totalGrossCompanyProfit = paidOrders.reduce((sum, order) => 
        sum + (order.company_profit_value || 0) * (order.number_of_pieces || 0), 0);
      const netProfitMargin = totalGrossCompanyProfit > 0 
        ? (netProfitReceived / totalGrossCompanyProfit) * 100 
        : 0;

      // Calculate Profit Margin card values (for ALL orders)
      // Total expenses for all orders
      const totalJobExpenses = orders.reduce((sum, order) => sum + (expensesByJob[order.id] || 0), 0);
      
      // Ops Cost: (rate_per_piece - company_profit_value) × number_of_pieces for ALL orders
      const totalOpsCost = orders.reduce((sum, order) => {
        const ratePP = order.rate_per_piece || 0;
        const companyProfit = order.company_profit_value || 0;
        const pieces = order.number_of_pieces || 0;
        return sum + ((ratePP - companyProfit) * pieces);
      }, 0);
      
      // Total GST Collected for all orders
      const totalGstCollected = orders.reduce((sum, order) => sum + (order.gst_amount || 0), 0);
      
      // Gross Profit for Profit Margin card: company_profit_value × number_of_pieces - job expenses - generic expenses (ALL orders)
      const grossProfitForMarginBeforeGeneric = orders.reduce((sum, order) => {
        const companyProfit = (order.company_profit_value || 0) * (order.number_of_pieces || 0);
        const jobExpenses = expensesByJob[order.id] || 0;
        return sum + (companyProfit - jobExpenses);
      }, 0);
      const grossProfitForMargin = grossProfitForMarginBeforeGeneric - totalGenericExpenses;
      
      // Profit Margin calculation: Profit = Revenue − (Ops Cost + Expenses + GST Collected + Generic Expenses)
      const profitMarginValue = totalAmount - (totalOpsCost + totalJobExpenses + totalGstCollected + totalGenericExpenses);
      // Profit Margin (%) = (Profit ÷ Revenue) × 100
      const profitMarginPercent = totalAmount > 0 ? (profitMarginValue / totalAmount) * 100 : 0;

      // Time-based analytics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      // Weekly data (last 7 days)
      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => {
          const orderDate = o.order_date || o.created_at?.split('T')[0];
          return orderDate === dateStr;
        });
        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          orders: dayOrders.length,
          amount: dayOrders.reduce((sum, o) => sum + (o.total_with_gst || o.total_amount || 0), 0),
          pieces: dayOrders.reduce((sum, o) => sum + (o.number_of_pieces || 0), 0),
        };
      });

      // Monthly data (last 12 months)
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const monthOrders = orders.filter(o => {
          const orderDate = new Date(o.order_date || o.created_at || '');
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
        });
        return {
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          orders: monthOrders.length,
          amount: monthOrders.reduce((sum, o) => sum + (o.total_with_gst || o.total_amount || 0), 0),
          pieces: monthOrders.reduce((sum, o) => sum + (o.number_of_pieces || 0), 0),
          profit: monthOrders.reduce((sum, o) => {
            const orderOps = o.external_job_operations || [];
            let opsCost = 0;
            orderOps.forEach((op: any) => {
              const catTotal = op.external_job_operation_categories?.reduce((s: number, c: any) => s + c.rate, 0) || 0;
              opsCost += (op.round_off || catTotal + (catTotal * (op.commission_percent || 0) / 100)) * o.number_of_pieces;
            });
            return sum + ((o.total_with_gst || o.total_amount || 0) - opsCost);
          }, 0),
        };
      });

      // Yearly data (last 5 years)
      const yearlyData = Array.from({ length: 5 }, (_, i) => {
        const year = now.getFullYear() - (4 - i);
        const yearOrders = orders.filter(o => {
          const orderDate = new Date(o.order_date || o.created_at || '');
          return orderDate.getFullYear() === year;
        });
        return {
          name: year.toString(),
          orders: yearOrders.length,
          amount: yearOrders.reduce((sum, o) => sum + (o.total_with_gst || o.total_amount || 0), 0),
          pieces: yearOrders.reduce((sum, o) => sum + (o.number_of_pieces || 0), 0),
        };
      });

      // Company-wise breakdown
      const companyStats = orders.reduce((acc, order) => {
        const companyId = order.company_id;
        if (!acc[companyId]) {
          acc[companyId] = { orders: 0, amount: 0, pieces: 0 };
        }
        acc[companyId].orders += 1;
        acc[companyId].amount += order.total_with_gst || order.total_amount || 0;
        acc[companyId].pieces += order.number_of_pieces || 0;
        return acc;
      }, {} as Record<string, { orders: number; amount: number; pieces: number }>);

      return {
        totalAmount,
        paidAmount,
        pendingAmount,
        totalOrders: orders.length,
        totalPieces,
        statusCounts,
        jobStatusCounts,
        totalCommission,
        totalOperationsCost,
        grossProfit,
        netProfitReceivable,
        netProfitReceived,
        paymentAdjustments,
        netProfitMargin,
        totalJobExpenses,
        totalGenericExpenses,
        totalOpsCost,
        totalGstCollected,
        grossProfitForMargin,
        profitMarginValue,
        profitMarginPercent,
        weeklyData,
        monthlyData,
        yearlyData,
        companyStats,
      };
    },
  });
};