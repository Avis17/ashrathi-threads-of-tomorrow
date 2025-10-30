import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Eye, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { useStockSummary } from '@/hooks/useStockInventory';
import { Skeleton } from '@/components/ui/skeleton';
import { StockSummary } from '@/hooks/useStockInventory';

interface StockTableProps {
  onViewBatches: (productId: string, productName: string) => void;
}

export const StockTable = ({ onViewBatches }: StockTableProps) => {
  const { data: stockSummary, isLoading } = useStockSummary();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(stockSummary?.map(s => s.category) || []));

  const filteredData = stockSummary?.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.product_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.stock_status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: StockSummary['stock_status']) => {
    const variants = {
      in_stock: { label: 'In Stock', className: 'bg-emerald-100 text-emerald-700' },
      low_stock: { label: 'Low Stock', className: 'bg-amber-100 text-amber-700' },
      out_of_stock: { label: 'Out of Stock', className: 'bg-red-100 text-red-700' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getStockColor = (available: number, reorderLevel: number) => {
    if (available === 0) return 'text-red-600';
    if (available < reorderLevel) return 'text-amber-600';
    return 'text-emerald-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-2xl">Stock Summary</CardTitle>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Batches</TableHead>
                <TableHead className="text-right">Produced</TableHead>
                <TableHead className="text-right">Dispatched</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No stock records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData?.map((item) => (
                  <TableRow key={item.product_id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-12 w-12 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          {item.product_code && (
                            <p className="text-sm text-muted-foreground">{item.product_code}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {item.batch_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{item.total_produced.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingDown className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{item.total_dispatched.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-lg font-bold ${getStockColor(item.total_available, item.reorder_level)}`}>
                        {item.total_available.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(item.stock_status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewBatches(item.product_id, item.product_name)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Batches
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
