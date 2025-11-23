import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductForm, ProductFormData } from '@/components/admin/products/ProductForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddProduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData & { inventory?: any[] }) => {
      const { inventory, ...productData } = data;
      
      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData as any)
        .select()
        .single();
      
      if (productError) {
        console.error('Product insert error:', productError);
        throw productError;
      }
      
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
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product added successfully' });
      navigate('/admin?tab=products');
    },
    onError: () => {
      toast({ title: 'Failed to add product', variant: 'destructive' });
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin?tab=products')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Enter product details to add to your catalog</p>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <ProductForm
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
