import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductForm, ProductFormData } from './ProductForm';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AddProduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData & { inventory?: any[] }) => {
      const { inventory, ...productData } = data;
      
      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData as any)
        .select()
        .single();
      
      if (productError) throw productError;
      
      // Insert inventory entries if provided
      if (inventory && inventory.length > 0) {
        const inventoryEntries = inventory.map(inv => ({
          product_id: product.id,
          size: inv.size,
          color: inv.color,
          available_quantity: inv.quantity,
          original_quantity: inv.quantity,
          ordered_quantity: 0,
        }));
        
        const { error: invError } = await supabase
          .from('product_inventory')
          .insert(inventoryEntries);
        
        if (invError) throw invError;
        
        // Update product total stock
        const totalStock = inventory.reduce((sum, inv) => sum + inv.quantity, 0);
        await supabase
          .from('products')
          .update({ current_total_stock: totalStock })
          .eq('id', product.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add product', variant: 'destructive' });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Enter product details to add to your catalog</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
