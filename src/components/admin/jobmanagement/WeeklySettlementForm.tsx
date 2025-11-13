import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCreateWeeklySettlement } from '@/hooks/useWeeklySettlements';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { getCurrentWeek, getWeekRange } from '@/lib/weekUtils';

interface WeeklySettlementFormProps {
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const WeeklySettlementForm = ({ employeeId, employeeName, onSuccess, onCancel }: WeeklySettlementFormProps) => {
  const currentWeek = getCurrentWeek();
  const { register, handleSubmit, setValue } = useForm<any>({
    defaultValues: {
      payment_mode: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      remarks: '',
    }
  });
  
  const createSettlement = useCreateWeeklySettlement();
  const { data: partPayments } = usePartPayments(employeeId);
  const { data: production } = useJobProductionEntries();

  const [calculations, setCalculations] = useState({
    production: 0,
    partPayments: 0,
    netPayable: 0,
  });

  useEffect(() => {
    const weekProduction = production?.filter(p => 
      p.employee_id === employeeId &&
      p.date >= currentWeek.start &&
      p.date <= currentWeek.end
    ) || [];

    const weekPartPayments = partPayments?.filter(p => 
      p.payment_date >= currentWeek.start &&
      p.payment_date <= currentWeek.end
    ) || [];

    const totalProduction = weekProduction.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const totalPartPayments = weekPartPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    setCalculations({
      production: totalProduction,
      partPayments: totalPartPayments,
      netPayable: totalProduction - totalPartPayments,
    });
  }, [employeeId, production, partPayments, currentWeek]);

  const onSubmit = async (formData: any) => {
    await createSettlement.mutateAsync({
      employee_id: employeeId,
      week_start_date: currentWeek.start,
      week_end_date: currentWeek.end,
      total_production_amount: calculations.production,
      total_part_payments: calculations.partPayments,
      net_payable: calculations.netPayable,
      payment_date: formData.payment_date,
      payment_status: 'paid',
      payment_mode: formData.payment_mode,
      remarks: formData.remarks || null,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Settlement for {employeeName}</h3>
        <p className="text-sm text-muted-foreground">
          Week: {getWeekRange(currentWeek.start, currentWeek.end)}
        </p>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">Calculation Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Production Earnings</span>
            <span className="font-semibold text-lg">₹{calculations.production.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Part Payments</span>
            <span className="font-semibold text-lg text-destructive">-₹{calculations.partPayments.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-medium text-lg">Net Payable</span>
            <span className="font-bold text-2xl text-primary">₹{calculations.netPayable.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Payment Date *</Label>
          <Input
            type="date"
            {...register('payment_date', { required: true })}
          />
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
          <Label>Remarks</Label>
          <Textarea
            {...register('remarks')}
            placeholder="Optional remarks..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createSettlement.isPending}>
          {createSettlement.isPending ? 'Recording...' : 'Complete Settlement'}
        </Button>
      </div>
    </form>
  );
};

export default WeeklySettlementForm;