import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStockInventory } from '@/hooks/useStockInventory';
import { useCreateDispatch } from '@/hooks/useDispatch';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DispatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedBatchId?: string | null;
}

export const DispatchFormDialog = ({
  open,
  onOpenChange,
  preselectedBatchId,
}: DispatchFormDialogProps) => {
  const { data: inventory } = useStockInventory();
  const createDispatch = useCreateDispatch();

  const [formData, setFormData] = useState({
    batch_inventory_id: preselectedBatchId || '',
    quantity_dispatched: '',
    dispatch_date: new Date().toISOString().split('T')[0],
    destination: '',
    courier_name: '',
    tracking_number: '',
    dispatched_by: '',
    notes: '',
  });

  const selectedBatch = inventory?.find(b => b.id === formData.batch_inventory_id);
  const maxQuantity = selectedBatch?.available_quantity || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batch_inventory_id) {
      alert('Please select a batch');
      return;
    }

    const quantity = parseInt(formData.quantity_dispatched);
    if (isNaN(quantity) || quantity <= 0 || quantity > maxQuantity) {
      alert(`Please enter a valid quantity (1-${maxQuantity})`);
      return;
    }

    await createDispatch.mutateAsync({
      batch_inventory_id: formData.batch_inventory_id,
      quantity_dispatched: quantity,
      dispatch_date: formData.dispatch_date,
      destination: formData.destination,
      courier_name: formData.courier_name || null,
      tracking_number: formData.tracking_number || null,
      dispatched_by: formData.dispatched_by,
      notes: formData.notes || null,
      order_id: null,
      invoice_id: null,
    });

    // Reset form
    setFormData({
      batch_inventory_id: '',
      quantity_dispatched: '',
      dispatch_date: new Date().toISOString().split('T')[0],
      destination: '',
      courier_name: '',
      tracking_number: '',
      dispatched_by: '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Record Dispatch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="batch">Select Batch *</Label>
            <Select
              value={formData.batch_inventory_id}
              onValueChange={(value) => setFormData({ ...formData, batch_inventory_id: value })}
              disabled={!!preselectedBatchId}
            >
              <SelectTrigger id="batch">
                <SelectValue placeholder="Choose a batch..." />
              </SelectTrigger>
              <SelectContent>
                {inventory?.filter(b => b.available_quantity > 0).map(batch => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batch_number} - {batch.products?.name} (Available: {batch.available_quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBatch && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Available quantity for this batch: <strong>{maxQuantity} units</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Dispatch *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={maxQuantity}
                value={formData.quantity_dispatched}
                onChange={(e) => setFormData({ ...formData, quantity_dispatched: e.target.value })}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Dispatch Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.dispatch_date}
                onChange={(e) => setFormData({ ...formData, dispatch_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination *</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g., Mumbai Warehouse, Customer X"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courier">Courier Name</Label>
              <Input
                id="courier"
                value={formData.courier_name}
                onChange={(e) => setFormData({ ...formData, courier_name: e.target.value })}
                placeholder="e.g., BlueDart, FedEx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                placeholder="Enter tracking number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispatched_by">Dispatched By *</Label>
            <Input
              id="dispatched_by"
              value={formData.dispatched_by}
              onChange={(e) => setFormData({ ...formData, dispatched_by: e.target.value })}
              placeholder="Employee name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this dispatch..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDispatch.isPending}
              className="flex-1"
            >
              {createDispatch.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Dispatch'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
