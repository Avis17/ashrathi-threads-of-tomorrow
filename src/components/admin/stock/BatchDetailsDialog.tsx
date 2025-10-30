import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  MapPin,
  TrendingUp,
  TrendingDown,
  Truck,
  DollarSign,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useBatchDetails } from '@/hooks/useStockInventory';
import { useDispatchHistory } from '@/hooks/useDispatch';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface BatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string | null;
  onAddDispatch: () => void;
}

export const BatchDetailsDialog = ({
  open,
  onOpenChange,
  batchId,
  onAddDispatch,
}: BatchDetailsDialogProps) => {
  const { data: batch, isLoading } = useBatchDetails(batchId || '');
  const { data: dispatchHistory } = useDispatchHistory(batchId || '');

  const getStatusBadge = (status: string) => {
    const variants = {
      in_production: { label: 'In Production', className: 'bg-blue-100 text-blue-700' },
      in_stock: { label: 'In Stock', className: 'bg-emerald-100 text-emerald-700' },
      low_stock: { label: 'Low Stock', className: 'bg-amber-100 text-amber-700 animate-pulse' },
      out_of_stock: { label: 'Out of Stock', className: 'bg-red-100 text-red-700' },
    };
    const variant = variants[status as keyof typeof variants] || variants.in_stock;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const qcPassRate = batch
    ? batch.quality_check_passed + batch.quality_check_failed > 0
      ? ((batch.quality_check_passed / (batch.quality_check_passed + batch.quality_check_failed)) * 100).toFixed(1)
      : 'N/A'
    : 'N/A';

  const daysInStock = batch
    ? Math.floor((new Date().getTime() - new Date(batch.manufacturing_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading || !batch ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl mb-2">Batch Details</DialogTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold text-primary">
                      {batch.batch_number}
                    </span>
                    {getStatusBadge(batch.status)}
                  </div>
                </div>
                <Button onClick={onAddDispatch} size="lg" className="gap-2">
                  <Truck className="h-4 w-4" />
                  Add Dispatch
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Product Info Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <img
                      src={batch.products?.image_url}
                      alt={batch.products?.name}
                      className="h-20 w-20 rounded-lg object-cover border-2"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{batch.products?.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {batch.products?.product_code || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(batch.manufacturing_date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {daysInStock} days in stock
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Status */}
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Inventory Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        Produced
                      </span>
                      <span className="text-2xl font-bold text-emerald-700">
                        {batch.produced_quantity.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                        Dispatched
                      </span>
                      <span className="text-2xl font-bold text-blue-700">
                        {batch.dispatched_quantity.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between pt-2 border-t-2">
                      <span className="font-semibold flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-teal-600" />
                        Available
                      </span>
                      <span className="text-3xl font-bold text-teal-700">
                        {batch.available_quantity?.toLocaleString() || 0}
                      </span>
                    </div>
                    {batch.warehouse_location && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{batch.warehouse_location}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Production Summary */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Production Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Material Cost</span>
                      <span className="font-semibold">
                        ₹{batch.production_batches?.total_material_cost?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Labor Cost</span>
                      <span className="font-semibold">
                        ₹{batch.production_batches?.total_labor_cost?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Overhead Cost</span>
                      <span className="font-semibold">
                        ₹{batch.production_batches?.total_overhead_cost?.toLocaleString() || 0}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-semibold">Total Cost</span>
                      <span className="text-xl font-bold text-blue-700">
                        ₹{batch.production_batches?.total_cost?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-semibold">Cost Per Piece</span>
                      <span className="text-xl font-bold text-indigo-700">
                        ₹{batch.production_batches?.cost_per_piece?.toFixed(2) || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quality Control */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg">Quality Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm text-muted-foreground">Passed</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-700">
                        {batch.quality_check_passed.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm text-muted-foreground">Failed</span>
                      </div>
                      <p className="text-2xl font-bold text-red-700">
                        {batch.quality_check_failed.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-muted-foreground">Pass Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{qcPassRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dispatch History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Dispatch History
                    <Badge variant="outline">{dispatchHistory?.length || 0}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dispatchHistory && dispatchHistory.length > 0 ? (
                    <div className="space-y-4">
                      {dispatchHistory.map((dispatch, index) => (
                        <div
                          key={dispatch.id}
                          className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30"
                        >
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Truck className="h-4 w-4 text-primary" />
                            </div>
                            {index < dispatchHistory.length - 1 && (
                              <div className="h-full w-0.5 bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">
                                {dispatch.quantity_dispatched.toLocaleString()} units dispatched
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(dispatch.dispatch_date), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="text-muted-foreground">
                                <span className="font-medium">Destination:</span> {dispatch.destination}
                              </p>
                              {dispatch.courier_name && (
                                <p className="text-muted-foreground">
                                  <span className="font-medium">Courier:</span> {dispatch.courier_name}
                                  {dispatch.tracking_number && ` (${dispatch.tracking_number})`}
                                </p>
                              )}
                              <p className="text-muted-foreground">
                                <span className="font-medium">By:</span> {dispatch.dispatched_by}
                              </p>
                            </div>
                            {dispatch.notes && (
                              <p className="text-sm italic text-muted-foreground">{dispatch.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No dispatch records yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {batch.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{batch.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
