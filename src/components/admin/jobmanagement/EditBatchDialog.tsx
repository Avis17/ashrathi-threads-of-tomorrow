import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateJobBatch } from '@/hooks/useJobBatches';

const BATCH_OPERATIONS = [
  "Cutting",
  "Stitching(Singer)",
  "Stitching(Powertable)",
  "Checking",
  "Ironing",
  "Packing",
] as const;

interface EditBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: any;
}

interface EditFormData {
  date_created: string;
  supplier_name: string;
  lot_number: string;
  remarks: string;
  expected_pieces: number;
}

const EditBatchDialog = ({ open, onOpenChange, batch }: EditBatchDialogProps) => {
  const updateMutation = useUpdateJobBatch();
  const { register, handleSubmit, reset } = useForm<EditFormData>();
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);

  useEffect(() => {
    if (batch && open) {
      reset({
        date_created: batch.date_created || '',
        supplier_name: batch.supplier_name || '',
        lot_number: batch.lot_number || '',
        remarks: batch.remarks || '',
        expected_pieces: batch.expected_pieces || 0,
      });
      // Extract operations from rolls_data
      const rollsData = (batch.rolls_data || []) as any[];
      const ops = rollsData.length > 0 && rollsData[0]?.operations
        ? (rollsData[0].operations as string[])
        : [];
      setSelectedOperations(ops);
    }
  }, [batch, open, reset]);

  const toggleOperation = (op: string) => {
    setSelectedOperations(prev =>
      prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
    );
  };

  const onSubmit = async (data: EditFormData) => {
    // Update operations in all rolls_data entries
    const rollsData = (batch.rolls_data || []) as any[];
    const updatedRollsData = rollsData.map((roll: any) => ({
      ...roll,
      operations: selectedOperations,
    }));

    await updateMutation.mutateAsync({
      id: batch.id,
      data: {
        date_created: data.date_created,
        supplier_name: data.supplier_name || null,
        lot_number: data.lot_number || null,
        remarks: data.remarks || null,
        expected_pieces: data.expected_pieces,
        rolls_data: updatedRollsData,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Batch Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date_created">Taken Date</Label>
            <Input id="date_created" type="date" {...register('date_created')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expected_pieces">Expected Pieces</Label>
            <Input id="expected_pieces" type="number" {...register('expected_pieces', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name</Label>
            <Input id="supplier_name" {...register('supplier_name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lot_number">Lot Number</Label>
            <Input id="lot_number" {...register('lot_number')} />
          </div>

          {/* Operations */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Applicable Operations</Label>
            <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg">
              {BATCH_OPERATIONS.map((op) => (
                <label key={op} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedOperations.includes(op)}
                    onCheckedChange={() => toggleOperation(op)}
                  />
                  <span className="text-sm">{op}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" {...register('remarks')} className="min-h-[80px]" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBatchDialog;
