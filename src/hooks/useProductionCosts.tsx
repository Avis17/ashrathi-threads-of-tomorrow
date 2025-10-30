import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Material Usage
export const useMaterialUsage = (batchId?: string) => {
  return useQuery({
    queryKey: ["material-usage", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_material_usage")
        .select(`
          *,
          raw_materials:raw_material_id (
            id,
            name,
            unit,
            cost_per_unit,
            current_stock
          )
        `)
        .eq("production_batch_id", batchId!)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!batchId,
  });
};

export const useCreateMaterialUsage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      production_batch_id: string;
      raw_material_id: string;
      quantity_used: number;
      cost_at_time: number;
      notes?: string;
    }) => {
      const total_cost = data.quantity_used * data.cost_at_time;

      const { data: result, error } = await supabase
        .from("production_material_usage")
        .insert({
          ...data,
          total_cost,
        })
        .select()
        .single();

      if (error) throw error;

      // Update raw material stock - decrement by quantity used
      const { data: material } = await supabase
        .from("raw_materials")
        .select("current_stock")
        .eq("id", data.raw_material_id)
        .single();

      if (material) {
        const { error: stockError } = await supabase
          .from("raw_materials")
          .update({
            current_stock: material.current_stock - data.quantity_used,
          })
          .eq("id", data.raw_material_id);

        if (stockError) throw stockError;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-usage"] });
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast({
        title: "Material usage recorded",
        description: "Material consumption has been logged successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Labor Costs
export const useLaborCosts = (batchId?: string) => {
  return useQuery({
    queryKey: ["labor-costs", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_labor_costs")
        .select("*")
        .eq("production_batch_id", batchId!)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!batchId,
  });
};

export const useCreateLaborCost = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      production_batch_id: string;
      labor_type: string;
      worker_name?: string;
      hours_spent: number;
      cost_per_hour: number;
      notes?: string;
    }) => {
      const total_cost = data.hours_spent * data.cost_per_hour;

      const { data: result, error } = await supabase
        .from("production_labor_costs")
        .insert({
          ...data,
          total_cost,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labor-costs"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast({
        title: "Labor cost recorded",
        description: "Labor hours have been logged successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Overhead Costs
export const useOverheadCosts = (batchId?: string) => {
  return useQuery({
    queryKey: ["overhead-costs", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_overhead_costs")
        .select("*")
        .eq("production_batch_id", batchId!)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!batchId,
  });
};

export const useCreateOverheadCost = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      production_batch_id: string;
      cost_type: string;
      amount: number;
      description?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("production_overhead_costs")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overhead-costs"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast({
        title: "Overhead cost recorded",
        description: "Overhead expense has been logged successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Validate batch costs
export const useValidateBatchCosts = (batchId?: string) => {
  return useQuery({
    queryKey: ["validate-batch-costs", batchId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("validate_batch_costs", {
        batch_id: batchId!,
      });

      if (error) throw error;
      return data[0];
    },
    enabled: !!batchId,
  });
};
