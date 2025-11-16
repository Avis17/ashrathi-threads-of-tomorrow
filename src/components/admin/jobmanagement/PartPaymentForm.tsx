import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePartPayment } from '@/hooks/usePartPayments';
import { useJobBatches } from '@/hooks/useJobBatches';
import { toast } from 'sonner';

interface PartPaymentFormProps {
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PartPaymentForm = ({ employeeId, employeeName, onSuccess, onCancel }: PartPaymentFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<any>({
    defaultValues: {
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'cash',
      amount: '',
      note: '',
      batch_id: '',
    }
  });
  const createPayment = useCreatePartPayment();
  const { data: batches } = useJobBatches();

  const onSubmit = async (formData: any) => {
    // Validate batch is not completed
    if (formData.batch_id) {
      const selectedBatch = batches?.find(b => b.id === formData.batch_id);
      if (selectedBatch?.status === 'completed') {
        toast.error('Cannot record payment for completed batch');
        return;
      }
    }
    
    await createPayment.mutateAsync({
      employee_id: employeeId,
      payment_date: formData.payment_date,
      amount: parseFloat(formData.amount),
      payment_mode: formData.payment_mode,
      note: formData.note || null,
      batch_id: formData.batch_id || undefined,
    } as any);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-muted/50 p-3 rounded-lg">
        <p className="text-sm font-medium">Employee: {employeeName}</p>
      </div>

      <div className="space-y-2">
        <Label>Payment Date *</Label>
        <Input
          type="date"
          {...register('payment_date', { required: 'Required' })}
        />
        {errors.payment_date && (
          <span className="text-sm text-destructive">Required</span>
        )}
      </div>

      <div className="space-y-2">
        <Label>Amount (₹) *</Label>
        <Input
          type="number"
          step="0.01"
          {...register('amount', { required: 'Required', min: 0.01 })}
          placeholder="Enter amount"
        />
        {errors.amount && (
          <span className="text-sm text-destructive">Required</span>
        )}
      </div>

      <div className="space-y-2">
        <Label>Batch (Optional)</Label>
        <Select onValueChange={(value) => setValue('batch_id', value === 'none' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select batch..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {batches?.map((batch) => {
              const isCompleted = batch.status === 'completed';
              let statusLabel = '';
              if (isCompleted) {
                statusLabel = ' (Completed - Not Allowed)';
              } else if (batch.packed_quantity && batch.packed_quantity > 0) {
                statusLabel = ' (Packing in Progress)';
              } else if (batch.checked_quantity && batch.checked_quantity > 0) {
                statusLabel = ' (Checking in Progress)';
              } else if (batch.ironing_quantity && batch.ironing_quantity > 0) {
                statusLabel = ' (Ironing in Progress)';
              } else if (batch.stitched_quantity && batch.stitched_quantity > 0) {
                statusLabel = ' (Stitching in Progress)';
              }
              
              return (
                <SelectItem 
                  key={batch.id} 
                  value={batch.id}
                  disabled={isCompleted}
                  className={isCompleted ? 'opacity-50' : ''}
                >
                  {batch.batch_number} {batch.job_styles?.style_name ? `- ${batch.job_styles.style_name}` : ''}{statusLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Payment Mode *</Label>
        <Select 
          defaultValue="cash"
          onValueChange={(value) => setValue('payment_mode', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Note</Label>
        <Textarea
          {...register('note')}
          placeholder="Optional note..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createPayment.isPending}>
          {createPayment.isPending ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
};

export default PartPaymentForm;