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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useJobBatches } from '@/hooks/useJobBatches';
import { useJobStyles } from '@/hooks/useJobStyles';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useCreateWeeklySettlement } from '@/hooks/useWeeklySettlements';
import { useCreateJobProductionEntry } from '@/hooks/useJobProduction';
import { useJobEmployee } from '@/hooks/useJobEmployees';
import { getStyleRateForDepartment } from '@/lib/styleRateHelper';
import { getCurrentWeek } from '@/lib/weekUtils';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BatchSettlementFormProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

type FormData = {
  payment_type: string;
  batch_id?: string;
  department?: string;
  quantity?: number;
  payment_date: string;
  payment_mode: string;
  remarks?: string;
};

const BatchSettlementForm = ({ employeeId, employeeName, onClose }: BatchSettlementFormProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const { data: batches } = useJobBatches();
  const { data: styles } = useJobStyles();
  const { data: employee } = useJobEmployee(employeeId);
  const { data: partPayments } = usePartPayments(employeeId);
  const createSettlement = useCreateWeeklySettlement();
  const createProduction = useCreateJobProductionEntry();

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      payment_type: 'piece_rate',
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'cash',
      remarks: '',
    },
  });

  const paymentType = watch('payment_type');
  const batchId = watch('batch_id');
  const department = watch('department');
  const quantity = watch('quantity');

  const selectedBatch = batches?.find(b => b.id === batchId);
  const selectedStyle = styles?.find(s => s.id === selectedBatch?.style_id);
  
  // Get employee's departments/skills
  const employeeDepartments = (employee?.departments as string[]) || [];

  // Check if salary is configured
  const salaryConfigured = Boolean((employee as any)?.salary_amount && (employee as any)?.salary_type);

  // Calculate rate and amount
  const ratePerPiece = useMemo(() => {
    if (paymentType === 'fixed_salary') return 0;
    if (!selectedStyle || !department) return 0;
    return getStyleRateForDepartment(selectedStyle, department);
  }, [paymentType, selectedStyle, department]);

  const productionAmount = useMemo(() => {
    if (paymentType === 'fixed_salary') {
      if (!(employee as any)?.salary_amount || !(employee as any)?.salary_type) return 0;
      
      const empSalary = employee as any;
      // If weekly, use directly. If monthly, divide by 4 for weekly calculation
      if (empSalary.salary_type === 'weekly') {
        return empSalary.salary_amount;
      } else {
        return empSalary.salary_amount / 4; // Monthly divided by 4 weeks
      }
    }
    
    return ratePerPiece * Number(quantity || 0);
  }, [paymentType, employee, ratePerPiece, quantity]);

  // Calculate part payments for this batch (only for piece rate)
  const batchPartPayments = useMemo(() => {
    if (paymentType === 'fixed_salary') return 0;
    if (!batchId || !partPayments) return 0;
    return partPayments
      .filter(p => p.batch_id === batchId)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [paymentType, batchId, partPayments]);

  const netPayable = productionAmount - batchPartPayments;

  const onSubmit = (data: FormData) => {
    // Validate based on payment type
    if (data.payment_type === 'fixed_salary') {
      if (!salaryConfigured) {
        toast.error('Please update employee salary details in their profile');
        return;
      }
    } else {
      if (!data.batch_id || !data.department || !data.quantity) {
        toast.error('Please fill all required fields');
        return;
      }
      if (Number(data.quantity) <= 0) {
        toast.error('Quantity must be greater than 0');
        return;
      }
    }

    if (productionAmount <= 0) {
      toast.error('Invalid production amount');
      return;
    }

    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    try {
      const currentWeek = getCurrentWeek();

      if (formData.payment_type === 'fixed_salary') {
        // For fixed salary, create settlement only (no production entry)
        await createSettlement.mutateAsync({
          employee_id: employeeId,
          batch_id: null,
          week_start_date: currentWeek.start,
          week_end_date: currentWeek.end,
          total_production_amount: productionAmount,
          total_part_payments: 0,
          net_payable: netPayable,
          payment_date: formData.payment_date,
          payment_mode: formData.payment_mode,
          payment_status: 'paid',
          remarks: `Fixed ${(employee as any)?.salary_type} salary payment. ${formData.remarks || ''}`,
        });
      } else {
        // For piece rate, create both production entry and settlement
        await createProduction.mutateAsync({
          employee_id: employeeId,
          batch_id: formData.batch_id!,
          employee_name: employeeName,
          employee_type: employee?.employee_type || 'direct',
          section: formData.department!,
          quantity_completed: formData.quantity!,
          rate_per_piece: ratePerPiece,
          total_amount: productionAmount,
          date: formData.payment_date,
          remarks: formData.remarks,
        });

        await createSettlement.mutateAsync({
          employee_id: employeeId,
          batch_id: formData.batch_id!,
          week_start_date: currentWeek.start,
          week_end_date: currentWeek.end,
          total_production_amount: productionAmount,
          total_part_payments: batchPartPayments,
          net_payable: netPayable,
          payment_date: formData.payment_date,
          payment_mode: formData.payment_mode,
          payment_status: 'paid',
          remarks: formData.remarks,
        });
      }

      toast.success('Settlement recorded successfully!');
      onClose();
    } catch (error) {
      console.error('Settlement error:', error);
      toast.error('Failed to record settlement');
    } finally {
      setShowConfirmation(false);
      setFormData(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Step 1: Payment Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="payment_type">Payment Type *</Label>
          <Select
            value={paymentType}
            onValueChange={(value) => setValue('payment_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed_salary">Fixed Salary</SelectItem>
              <SelectItem value="piece_rate">Piece Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show warning if fixed salary selected but not configured */}
        {paymentType === 'fixed_salary' && !salaryConfigured && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Employee salary is not configured. Please update the salary details in the employee profile before proceeding.
            </AlertDescription>
          </Alert>
        )}

        {/* Show salary info if fixed salary and configured */}
        {paymentType === 'fixed_salary' && salaryConfigured && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Salary Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salary Type:</span>
                <span className="font-medium capitalize">{(employee as any)?.salary_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{(employee as any)?.salary_type === 'weekly' ? 'Weekly' : 'Monthly'} Salary:</span>
                <span className="font-medium">₹{((employee as any)?.salary_amount || 0).toFixed(2)}</span>
              </div>
              {(employee as any)?.salary_type === 'monthly' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly Amount:</span>
                  <span className="font-medium">₹{(((employee as any)?.salary_amount || 0) / 4).toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Batch Selection (Only for Piece Rate) */}
        {paymentType === 'piece_rate' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="batch_id">Select Batch *</Label>
              <Select
                value={batchId}
                onValueChange={(value) => setValue('batch_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.map((batch) => {
                    const style = styles?.find(s => s.id === batch.style_id);
                    return (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batch_number} - {style?.style_name || 'Unknown Style'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Job Details (Only show if batch selected) */}
            {batchId && selectedStyle && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Skill/Department *</Label>
                  <Select
                    value={department}
                    onValueChange={(value) => setValue('department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Completed *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    {...register('quantity', { valueAsNumber: true })}
                  />
                </div>

                {department && quantity && quantity > 0 && (
                  <Card className="bg-primary/5">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Selected Skill:</span>
                        <span className="font-medium">{department}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate per piece:</span>
                        <span className="font-medium">₹{ratePerPiece.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{quantity} pieces</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Production Amount:</span>
                        <span className="font-semibold text-primary">₹{productionAmount.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 4: Settlement Summary */}
        {productionAmount > 0 && (paymentType === 'fixed_salary' || (batchId && department && quantity)) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Settlement Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {paymentType === 'fixed_salary' ? 'Salary Amount:' : 'Production Earnings:'}
                </span>
                <span className="font-medium">₹{productionAmount.toFixed(2)}</span>
              </div>
              {paymentType === 'piece_rate' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Part Payments (Batch):</span>
                  <span className="font-medium text-red-600">-₹{batchPartPayments.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-base">Net Payable:</span>
                <span className="font-bold text-lg text-primary">₹{netPayable.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Payment Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                {...register('payment_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_mode">Payment Mode *</Label>
              <Select
                value={watch('payment_mode')}
                onValueChange={(value) => setValue('payment_mode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
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
              rows={2}
              placeholder="Add any notes..."
              {...register('remarks')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              createSettlement.isPending || 
              createProduction.isPending ||
              (paymentType === 'fixed_salary' && !salaryConfigured) ||
              (paymentType === 'piece_rate' && (!batchId || !department || !quantity || quantity <= 0))
            }
            className="flex-1"
          >
            {(createSettlement.isPending || createProduction.isPending) ? 'Processing...' : 'Record & Settle'}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Settlement</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p><strong>Employee:</strong> {employeeName}</p>
              {formData?.payment_type === 'fixed_salary' ? (
                <>
                  <p><strong>Payment Type:</strong> Fixed Salary ({(employee as any)?.salary_type})</p>
                  <p><strong>Amount:</strong> ₹{productionAmount.toFixed(2)}</p>
                </>
              ) : (
                <>
                  <p><strong>Batch:</strong> {selectedBatch?.batch_number} - {selectedStyle?.style_name}</p>
                  <p><strong>Skill:</strong> {formData?.department}</p>
                  <p><strong>Quantity:</strong> {formData?.quantity} pieces</p>
                  <p><strong>Amount:</strong> ₹{productionAmount.toFixed(2)}</p>
                  <p><strong>Part Payments:</strong> -₹{batchPartPayments.toFixed(2)}</p>
                </>
              )}
              <p><strong>Net Payable:</strong> ₹{netPayable.toFixed(2)}</p>
              <p className="text-muted-foreground text-sm mt-4">
                {formData?.payment_type === 'fixed_salary'
                  ? 'This will create a weekly settlement record for fixed salary.'
                  : 'This will create both a production entry and a weekly settlement record.'}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchSettlementForm;
