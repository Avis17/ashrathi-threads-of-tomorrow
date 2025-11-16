import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Calendar, Plus, Trash2, AlertCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useJobBatches } from '@/hooks/useJobBatches';
import { useJobStyles } from '@/hooks/useJobStyles';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useCreateWeeklySettlement } from '@/hooks/useWeeklySettlements';
import { useCreateJobProductionEntry } from '@/hooks/useJobProduction';
import { getStyleRateForDepartment } from '@/lib/styleRateHelper';
import { supabase } from '@/integrations/supabase/client';

interface ProductionRow {
  batchId: string;
  department: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface FormData {
  settlementDate: string;
  productionRows: ProductionRow[];
  deductAdvances: boolean;
  paymentMode: string;
  remarks: string;
}

interface MultiLineSettlementFormProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

const DEPARTMENTS = [
  'Cutting',
  'Stitching(Singer)',
  'Stitching(Powertable)',
  'Ironing',
  'Checking',
  'Packing',
];

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque'];

const MultiLineSettlementForm = ({
  employeeId,
  employeeName,
  onClose,
}: MultiLineSettlementFormProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  const { data: batches } = useJobBatches();
  const { data: styles } = useJobStyles();
  const { data: partPayments } = usePartPayments(employeeId);
  const createSettlement = useCreateWeeklySettlement();
  const createProductionEntry = useCreateJobProductionEntry();

  // Calculate unsettled advances
  const unsettledAdvances = partPayments?.filter(p => !p.is_settled) || [];
  const totalAdvances = unsettledAdvances.reduce((sum, p) => sum + Number(p.amount), 0);

  const { control, register, watch, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      settlementDate: format(new Date(), 'yyyy-MM-dd'),
      productionRows: [
        { batchId: '', department: '', quantity: 0, rate: 0, amount: 0 },
      ],
      deductAdvances: totalAdvances > 0,
      paymentMode: 'Cash',
      remarks: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'productionRows',
  });

  const watchRows = watch('productionRows');
  const watchDeductAdvances = watch('deductAdvances');

  // Calculate row amount when quantity or rate changes
  const calculateRowAmount = (index: number) => {
    const row = watchRows[index];
    if (row) {
      const amount = (row.quantity || 0) * (row.rate || 0);
      setValue(`productionRows.${index}.amount`, amount);
    }
  };

  // Validate batch limit for a row
  const validateBatchLimit = async (index: number, batchId: string, quantity: number) => {
    if (!batchId || quantity <= 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
      return true;
    }

    try {
      const batch = batches?.find(b => b.id === batchId);
      if (!batch) return true;

      if (!batch.cutting_completed) {
        setValidationErrors(prev => ({
          ...prev,
          [index]: 'Cutting must be completed before recording production',
        }));
        return false;
      }

      // Get existing production for this batch
      const { data: existingProduction } = await supabase
        .from('job_production_entries')
        .select('quantity_completed')
        .eq('batch_id', batchId);

      const totalProduced = existingProduction?.reduce(
        (sum, entry) => sum + entry.quantity_completed,
        0
      ) || 0;

      const cutQuantity = batch.cut_quantity || 0;
      const remaining = cutQuantity - totalProduced;

      if (quantity > remaining) {
        setValidationErrors(prev => ({
          ...prev,
          [index]: `Cannot exceed cutting total! Only ${remaining} pieces remaining out of ${cutQuantity}`,
        }));
        return false;
      }

      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  // Handle batch selection - auto-fill rate based on style
  const handleBatchChange = (index: number, batchId: string) => {
    setValue(`productionRows.${index}.batchId`, batchId);
    
    const batch = batches?.find(b => b.id === batchId);
    if (batch?.style_id) {
      const style = styles?.find(s => s.id === batch.style_id);
      const department = watchRows[index]?.department;
      
      if (style && department) {
        const rate = getStyleRateForDepartment(style, department);
        setValue(`productionRows.${index}.rate`, rate);
        calculateRowAmount(index);
      }
    }
  };

  // Handle department change - auto-fill rate
  const handleDepartmentChange = (index: number, department: string) => {
    setValue(`productionRows.${index}.department`, department);
    
    const batchId = watchRows[index]?.batchId;
    if (batchId) {
      const batch = batches?.find(b => b.id === batchId);
      if (batch?.style_id) {
        const style = styles?.find(s => s.id === batch.style_id);
        if (style) {
          const rate = getStyleRateForDepartment(style, department);
          setValue(`productionRows.${index}.rate`, rate);
          calculateRowAmount(index);
        }
      }
    }
  };

  // Calculate totals
  const totalProductionAmount = watchRows.reduce((sum, row) => sum + (row.amount || 0), 0);
  const advancesDeducted = watchDeductAdvances ? totalAdvances : 0;
  const netPayable = totalProductionAmount - advancesDeducted;

  const onSubmit = async (data: FormData) => {
    // Validate all rows
    const validations = await Promise.all(
      data.productionRows.map((row, index) =>
        validateBatchLimit(index, row.batchId, row.quantity)
      )
    );

    if (!validations.every(v => v)) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    if (data.productionRows.length === 0 || data.productionRows.some(r => !r.batchId || !r.department || r.quantity <= 0)) {
      toast.error('Please add at least one valid production entry');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    const data = watch();
    
    try {
      // Create settlement record
      const settlementData = {
        employee_id: employeeId,
        settlement_date: data.settlementDate,
        week_start_date: null,
        week_end_date: null,
        total_production_amount: totalProductionAmount,
        total_part_payments: advancesDeducted,
        advances_deducted: advancesDeducted,
        net_payable: netPayable,
        payment_mode: data.paymentMode,
        payment_status: 'paid',
        payment_date: data.settlementDate,
        remarks: data.remarks,
        section: null,
        batch_id: null,
      };

      const settlement = await createSettlement.mutateAsync(settlementData);

      // Create production entries linked to settlement
      for (const row of data.productionRows) {
        const batch = batches?.find(b => b.id === row.batchId);
        
        await createProductionEntry.mutateAsync({
          batch_id: row.batchId,
          settlement_id: settlement.id,
          employee_id: employeeId,
          employee_name: employeeName,
          employee_type: 'Direct',
          date: data.settlementDate,
          section: row.department,
          quantity_completed: row.quantity,
          rate_per_piece: row.rate,
          total_amount: row.amount,
          remarks: null,
        });

        // Update batch progress
        if (batch) {
          const { data: allProduction } = await supabase
            .from('job_production_entries')
            .select('quantity_completed')
            .eq('batch_id', row.batchId);

          const totalProduced = allProduction?.reduce(
            (sum, entry) => sum + entry.quantity_completed,
            0
          ) || 0;

          const cutQuantity = batch.cut_quantity || 0;
          const cuttingProgress = 35;
          const productionProgress = cutQuantity > 0 ? (totalProduced / cutQuantity) * 65 : 0;
          const overallProgress = cuttingProgress + productionProgress;

          await supabase
            .from('job_batches')
            .update({ overall_progress: Math.min(overallProgress, 100) })
            .eq('id', row.batchId);
        }
      }

      // Mark advances as settled if deducted
      if (data.deductAdvances && unsettledAdvances.length > 0) {
        await supabase
          .from('job_part_payments')
          .update({ 
            is_settled: true,
            settlement_id: settlement.id 
          })
          .in('id', unsettledAdvances.map(p => p.id));
      }

      toast.success('Settlement recorded successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record settlement');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Settlement Date */}
        <div>
          <Label htmlFor="settlementDate">Settlement Date</Label>
          <div className="relative">
            <Input
              id="settlementDate"
              type="date"
              {...register('settlementDate')}
              className="pl-10"
            />
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Production Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Production Entries</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ batchId: '', department: '', quantity: 0, rate: 0, amount: 0 })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Job Row
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                {/* Batch Selector */}
                <div>
                  <Label>Batch</Label>
                  <Select
                    value={watchRows[index]?.batchId}
                    onValueChange={(value) => handleBatchChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches?.filter(b => b.cutting_completed).map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Skill/Department Selector */}
                <div>
                  <Label>Skill</Label>
                  <Select
                    value={watchRows[index]?.department}
                    onValueChange={(value) => handleDepartmentChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    {...register(`productionRows.${index}.quantity`, {
                      valueAsNumber: true,
                      onChange: () => {
                        calculateRowAmount(index);
                        validateBatchLimit(
                          index,
                          watchRows[index]?.batchId,
                          watchRows[index]?.quantity
                        );
                      },
                    })}
                    min="0"
                    placeholder="0"
                  />
                </div>

                {/* Rate */}
                <div>
                  <Label>Rate/Piece</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`productionRows.${index}.rate`, {
                      valueAsNumber: true,
                      onChange: () => calculateRowAmount(index),
                    })}
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                {/* Amount (Read-only) */}
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    {...register(`productionRows.${index}.amount`)}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                {/* Remove Button */}
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Validation Error */}
              {validationErrors[index] && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors[index]}</AlertDescription>
                </Alert>
              )}
            </Card>
          ))}
        </div>

        <Separator />

        {/* Advances Section */}
        {unsettledAdvances.length > 0 && (
          <Card className="p-4 bg-muted/50">
            <h3 className="text-lg font-semibold mb-4">Accumulated Advances</h3>
            
            <div className="space-y-2 mb-4">
              {unsettledAdvances.map((advance) => (
                <div key={advance.id} className="flex justify-between text-sm">
                  <span>{format(new Date(advance.payment_date), 'dd MMM yyyy')}</span>
                  <span className="font-medium">₹{Number(advance.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total Advances:</span>
              <span className="text-lg font-bold text-primary">₹{totalAdvances.toFixed(2)}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="deductAdvances"
                checked={watchDeductAdvances}
                onCheckedChange={(checked) => setValue('deductAdvances', !!checked)}
              />
              <Label htmlFor="deductAdvances" className="cursor-pointer">
                Deduct advances from this settlement
              </Label>
            </div>
          </Card>
        )}

        {/* Settlement Summary */}
        <Card className="p-4 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4">Settlement Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Production Amount:</span>
              <span className="font-medium">₹{totalProductionAmount.toFixed(2)}</span>
            </div>

            {advancesDeducted > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Advances Deducted:</span>
                <span className="font-medium">- ₹{advancesDeducted.toFixed(2)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Net Payable:</span>
              <span className="text-primary">₹{netPayable.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentMode">Payment Mode</Label>
            <Select
              value={watch('paymentMode')}
              onValueChange={(value) => setValue('paymentMode', value)}
            >
              <SelectTrigger id="paymentMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="remarks">Remarks (Optional)</Label>
          <Textarea
            id="remarks"
            {...register('remarks')}
            placeholder="Add any notes about this settlement..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={Object.keys(validationErrors).length > 0}>
            <DollarSign className="h-4 w-4 mr-2" />
            Record Settlement
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Settlement</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>
                <p className="font-semibold mb-2">Employee: {employeeName}</p>
                <p className="text-sm">Date: {format(new Date(watch('settlementDate')), 'dd MMM yyyy')}</p>
              </div>

              <div>
                <p className="font-semibold mb-2">Production Entries:</p>
                <div className="space-y-1 text-sm">
                  {watchRows.map((row, index) => {
                    const batch = batches?.find(b => b.id === row.batchId);
                    return (
                      <div key={index} className="flex justify-between">
                        <span>{batch?.batch_number} - {row.department}: {row.quantity} pcs @ ₹{row.rate}</span>
                        <span className="font-medium">₹{row.amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Production:</span>
                  <span className="font-medium">₹{totalProductionAmount.toFixed(2)}</span>
                </div>
                {advancesDeducted > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Advances Deducted:</span>
                    <span className="font-medium">- ₹{advancesDeducted.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Net Payable:</span>
                  <span className="text-primary">₹{netPayable.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                This will create production entries and update batch progress. This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm & Settle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MultiLineSettlementForm;
