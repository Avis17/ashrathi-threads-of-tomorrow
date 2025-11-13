import { useState, useMemo } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useJobBatches } from '@/hooks/useJobBatches';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useCreateWeeklySettlement } from '@/hooks/useWeeklySettlements';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface BatchSettlementFormProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

const BatchSettlementForm = ({ employeeId, employeeName, onClose }: BatchSettlementFormProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  
  const { data: batches } = useJobBatches();
  const { data: productions } = useJobProductionEntries();
  const { data: partPayments } = usePartPayments(employeeId);
  const createSettlement = useCreateWeeklySettlement();

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      batch_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'cash',
      remarks: '',
    },
  });

  const batchId = watch('batch_id');

  // Calculate batch-specific amounts
  const batchCalculations = useMemo(() => {
    if (!batchId || !productions || !partPayments) {
      return { totalProduction: 0, totalPartPayments: 0, netPayable: 0 };
    }

    const totalProduction = productions
      .filter(p => p.employee_id === employeeId && p.batch_id === batchId)
      .reduce((sum, p) => sum + Number(p.total_amount || 0), 0);

    const totalPartPayments = partPayments
      .filter(p => p.batch_id === batchId)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const netPayable = totalProduction - totalPartPayments;

    return { totalProduction, totalPartPayments, netPayable };
  }, [batchId, productions, partPayments, employeeId]);

  const selectedBatch = batches?.find(b => b.id === batchId);

  const onSubmit = (data: any) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!formData || !batchId) return;

    const settlementData = {
      employee_id: employeeId,
      batch_id: batchId,
      week_start_date: new Date().toISOString().split('T')[0],
      week_end_date: new Date().toISOString().split('T')[0],
      total_production_amount: batchCalculations.totalProduction,
      total_part_payments: batchCalculations.totalPartPayments,
      net_payable: batchCalculations.netPayable,
      payment_date: formData.payment_date,
      payment_mode: formData.payment_mode,
      payment_status: 'paid',
      remarks: formData.remarks || `Batch settlement: ${selectedBatch?.batch_number}`,
    };

    await createSettlement.mutateAsync(settlementData);
    setShowConfirmation(false);
    onClose();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Batch Settlement
          </h2>
          <p className="text-sm text-muted-foreground">
            Settle production work for a specific batch
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Batch *</Label>
            <Select value={batchId} onValueChange={(value) => setValue('batch_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose batch..." />
              </SelectTrigger>
              <SelectContent>
                {batches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batch_number} - {batch.job_styles?.style_name || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {batchId && (
            <>
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Total Production</span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      ₹{batchCalculations.totalProduction.toFixed(2)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingDown className="h-4 w-4 text-orange-500" />
                      <span>Part Payments</span>
                    </div>
                    <span className="text-lg font-semibold text-orange-600">
                      -₹{batchCalculations.totalPartPayments.toFixed(2)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span>Net Payable</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      ₹{batchCalculations.netPayable.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input id="payment_date" type="date" {...register('payment_date')} required />
                </div>

                <div className="space-y-2">
                  <Label>Payment Mode *</Label>
                  <Select onValueChange={(value) => setValue('payment_mode', value)} defaultValue="cash">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea 
                  id="remarks" 
                  {...register('remarks')} 
                  placeholder="Add any notes about this settlement..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            disabled={!batchId || batchCalculations.netPayable <= 0}
          >
            Record Settlement
          </Button>
        </div>
      </form>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Batch Settlement</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You are about to record a settlement for:</p>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div><strong>Employee:</strong> {employeeName}</div>
                <div><strong>Batch:</strong> {selectedBatch?.batch_number}</div>
                <div><strong>Net Amount:</strong> ₹{batchCalculations.netPayable.toFixed(2)}</div>
                <div><strong>Payment Date:</strong> {formData?.payment_date}</div>
              </div>
              <p className="text-destructive font-medium mt-2">
                This action cannot be undone. Continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm Settlement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchSettlementForm;
