import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchInventory {
  id: string;
  batch_id: string | null;
  product_id: string;
  batch_number: string;
  produced_quantity: number;
  dispatched_quantity: number;
  available_quantity: number;
  quality_check_passed: number;
  quality_check_failed: number;
  warehouse_location: string | null;
  status: 'in_production' | 'in_stock' | 'low_stock' | 'out_of_stock';
  manufacturing_date: string;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  products?: {
    name: string;
    image_url: string;
    product_code: string | null;
    category: string;
  };
  production_batches?: {
    batch_number: string;
    cost_per_piece: number;
    total_material_cost?: number;
    total_labor_cost?: number;
    total_overhead_cost?: number;
    total_cost?: number;
  };
}

export interface StockSummary {
  product_id: string;
  product_name: string;
  product_image: string;
  product_code: string | null;
  category: string;
  batch_count: number;
  total_produced: number;
  total_dispatched: number;
  total_available: number;
  reorder_level: number;
  max_stock_level: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const useStockInventory = () => {
  return useQuery({
    queryKey: ['batch-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_inventory')
        .select(`
          *,
          products (
            name,
            image_url,
            product_code,
            category
          ),
          production_batches (
            batch_number,
            cost_per_piece
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BatchInventory[];
    },
  });
};

export const useStockSummary = () => {
  return useQuery({
    queryKey: ['stock-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          image_url,
          product_code,
          category,
          reorder_level,
          max_stock_level,
          current_total_stock
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Get batch counts and totals
      const { data: batchData } = await supabase
        .from('batch_inventory')
        .select('product_id, produced_quantity, dispatched_quantity, available_quantity');

      const summary: StockSummary[] = data.map(product => {
        const batches = batchData?.filter(b => b.product_id === product.id) || [];
        const total_produced = batches.reduce((sum, b) => sum + b.produced_quantity, 0);
        const total_dispatched = batches.reduce((sum, b) => sum + b.dispatched_quantity, 0);
        const total_available = batches.reduce((sum, b) => sum + (b.available_quantity || 0), 0);

        let stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (total_available === 0) {
          stock_status = 'out_of_stock';
        } else if (total_available < (product.reorder_level || 100)) {
          stock_status = 'low_stock';
        }

        return {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          product_code: product.product_code,
          category: product.category,
          batch_count: batches.length,
          total_produced,
          total_dispatched,
          total_available,
          reorder_level: product.reorder_level || 100,
          max_stock_level: product.max_stock_level || 5000,
          stock_status,
        };
      });

      return summary;
    },
  });
};

export const useBatchDetails = (batchId: string) => {
  return useQuery({
    queryKey: ['batch-inventory', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_inventory')
        .select(`
          *,
          products (
            name,
            image_url,
            product_code,
            category,
            fabric
          ),
          production_batches (
            batch_number,
            total_material_cost,
            total_labor_cost,
            total_overhead_cost,
            total_cost,
            cost_per_piece
          )
        `)
        .eq('id', batchId)
        .single();

      if (error) throw error;
      return data as BatchInventory;
    },
    enabled: !!batchId,
  });
};

export const useCreateBatchInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('batch_inventory')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
      toast.success('Batch inventory created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create batch: ${error.message}`);
    },
  });
};

export const useUpdateBatchInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BatchInventory> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('batch_inventory')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
      toast.success('Batch updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update batch: ${error.message}`);
    },
  });
};
