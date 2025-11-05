import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobOrder {
  id: string;
  client_company: string;
  contact_person: string;
  contact_number: string | null;
  job_type: string;
  product_name: string;
  total_pieces: number;
  delivery_date: string;
  start_date: string;
  remarks: string | null;
  status: string;
  overall_progress: number;
  created_at: string;
  updated_at: string;
}

export interface JobOrderProcess {
  id: string;
  job_order_id: string;
  process_name: string;
  rate_per_piece: number;
  total_pieces: number;
  total_cost: number;
  assigned_labour: string[];
  completion_percent: number;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface JobOrderLabour {
  id: string;
  job_order_id: string;
  name: string;
  role: string;
  process_assigned: string;
  rate_per_piece: number;
  total_pieces: number;
  total_amount: number;
  payment_status: string;
  paid_amount: number;
  payment_date: string | null;
  created_at: string;
}

export interface JobOrderCostSummary {
  id: string;
  job_order_id: string;
  material_cost: number;
  labour_cost: number;
  transport_cost: number;
  misc_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

// Fetch all job orders
export const useJobOrders = () => {
  return useQuery({
    queryKey: ["job-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobOrder[];
    },
  });
};

// Fetch single job order with details
export const useJobOrderDetails = (jobOrderId?: string) => {
  return useQuery({
    queryKey: ["job-order-details", jobOrderId],
    enabled: !!jobOrderId,
    queryFn: async () => {
      const [orderRes, processesRes, laboursRes, costsRes] = await Promise.all([
        supabase.from("job_orders").select("*").eq("id", jobOrderId!).single(),
        supabase.from("job_order_processes").select("*").eq("job_order_id", jobOrderId!).order("created_at"),
        supabase.from("job_order_labours").select("*").eq("job_order_id", jobOrderId!).order("created_at"),
        supabase.from("job_order_cost_summary").select("*").eq("job_order_id", jobOrderId!).single(),
      ]);

      if (orderRes.error) throw orderRes.error;

      return {
        order: orderRes.data as JobOrder,
        processes: (processesRes.data || []) as JobOrderProcess[],
        labours: (laboursRes.data || []) as JobOrderLabour[],
        costs: costsRes.data as JobOrderCostSummary | null,
      };
    },
  });
};

// Create job order
export const useCreateJobOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<JobOrder, 'id' | 'created_at' | 'updated_at' | 'overall_progress'>) => {
      const { data: order, error } = await supabase
        .from("job_orders")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      // Create cost summary entry
      await supabase.from("job_order_cost_summary").insert({
        job_order_id: order.id,
      });

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-orders"] });
      toast.success("Job order created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create job order: ${error.message}`);
    },
  });
};

// Update job order
export const useUpdateJobOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<JobOrder> & { id: string }) => {
      const { error } = await supabase
        .from("job_orders")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-orders"] });
      queryClient.invalidateQueries({ queryKey: ["job-order-details"] });
      toast.success("Job order updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update job order: ${error.message}`);
    },
  });
};

// Delete job order
export const useDeleteJobOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-orders"] });
      toast.success("Job order deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete job order: ${error.message}`);
    },
  });
};

// Add process to job order
export const useAddJobOrderProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<JobOrderProcess, 'id' | 'created_at' | 'total_cost' | 'completion_percent' | 'status' | 'started_at' | 'ended_at'>) => {
      const { error } = await supabase.from("job_order_processes").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-order-details"] });
      queryClient.invalidateQueries({ queryKey: ["job-orders"] });
      toast.success("Process added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add process: ${error.message}`);
    },
  });
};

// Update process
export const useUpdateJobOrderProcess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<JobOrderProcess> & { id: string }) => {
      const { error } = await supabase
        .from("job_order_processes")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-order-details"] });
      queryClient.invalidateQueries({ queryKey: ["job-orders"] });
      toast.success("Process updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update process: ${error.message}`);
    },
  });
};

// Add labour to job order
export const useAddJobOrderLabour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<JobOrderLabour, 'id' | 'created_at' | 'total_amount' | 'payment_status' | 'paid_amount' | 'payment_date'>) => {
      const { error } = await supabase.from("job_order_labours").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-order-details"] });
      toast.success("Labour added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add labour: ${error.message}`);
    },
  });
};

// Update labour payment
export const useUpdateLabourPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; paid_amount: number; payment_status: string; payment_date?: string }) => {
      const { error } = await supabase
        .from("job_order_labours")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-order-details"] });
      toast.success("Payment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment: ${error.message}`);
    },
  });
};

// Update cost summary
export const useUpdateCostSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ job_order_id, ...data }: { job_order_id: string; material_cost?: number; transport_cost?: number; misc_cost?: number }) => {
      const { error } = await supabase
        .from("job_order_cost_summary")
        .update(data)
        .eq("job_order_id", job_order_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-order-details"] });
      toast.success("Cost summary updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update costs: ${error.message}`);
    },
  });
};
