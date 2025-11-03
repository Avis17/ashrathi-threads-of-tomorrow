import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProductionRun {
  id: string;
  run_code: string;
  product_id: string;
  target_quantity: number;
  actual_quantity: number;
  predicted_yield?: number;
  cost_per_piece: number;
  total_material_cost: number;
  total_labor_cost: number;
  total_overhead_cost: number;
  total_cost: number;
  started_at: string;
  completed_at?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    product_code: string;
  };
}

export interface ProductionRunMaterial {
  id: string;
  production_run_id: string;
  purchase_batch_item_id: string;
  quantity_used_kg: number;
  wastage_kg: number;
  cost_at_time: number;
  recorded_at: string;
  purchase_batch_items?: {
    color: string;
    rate_per_kg: number;
    raw_materials: {
      name: string;
    };
    purchase_batches: {
      batch_code: string;
    };
  };
}

export interface ProductionRunCost {
  id: string;
  production_run_id: string;
  cost_stage: string;
  cost_category: string;
  amount: number;
  description?: string;
  recorded_at: string;
}

export const useProductionRuns = () => {
  return useQuery({
    queryKey: ["production-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_runs" as any)
        .select(`
          *,
          products:product_id (
            id,
            name,
            product_code
          )
        `)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as any as ProductionRun[];
    },
  });
};

export const useProductionRunDetails = (runId?: string) => {
  return useQuery({
    queryKey: ["production-run-details", runId],
    queryFn: async () => {
      if (!runId) return null;

      const [runResult, materialsResult, costsResult] = await Promise.all([
        supabase
          .from("production_runs")
          .select(`
            *,
            products:product_id (
              id,
              name,
              product_code
            )
          `)
          .eq("id", runId)
          .single(),
        supabase
          .from("production_run_materials")
          .select(`
            *,
            purchase_batch_items:purchase_batch_item_id (
              color,
              rate_per_kg,
              raw_materials:raw_material_id (
                name
              ),
              purchase_batches:purchase_batch_id (
                batch_code
              )
            )
          `)
          .eq("production_run_id", runId),
        supabase
          .from("production_run_costs")
          .select("*")
          .eq("production_run_id", runId)
          .order("recorded_at", { ascending: false }),
      ]);

      if (runResult.error) throw runResult.error;
      if (materialsResult.error) throw materialsResult.error;
      if (costsResult.error) throw costsResult.error;

      return {
        run: runResult.data as ProductionRun,
        materials: materialsResult.data as ProductionRunMaterial[],
        costs: costsResult.data as ProductionRunCost[],
      };
    },
    enabled: !!runId,
  });
};

export const useCreateProductionRun = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      product_id: string;
      target_quantity: number;
      notes?: string;
    }) => {
      const { data: run, error } = await supabase
        .from("production_runs")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return run;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-runs"] });
      toast({
        title: "Production run created",
        description: "New production run has been started",
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

export const useUpdateProductionRun = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<ProductionRun> }) => {
      const { data: result, error } = await supabase
        .from("production_runs")
        .update(data.updates)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-runs"] });
      queryClient.invalidateQueries({ queryKey: ["production-run-details"] });
      toast({
        title: "Production run updated",
        description: "Changes have been saved",
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

export const useAddProductionRunMaterial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      production_run_id: string;
      purchase_batch_item_id: string;
      quantity_used_kg: number;
      wastage_kg: number;
      cost_at_time: number;
    }) => {
      const { data: result, error } = await supabase
        .from("production_run_materials")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-runs"] });
      queryClient.invalidateQueries({ queryKey: ["production-run-details"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-batch-details"] });
      toast({
        title: "Material usage recorded",
        description: "Material has been added to production run",
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

export const useAddProductionRunCost = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      production_run_id: string;
      cost_stage: string;
      cost_category: string;
      amount: number;
      description?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("production_run_costs")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-runs"] });
      queryClient.invalidateQueries({ queryKey: ["production-run-details"] });
      toast({
        title: "Cost recorded",
        description: "Production cost has been added",
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

export const useDeleteProductionRun = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from("production_runs")
        .delete()
        .eq("id", runId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-runs"] });
      toast({
        title: "Production run deleted",
        description: "The run has been removed from the system",
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
