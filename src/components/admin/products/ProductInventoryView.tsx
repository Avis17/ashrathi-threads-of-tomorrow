import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductInventoryViewProps {
  productId: string;
  productName: string;
}

export function ProductInventoryView({ productId, productName }: ProductInventoryViewProps) {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['product-inventory', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('product_id', productId)
        .order('size', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const totalStock = inventory?.reduce((sum, inv) => sum + inv.available_quantity, 0) || 0;
  const lowStockCount = inventory?.filter(inv => inv.available_quantity < 10).length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Inventory...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory: {productName}
          </CardTitle>
          <div className="flex gap-3">
            <Badge variant="secondary" className="text-sm">
              Total: {totalStock} pieces
            </Badge>
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lowStockCount} low stock
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!inventory || inventory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No inventory entries found for this product
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Original</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Ordered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Badge variant="outline">{inv.size}</Badge>
                  </TableCell>
                  <TableCell>{inv.color}</TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {inv.original_quantity || 0}
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${
                      inv.available_quantity === 0 ? 'text-red-600' :
                      inv.available_quantity < 10 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {inv.available_quantity}
                    </span>
                  </TableCell>
                  <TableCell>{inv.reserved_quantity || 0}</TableCell>
                  <TableCell className="font-medium">
                    {inv.ordered_quantity || 0}
                  </TableCell>
                  <TableCell>
                    {inv.available_quantity === 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : inv.available_quantity < 10 ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(inv.updated_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}