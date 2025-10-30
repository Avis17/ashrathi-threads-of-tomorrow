import { useState } from 'react';
import { StockOverviewCards } from '@/components/admin/stock/StockOverviewCards';
import { StockTable } from '@/components/admin/stock/StockTable';
import { BatchDetailsDialog } from '@/components/admin/stock/BatchDetailsDialog';
import { DispatchFormDialog } from '@/components/admin/stock/DispatchFormDialog';
import { LowStockAlerts } from '@/components/admin/stock/LowStockAlerts';
import { useStockInventory } from '@/hooks/useStockInventory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Truck } from 'lucide-react';

const StockSummary = () => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [batchesDialogOpen, setBatchesDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [batchDetailsOpen, setBatchDetailsOpen] = useState(false);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);

  const { data: inventory } = useStockInventory();

  const productBatches = inventory?.filter(b => b.product_id === selectedProductId);

  const handleViewBatches = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setBatchesDialogOpen(true);
  };

  const handleViewBatchDetails = (batchId: string) => {
    setSelectedBatchId(batchId);
    setBatchDetailsOpen(true);
  };

  const handleAddDispatch = () => {
    setBatchDetailsOpen(false);
    setDispatchDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      in_production: { label: 'In Production', className: 'bg-blue-100 text-blue-700' },
      in_stock: { label: 'In Stock', className: 'bg-emerald-100 text-emerald-700' },
      low_stock: { label: 'Low Stock', className: 'bg-amber-100 text-amber-700' },
      out_of_stock: { label: 'Out of Stock', className: 'bg-red-100 text-red-700' },
    };
    const variant = variants[status as keyof typeof variants] || variants.in_stock;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Stock Summary & Inventory
        </h1>
        <p className="text-muted-foreground mt-2">
          Track production batches, manage dispatches, and monitor stock levels
        </p>
      </div>

      <StockOverviewCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockTable onViewBatches={handleViewBatches} />
        </div>
        <div>
          <LowStockAlerts />
        </div>
      </div>

      {/* Product Batches Dialog */}
      <Dialog open={batchesDialogOpen} onOpenChange={setBatchesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Batches for {selectedProductName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {productBatches && productBatches.length > 0 ? (
              productBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-bold text-lg text-primary mb-1">
                        {batch.batch_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Manufacturing Date: {new Date(batch.manufacturing_date).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(batch.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="text-sm text-muted-foreground mb-1">Produced</p>
                      <p className="text-xl font-bold text-emerald-700">
                        {batch.produced_quantity.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-muted-foreground mb-1">Dispatched</p>
                      <p className="text-xl font-bold text-blue-700">
                        {batch.dispatched_quantity.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <p className="text-sm text-muted-foreground mb-1">Available</p>
                      <p className="text-xl font-bold text-purple-700">
                        {batch.available_quantity?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBatchDetails(batch.id)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        setDispatchDialogOpen(true);
                      }}
                      disabled={!batch.available_quantity || batch.available_quantity === 0}
                      className="flex-1"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Add Dispatch
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No batches found for this product
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Details Dialog */}
      <BatchDetailsDialog
        open={batchDetailsOpen}
        onOpenChange={setBatchDetailsOpen}
        batchId={selectedBatchId}
        onAddDispatch={handleAddDispatch}
      />

      {/* Dispatch Form Dialog */}
      <DispatchFormDialog
        open={dispatchDialogOpen}
        onOpenChange={setDispatchDialogOpen}
        preselectedBatchId={selectedBatchId}
      />
    </div>
  );
};

export default StockSummary;
