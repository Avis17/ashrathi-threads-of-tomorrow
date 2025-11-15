import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useJobBatches } from '@/hooks/useJobBatches';
import { useJobEmployees } from '@/hooks/useJobEmployees';
import { useCreateJobProductionEntry, useJobProductionEntries } from '@/hooks/useJobProduction';
import { toast } from 'sonner';

interface ProductionEntryFormProps {
  onClose: () => void;
}

const ProductionEntryForm = ({ onClose }: ProductionEntryFormProps) => {
  const { data: batches } = useJobBatches();
  const { data: employees } = useJobEmployees();
  const createMutation = useCreateJobProductionEntry();
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      batch_id: '',
      date: new Date().toISOString().split('T')[0],
      section: 'cutting',
      employee_id: '',
      employee_name: '',
      employee_type: 'direct',
      quantity_completed: 0,
      rate_per_piece: 0,
    },
  });

  const batchId = watch('batch_id');
  const employeeId = watch('employee_id');
  const section = watch('section');
  const quantityCompleted = watch('quantity_completed');
  const ratePerPiece = watch('rate_per_piece');

  const selectedBatch = batches?.find(b => b.id === batchId);
  const selectedEmployee = employees?.find(e => e.id === employeeId);
  
  // Fetch production entries for the selected batch
  const { data: productionEntries } = useJobProductionEntries(batchId || undefined);
  
  // Calculate total quantity already used in production entries
  const totalUsedQuantity = productionEntries?.reduce((sum, entry) => sum + entry.quantity_completed, 0) || 0;
  const remainingQuantity = selectedBatch?.cut_quantity ? selectedBatch.cut_quantity - totalUsedQuantity : 0;
  const exceedsLimit = selectedBatch?.cutting_completed && (totalUsedQuantity + quantityCompleted) > (selectedBatch?.cut_quantity || 0);

  // Auto-fill employee details
  const handleEmployeeChange = (empId: string) => {
    const employee = employees?.find(e => e.id === empId);
    if (employee) {
      setValue('employee_id', empId);
      setValue('employee_name', employee.name);
      setValue('employee_type', employee.employee_type);
    }
  };

  // Auto-fill rate based on section and batch style
  const handleSectionChange = (sec: string) => {
    setValue('section', sec);
    if (selectedBatch?.job_styles && typeof selectedBatch.job_styles === 'object') {
      const styles: any = selectedBatch.job_styles;
      const rateMap: any = {
        'cutting': styles.rate_cutting || 0,
        'stitching_singer': styles.rate_stitching_singer || 0,
        'stitching_power_table': styles.rate_stitching_power_table || 0,
        'ironing': styles.rate_ironing || 0,
        'checking': styles.rate_checking || 0,
        'packing': styles.rate_packing || 0,
      };
      setValue('rate_per_piece', rateMap[sec] || 0);
    }
  };

  const totalAmount = quantityCompleted * ratePerPiece;

  const onSubmit = async (data: any) => {
    // Validate against cutting completion
    if (selectedBatch?.cutting_completed) {
      const newTotal = totalUsedQuantity + data.quantity_completed;
      if (newTotal > (selectedBatch.cut_quantity || 0)) {
        toast.error(`Cannot exceed cutting total. You can only add up to ${remainingQuantity} more pieces.`);
        return;
      }
    }
    
    await createMutation.mutateAsync(data);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Add Production Entry
        </h2>
        <p className="text-sm text-muted-foreground">
          Record daily production work
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" {...register('date')} required />
          </div>
          <div className="space-y-2">
            <Label>Section *</Label>
            <Select value={section} onValueChange={handleSectionChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cutting">Cutting</SelectItem>
                <SelectItem value="stitching_singer">Stitching (Singer)</SelectItem>
                <SelectItem value="stitching_power_table">Stitching (Power Table)</SelectItem>
                <SelectItem value="ironing">Ironing</SelectItem>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="packing">Packing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Select Batch *</Label>
          <Select value={batchId} onValueChange={(value) => setValue('batch_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a batch..." />
            </SelectTrigger>
            <SelectContent>
              {batches?.filter(b => b.status !== 'done').map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.batch_number} - {batch.job_styles?.style_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedBatch && (
            <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
              Status: {selectedBatch.status} • Expected: {selectedBatch.expected_pieces} pcs
            </div>
          )}
        </div>

        {/* Validation Alert */}
        {selectedBatch?.cutting_completed && (
          <Alert variant={exceedsLimit ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-semibold">
                  Production Limit: {selectedBatch.cut_quantity} pieces (Cutting Completed)
                </div>
                <div className="text-sm">
                  Used: {totalUsedQuantity} / {selectedBatch.cut_quantity} • Remaining: {remainingQuantity}
                </div>
                {exceedsLimit && (
                  <div className="text-sm font-semibold mt-2">
                    ⚠️ Cannot exceed cutting total! Maximum allowed: {remainingQuantity} pieces
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!selectedBatch?.cutting_completed && selectedBatch && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                ℹ️ Cutting not yet completed for this batch. No quantity validation applied.
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Worker *</Label>
          <Select value={employeeId} onValueChange={handleEmployeeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a worker..." />
            </SelectTrigger>
            <SelectContent>
              {employees?.filter(e => e.is_active).map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employee_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity_completed">Quantity Completed *</Label>
            <Input 
              id="quantity_completed" 
              type="number"
              {...register('quantity_completed', { valueAsNumber: true })} 
              required 
              placeholder="100"
              className={exceedsLimit ? "border-destructive" : ""}
            />
            {selectedBatch?.cutting_completed && (
              <p className="text-xs text-muted-foreground">
                Maximum allowed: {remainingQuantity} pieces
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_per_piece">Rate Per Piece (₹) *</Label>
            <Input 
              id="rate_per_piece" 
              type="number"
              step="0.01"
              {...register('rate_per_piece', { valueAsNumber: true })} 
              required 
              placeholder="8.00"
              className="font-mono"
            />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-primary">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {quantityCompleted} pieces × ₹{ratePerPiece.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-primary to-secondary"
          disabled={createMutation.isPending || exceedsLimit}
        >
          {createMutation.isPending ? 'Saving...' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
};

export default ProductionEntryForm;
