import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package } from 'lucide-react';
import { useStockSummary } from '@/hooks/useStockInventory';

export const LowStockAlerts = () => {
  const { data: stockSummary } = useStockSummary();

  const lowStockProducts = stockSummary?.filter(
    p => p.stock_status === 'low_stock' || p.stock_status === 'out_of_stock'
  ).sort((a, b) => a.total_available - b.total_available);

  if (!lowStockProducts || lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts
          <Badge variant="destructive" className="animate-pulse">
            {lowStockProducts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.slice(0, 5).map((product) => (
            <div
              key={product.product_id}
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={product.product_image}
                  alt={product.product_name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold">{product.product_name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge
                      variant={product.stock_status === 'out_of_stock' ? 'destructive' : 'outline'}
                      className={product.stock_status === 'low_stock' ? 'bg-amber-100 text-amber-700' : ''}
                    >
                      {product.total_available} units left
                    </Badge>
                    <span className="text-muted-foreground">
                      Reorder at: {product.reorder_level}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Suggested Reorder</p>
                <p className="text-lg font-bold text-primary">
                  {Math.max(product.reorder_level * 2 - product.total_available, product.reorder_level)}
                </p>
              </div>
            </div>
          ))}
          {lowStockProducts.length > 5 && (
            <Button variant="outline" className="w-full">
              View All {lowStockProducts.length} Alerts
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
