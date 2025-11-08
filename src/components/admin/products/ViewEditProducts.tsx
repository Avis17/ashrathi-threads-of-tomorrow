import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { ProductInventoryView } from './ProductInventoryView';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Search, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductForm, ProductFormData } from './ProductForm';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export function ViewEditProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [viewingInventory, setViewingInventory] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', debouncedSearch, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('display_order', { ascending: true });

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,category.ilike.%${debouncedSearch}%,hsn_code.ilike.%${debouncedSearch}%,product_code.ilike.%${debouncedSearch}%`);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      return { data, count };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData & { inventory?: any[] } }) => {
      const { inventory, ...productData } = data;
      
      const { error: productError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);
      if (productError) throw productError;
      
      // Update inventory if provided
      if (inventory) {
        // Delete existing inventory
        await supabase.from('product_inventory').delete().eq('product_id', id);
        
        // Insert new inventory
        if (inventory.length > 0) {
          const inventoryEntries = inventory.map(inv => ({
            product_id: id,
            size: inv.size,
            color: inv.color,
            available_quantity: inv.quantity,
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
            .eq('id', id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-inventory'] });
      toast({ title: 'Product updated successfully' });
      setEditingProduct(null);
    },
    onError: () => {
      toast({ title: 'Failed to update product', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product deleted successfully' });
      setDeletingProduct(null);
    },
    onError: () => {
      toast({ title: 'Failed to delete product', variant: 'destructive' });
    },
  });

  const totalPages = products?.count ? Math.ceil(products.count / ITEMS_PER_PAGE) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, HSN code, or product code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quality Tier</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>Product Code</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Combos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-64">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <img src="/src/assets/no-data.png" alt="No data found" className="w-48 h-36 object-contain opacity-50" />
                    <div>
                      <p className="text-lg font-semibold text-muted-foreground">No products found</p>
                      <p className="text-sm text-muted-foreground">Try a different search term</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products?.data?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Badge variant={product.quality_tier === 'elite' ? 'default' : 'secondary'}>
                      {product.quality_tier === 'elite' ? '💎 Elite' : '🌿 Smart Basics'}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.hsn_code || '-'}</TableCell>
                  <TableCell>{product.product_code || '-'}</TableCell>
                  <TableCell>{product.price ? `₹${product.price}` : '-'}</TableCell>
                  <TableCell>
                    {product.combo_offers && Array.isArray(product.combo_offers) && product.combo_offers.length > 0 ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        🎁 {product.combo_offers.length}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {product.is_featured && <Badge>Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingInventory({ id: product.id, name: product.name })}
                        title="View Inventory"
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={(data) => updateMutation.mutate({ id: editingProduct.id, data })}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingProduct && deleteMutation.mutate(deletingProduct)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingInventory} onOpenChange={() => setViewingInventory(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Inventory Details</DialogTitle>
          </DialogHeader>
          {viewingInventory && (
            <ProductInventoryView
              productId={viewingInventory.id}
              productName={viewingInventory.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
