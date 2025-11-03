import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductionBatch {
  id: string;
  batch_code: string;
  batch_date: string;
  product_id: string | null;
  product_name: string;
  target_quantity: number;
  actual_quantity: number;
  total_material_cost: number;
  total_labor_cost: number;
  total_overhead_cost: number;
  total_cost: number;
  cost_per_piece: number;
  total_sold_quantity: number;
  total_sales_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  products?: {
    name: string;
    product_code: string;
  };
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  current_cost_per_unit: number;
  available_stock: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BatchMaterial {
  id: string;
  batch_id: string;
  material_id: string;
  material_name: string;
  quantity_used: number;
  cost_per_unit: number;
  total_cost: number;
  created_at: string;
}

export interface BatchCost {
  id: string;
  batch_id: string;
  cost_type: "labor" | "overhead" | "transport" | "other";
  description: string;
  amount: number;
  created_at: string;
}

export interface BatchSale {
  id: string;
  batch_id: string;
  sale_date: string;
  customer_name: string;
  quantity_sold: number;
  price_per_piece: number;
  total_amount: number;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
}

// Fetch all production batches
export const useProductionBatches = () => {
  return useQuery({
    queryKey: ["production-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_batches")
        .select("*, products(name, product_code)")
        .order("batch_date", { ascending: false });

      if (error) throw error;
      return data as ProductionBatch[];
    },
  });
};

// Fetch single batch with all details
export const useBatchDetails = (batchId?: string) => {
  return useQuery({
    queryKey: ["batch-details", batchId],
    enabled: !!batchId,
    queryFn: async () => {
      const [batchRes, materialsRes, costsRes, salesRes] = await Promise.all([
        supabase
          .from("production_batches")
          .select("*, products(name, product_code)")
          .eq("id", batchId!)
          .single(),
        supabase
          .from("batch_materials")
          .select("*")
          .eq("batch_id", batchId!)
          .order("created_at"),
        supabase
          .from("batch_costs")
          .select("*")
          .eq("batch_id", batchId!)
          .order("created_at"),
        supabase
          .from("batch_sales")
          .select("*")
          .eq("batch_id", batchId!)
          .order("sale_date", { ascending: false }),
      ]);

      if (batchRes.error) throw batchRes.error;
      if (materialsRes.error) throw materialsRes.error;
      if (costsRes.error) throw costsRes.error;
      if (salesRes.error) throw salesRes.error;

      return {
        batch: batchRes.data as ProductionBatch,
        materials: materialsRes.data as BatchMaterial[],
        costs: costsRes.data as BatchCost[],
        sales: salesRes.data as BatchSale[],
      };
    },
  });
};

// Create production batch
export const useCreateProductionBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      batch_date: string;
      product_id: string | null;
      product_name: string;
      target_quantity: number;
      actual_quantity?: number;
      notes?: string;
    }) => {
      const { data: batch, error } = await supabase
        .from("production_batches")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Production batch created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create batch: ${error.message}`);
    },
  });
};

// Update production batch
export const useUpdateProductionBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<ProductionBatch> & { id: string }) => {
      const { error } = await supabase
        .from("production_batches")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch-details"] });
      toast.success("Batch updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update batch: ${error.message}`);
    },
  });
};

// Delete production batch
export const useDeleteProductionBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("production_batches")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Batch deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete batch: ${error.message}`);
    },
  });
};

// Add material to batch
export const useAddBatchMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      batch_id: string;
      material_id: string;
      material_name: string;
      quantity_used: number;
      cost_per_unit: number;
      total_cost: number;
    }) => {
      const { error } = await supabase.from("batch_materials").insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-details"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Material added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add material: ${error.message}`);
    },
  });
};

// Add cost to batch
export const useAddBatchCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      batch_id: string;
      cost_type: "labor" | "overhead" | "transport" | "other";
      description: string;
      amount: number;
    }) => {
      const { error } = await supabase.from("batch_costs").insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-details"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Cost added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add cost: ${error.message}`);
    },
  });
};

// Add sale to batch
export const useAddBatchSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      batch_id: string;
      sale_date: string;
      customer_name: string;
      quantity_sold: number;
      price_per_piece: number;
      total_amount: number;
      invoice_number?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.from("batch_sales").insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-details"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Sale recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to record sale: ${error.message}`);
    },
  });
};
