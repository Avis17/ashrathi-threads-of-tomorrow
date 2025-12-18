import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ProductForm, ProductFormData } from "@/components/admin/products/ProductForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AddProductForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData & { inventory?: any[] }) => {
      const { inventory, ...productData } = data;
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData as any)
        .select()
        .single();
      
      if (productError) throw productError;
      
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
      toast.success("Product added successfully!");
      navigate("/admin-forms");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add product");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin-forms")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Add Product</h1>
            <p className="text-slate-300 mt-1">
              Create a new product with pricing and inventory
            </p>
          </div>
        </div>

        <Card className="p-6 bg-white border-0">
          <ProductForm
            onSubmit={(data) => createProduct.mutate(data)}
            isLoading={createProduct.isPending}
          />
        </Card>
      </div>
    </div>
  );
}
