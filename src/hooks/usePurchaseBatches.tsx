import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PurchaseBatch {
  id: string;
  batch_code: string;
  purchase_date: string;
  supplier_name: string;
  supplier_contact?: string;
  supplier_address?: string;
  transport_cost: number;
  loading_cost: number;
  other_costs: number;
  subtotal: number;
  total_cost: number;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseBatchItem {
  id: string;
  purchase_batch_id: string;
  raw_material_id: string;
  color: string;
  quantity_kg: number;
  rate_per_kg: number;
  amount: number;
  remaining_quantity_kg: number;
  created_at: string;
  raw_materials?: {
    id: string;
    name: string;
    unit: string;
  };
}

export const usePurchaseBatches = () => {
  return useQuery({
    queryKey: ["purchase-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_batches" as any)
        .select("*")
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      return data as any as PurchaseBatch[];
    },
  });
};

export const usePurchaseBatchDetails = (batchId?: string) => {
  return useQuery({
    queryKey: ["purchase-batch-details", batchId],
    queryFn: async () => {
      if (!batchId) return null;

      const [batchResult, itemsResult] = await Promise.all([
        supabase
          .from("purchase_batches" as any)
          .select("*")
          .eq("id", batchId)
          .single(),
        supabase
          .from("purchase_batch_items" as any)
          .select(`
            *,
            raw_materials:raw_material_id (
              id,
              name,
              unit
            )
          `)
          .eq("purchase_batch_id", batchId),
      ]);

      if (batchResult.error) throw batchResult.error;
      if (itemsResult.error) throw itemsResult.error;

      return {
        batch: batchResult.data as PurchaseBatch,
        items: itemsResult.data as PurchaseBatchItem[],
      };
    },
    enabled: !!batchId,
  });
};

export const useCreatePurchaseBatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      batch: Omit<PurchaseBatch, "id" | "batch_code" | "created_at" | "updated_at" | "subtotal" | "total_cost">;
      items: Array<{
        raw_material_id: string;
        color: string;
        quantity_kg: number;
        rate_per_kg: number;
      }>;
    }) => {
      // Insert batch
      const { data: batch, error: batchError } = await supabase
        .from("purchase_batches" as any)
        .insert({
          ...data.batch,
          subtotal: 0,
          total_cost: 0,
        } as any)
        .select()
        .single();

      if (batchError) throw batchError;

      // Insert items
      const itemsToInsert = data.items.map(item => ({
        purchase_batch_id: batch.id,
        raw_material_id: item.raw_material_id,
        color: item.color,
        quantity_kg: item.quantity_kg,
        rate_per_kg: item.rate_per_kg,
        amount: item.quantity_kg * item.rate_per_kg,
        remaining_quantity_kg: item.quantity_kg,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_batch_items" as any)
        .insert(itemsToInsert as any);

      if (itemsError) throw itemsError;

      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-batches"] });
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      toast({
        title: "Purchase batch created",
        description: "Materials have been added to inventory",
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

export const useUpdatePurchaseBatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<PurchaseBatch> }) => {
      const { data: result, error } = await supabase
        .from("purchase_batches")
        .update(data.updates)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-batches"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-batch-details"] });
      toast({
        title: "Purchase batch updated",
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

export const useDeletePurchaseBatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchId: string) => {
      const { error } = await supabase
        .from("purchase_batches")
        .delete()
        .eq("id", batchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-batches"] });
      toast({
        title: "Purchase batch deleted",
        description: "The batch has been removed from the system",
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
