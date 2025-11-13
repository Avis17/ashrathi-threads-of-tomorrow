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
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUpdateWeeklySettlement } from '@/hooks/useWeeklySettlements';
import type { WeeklySettlement } from '@/hooks/useWeeklySettlements';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface EditWeeklySettlementFormProps {
  settlement: WeeklySettlement;
  onClose: () => void;
}

const EditWeeklySettlementForm = ({ settlement, onClose }: EditWeeklySettlementFormProps) => {
  const updateMutation = useUpdateWeeklySettlement();

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      payment_date: settlement.payment_date || new Date().toISOString().split('T')[0],
      payment_mode: settlement.payment_mode || 'cash',
      payment_status: settlement.payment_status || 'paid',
      remarks: settlement.remarks || '',
    },
  });

  const onSubmit = async (data: any) => {
    await updateMutation.mutateAsync({
      id: settlement.id,
      data: {
        payment_date: data.payment_date,
        payment_mode: data.payment_mode,
        payment_status: data.payment_status,
        remarks: data.remarks || null,
      },
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Edit Weekly Settlement
        </h2>
        <p className="text-sm text-muted-foreground">
          Update payment details (amounts cannot be modified)
        </p>
      </div>

      <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Total Production</span>
            </div>
            <span className="text-lg font-semibold text-green-600">
              ₹{Number(settlement.total_production_amount || 0).toFixed(2)}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span>Part Payments</span>
            </div>
            <span className="text-lg font-semibold text-orange-600">
              -₹{Number(settlement.total_part_payments || 0).toFixed(2)}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Net Payable</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              ₹{Number(settlement.net_payable || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input id="payment_date" type="date" {...register('payment_date')} />
          </div>

          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select 
              onValueChange={(value) => setValue('payment_status', value)} 
              defaultValue={settlement.payment_status || 'paid'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Payment Mode</Label>
          <Select 
            onValueChange={(value) => setValue('payment_mode', value)} 
            defaultValue={settlement.payment_mode || 'cash'}
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
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            {...register('remarks')}
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
          Update Settlement
        </Button>
      </div>
    </form>
  );
};

export default EditWeeklySettlementForm;
