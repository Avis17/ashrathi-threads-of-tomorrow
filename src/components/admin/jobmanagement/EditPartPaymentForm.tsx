import { useForm } from 'react-hook-form';
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
import { useJobBatches } from '@/hooks/useJobBatches';
import { useUpdatePartPayment } from '@/hooks/usePartPayments';
import type { PartPayment } from '@/hooks/usePartPayments';

interface EditPartPaymentFormProps {
  partPayment: PartPayment;
  onClose: () => void;
}

const EditPartPaymentForm = ({ partPayment, onClose }: EditPartPaymentFormProps) => {
  const { data: batches } = useJobBatches();
  const updateMutation = useUpdatePartPayment();

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      payment_date: partPayment.payment_date,
      amount: partPayment.amount,
      payment_mode: partPayment.payment_mode || 'cash',
      batch_id: partPayment.batch_id || '',
      note: partPayment.note || '',
    },
  });

  const onSubmit = async (data: any) => {
    await updateMutation.mutateAsync({
      id: partPayment.id,
      data: {
        payment_date: data.payment_date,
        amount: Number(data.amount),
        payment_mode: data.payment_mode,
        batch_id: data.batch_id === 'none' ? null : data.batch_id || null,
        note: data.note || null,
      },
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Edit Part Payment
        </h2>
        <p className="text-sm text-muted-foreground">
          Update payment details
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input id="payment_date" type="date" {...register('payment_date')} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount')}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Payment Mode *</Label>
          <Select 
            onValueChange={(value) => setValue('payment_mode', value)} 
            defaultValue={partPayment.payment_mode || 'cash'}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Batch (Optional)</Label>
          <Select 
            onValueChange={(value) => setValue('batch_id', value === 'none' ? '' : value)}
            defaultValue={partPayment.batch_id || 'none'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select batch..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {batches?.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.batch_number} {batch.job_styles?.style_name ? `- ${batch.job_styles.style_name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            {...register('note')}
            placeholder="Add any notes..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary">
          Update Payment
        </Button>
      </div>
    </form>
  );
};

export default EditPartPaymentForm;
