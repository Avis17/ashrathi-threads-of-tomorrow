import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Material } from "./useProductionBatches";

// Fetch all materials
export const useMaterials = (activeOnly = false) => {
  return useQuery({
    queryKey: ["materials", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("materials")
        .select("*")
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Material[];
    },
  });
};

// Create material
export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      unit: string;
      current_cost_per_unit: number;
      available_stock?: number;
      reorder_level?: number;
    }) => {
      const { error } = await supabase.from("materials").insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Material created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create material: ${error.message}`);
    },
  });
};

// Update material
export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Material> & { id: string }) => {
      const { error } = await supabase
        .from("materials")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Material updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update material: ${error.message}`);
    },
  });
};

// Delete material
export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("materials")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Material deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete material: ${error.message}`);
    },
  });
};
