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
import { useJobStyles } from '@/hooks/useJobStyles';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useCreateWeeklySettlement } from '@/hooks/useWeeklySettlements';
import { useCreateJobProductionEntry } from '@/hooks/useJobProduction';
import { useJobEmployee } from '@/hooks/useJobEmployees';
import { getStyleRateForDepartment } from '@/lib/styleRateHelper';
import { DollarSign, TrendingDown, TrendingUp, Package, Briefcase, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface BatchSettlementFormProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

const BatchSettlementForm = ({ employeeId, employeeName, onClose }: BatchSettlementFormProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  
  const { data: batches } = useJobBatches();
  const { data: styles } = useJobStyles();
  const { data: employee } = useJobEmployee(employeeId);
  const { data: partPayments } = usePartPayments(employeeId);
  const createSettlement = useCreateWeeklySettlement();
  const createProduction = useCreateJobProductionEntry();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      batch_id: '',
      department: '',
      quantity: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'cash',
      remarks: '',
    },
  });

  const batchId = watch('batch_id');
  const department = watch('department');
  const quantity = watch('quantity');

  const selectedBatch = batches?.find(b => b.id === batchId);
  const selectedStyle = styles?.find(s => s.id === selectedBatch?.style_id);
  
  // Get employee's departments/skills
  const employeeDepartments = (employee?.departments as string[]) || [];

  // Calculate rate and amount
  const ratePerPiece = useMemo(() => {
    if (!selectedStyle || !department) return 0;
    return getStyleRateForDepartment(selectedStyle, department);
  }, [selectedStyle, department]);

  const productionAmount = useMemo(() => {
    return ratePerPiece * Number(quantity || 0);
  }, [ratePerPiece, quantity]);

  // Calculate part payments for this batch
  const batchPartPayments = useMemo(() => {
    if (!batchId || !partPayments) return 0;
    return partPayments
      .filter(p => p.batch_id === batchId)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [batchId, partPayments]);

  const netPayable = productionAmount - batchPartPayments;

  const onSubmit = (data: any) => {
    if (!selectedStyle || !ratePerPiece) {
      toast.error('Please select a valid batch and department');
      return;
    }
    if (Number(data.quantity) <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!formData || !batchId || !selectedStyle) return;

    try {
      // Step 1: Create production entry
      const productionData = {
        employee_id: employeeId,
        batch_id: batchId,
        date: formData.payment_date,
        section: formData.department,
        quantity_completed: Number(formData.quantity),
        rate_per_piece: ratePerPiece,
        total_amount: productionAmount,
        employee_name: employeeName,
        employee_type: employee?.employee_type || 'direct',
        remarks: formData.remarks || `Batch settlement: ${selectedBatch?.batch_number}`,
      };

      await createProduction.mutateAsync(productionData);

      // Step 2: Create settlement
      const settlementData = {
        employee_id: employeeId,
        batch_id: batchId,
        week_start_date: formData.payment_date,
        week_end_date: formData.payment_date,
        total_production_amount: productionAmount,
        total_part_payments: batchPartPayments,
        net_payable: netPayable,
        payment_date: formData.payment_date,
        payment_mode: formData.payment_mode,
        payment_status: 'paid' as const,
        remarks: formData.remarks || `Batch settlement: ${selectedBatch?.batch_number} - ${formData.department}`,
      };

      await createSettlement.mutateAsync(settlementData);
      
      setShowConfirmation(false);
      onClose();
      toast.success('Work recorded and settled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record settlement');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Record & Settle Work
          </h2>
          <p className="text-sm text-muted-foreground">
            Record production work and settle payment for {employeeName}
          </p>
        </div>

        <Separator />

        {/* Step 1: Batch Selection */}
        <div className="space-y-2">
          <Label htmlFor="batch_id" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Select Batch *
          </Label>
          <Select 
            value={batchId} 
            onValueChange={(value) => {
              setValue('batch_id', value);
              setValue('department', ''); // Reset department when batch changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a batch" />
            </SelectTrigger>
            <SelectContent>
              {batches?.map((batch) => {
                const style = styles?.find(s => s.id === batch.style_id);
                return (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batch_number} - {style?.style_code || 'Unknown Style'}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Department/Skill Selection */}
        {batchId && (
          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Select Skill/Department *
            </Label>
            <Select value={department} onValueChange={(value) => setValue('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose skill" />
              </SelectTrigger>
              <SelectContent>
                {employeeDepartments.length > 0 ? (
                  employeeDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No skills assigned
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Step 3: Quantity Input */}
        {department && (
          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Number of Pieces Completed *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' }
              })}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>
        )}

        {/* Auto-calculation Display */}
        {department && quantity > 0 && (
          <Card className="p-4 bg-muted/50 border-primary/20">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Production Calculation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Skill:</span>
                  <span className="font-medium">{department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate per piece:</span>
                  <span className="font-medium">₹{ratePerPiece.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{quantity} pieces</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Production Amount:</span>
                  <span className="font-bold text-primary">₹{productionAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Settlement Calculation */}
        {productionAmount > 0 && (
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Settlement Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Production Earnings:
                  </span>
                  <span className="font-semibold text-green-600">₹{productionAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Part Payments (Batch):
                  </span>
                  <span className="font-semibold text-red-600">-₹{batchPartPayments.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                  <span className="font-bold text-lg">Net Payable:</span>
                  <span className="font-bold text-xl text-primary">
                    ₹{netPayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Details */}
        {productionAmount > 0 && (
          <>
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date *</Label>
                <Input
                  id="payment_date"
                  type="date"
                  {...register('payment_date', { required: 'Payment date is required' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_mode">Payment Mode *</Label>
                <Select 
                  value={watch('payment_mode')} 
                  onValueChange={(value) => setValue('payment_mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any notes about this settlement..."
                {...register('remarks')}
                rows={3}
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!batchId || !department || !quantity || quantity <= 0}
          >
            Record & Settle
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Settlement</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p className="text-sm">Please review the settlement details:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employee:</span>
                    <span className="font-medium">{employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch:</span>
                    <span className="font-medium">{selectedBatch?.batch_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Style:</span>
                    <span className="font-medium">{selectedStyle?.style_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Skill:</span>
                    <span className="font-medium">{formData?.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{formData?.quantity} pieces</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Production Amount:</span>
                    <span className="font-bold text-green-600">₹{productionAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Part Payments:</span>
                    <span className="font-medium text-red-600">-₹{batchPartPayments.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Net Payable:</span>
                    <span className="font-bold text-primary">₹{netPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
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
