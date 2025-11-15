import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
import { useJobBatches, useUpdateJobBatch } from '@/hooks/useJobBatches';
import { useJobStyles } from '@/hooks/useJobStyles';
import { usePartPayments, useUpdatePartPayment } from '@/hooks/usePartPayments';
import { useWeeklySettlements, useCreateWeeklySettlement } from '@/hooks/useWeeklySettlements';
import { useJobProductionEntries, useCreateJobProductionEntry } from '@/hooks/useJobProduction';
import { useJobEmployee } from '@/hooks/useJobEmployees';
import { getStyleRateForDepartment } from '@/lib/styleRateHelper';
import { getCurrentWeek, getWeekRange } from '@/lib/weekUtils';
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
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
  const { data: settlements } = useWeeklySettlements(employeeId);
  const { data: allProductionEntries } = useJobProductionEntries();
  const createSettlement = useCreateWeeklySettlement();
  const createProduction = useCreateJobProductionEntry();
  const updatePartPayment = useUpdatePartPayment();
  const updateBatch = useUpdateJobBatch();

  const currentWeek = getCurrentWeek();

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      payment_type: 'piece_rate',
      payment_date: currentWeek.end,
      payment_mode: 'cash',
      remarks: '',
    },
  });

  const paymentType = watch('payment_type');
  const batchId = watch('batch_id');
  const department = watch('department');
  const quantity = watch('quantity');

  // Check if settlement already exists for current week + batch + section
  const weekAlreadySettled = useMemo(() => {
    if (!batchId || !department) return false; // No validation until both are selected
    
    return settlements?.some(s => 
      s.week_start_date === currentWeek.start && 
      s.week_end_date === currentWeek.end &&
      s.batch_id === batchId &&
      s.section === department
    );
  }, [settlements, currentWeek, batchId, department]);

  const selectedBatch = batches?.find(b => b.id === batchId);
  const selectedStyle = styles?.find(s => s.id === selectedBatch?.style_id);
  
  const employeeDepartments = (employee?.departments as string[]) || [];
  const salaryConfigured = Boolean((employee as any)?.salary_amount && (employee as any)?.salary_type);

  const ratePerPiece = useMemo(() => {
    if (paymentType === 'fixed_salary') return 0;
    if (!selectedStyle || !department) return 0;
    return getStyleRateForDepartment(selectedStyle, department);
  }, [paymentType, selectedStyle, department]);

  const productionAmount = useMemo(() => {
    if (paymentType === 'fixed_salary') {
      if (!(employee as any)?.salary_amount || !(employee as any)?.salary_type) return 0;
      
      const empSalary = employee as any;
      if (empSalary.salary_type === 'weekly') {
        return empSalary.salary_amount;
      } else {
        return empSalary.salary_amount / 4;
      }
    }
    
    return ratePerPiece * Number(quantity || 0);
  }, [paymentType, employee, ratePerPiece, quantity]);

  // Get only UNSETTLED part payments for current week
  const weekPartPayments = useMemo(() => {
    if (!partPayments) return [];
    return partPayments.filter(p => 
      !p.is_settled &&
      p.payment_date >= currentWeek.start &&
      p.payment_date <= currentWeek.end
    );
  }, [partPayments, currentWeek]);

  const totalWeekPartPayments = weekPartPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const netPayable = productionAmount - totalWeekPartPayments;

  // Batch validation for piece-rate work
  const batchValidation = useMemo(() => {
    if (!selectedBatch || !batchId || paymentType !== 'piece_rate') {
      return { isValid: true, message: '', remaining: 0, used: 0, total: 0 };
    }
    
    // Check if cutting is completed
    if (!selectedBatch.cutting_completed) {
      return {
        isValid: false,
        message: 'Cutting completion must be recorded before adding production entries for this batch.',
        remaining: 0,
        used: 0,
        total: 0
      };
    }
    
    // Calculate existing production entries for this batch
    const batchProduction = allProductionEntries?.filter(p => p.batch_id === batchId) || [];
    const totalUsed = batchProduction.reduce((sum, p) => sum + p.quantity_completed, 0);
    const remaining = selectedBatch.cut_quantity - totalUsed;
    
    // Check if new quantity exceeds limit
    const newQuantity = Number(quantity || 0);
    const willExceed = (totalUsed + newQuantity) > selectedBatch.cut_quantity;
    
    return {
      isValid: !willExceed && remaining > 0,
      message: willExceed 
        ? `Cannot exceed cutting total! Maximum allowed: ${remaining} pieces` 
        : '',
      remaining,
      used: totalUsed,
      total: selectedBatch.cut_quantity
    };
  }, [selectedBatch, batchId, allProductionEntries, quantity, paymentType]);

  const onSubmit = async (data: FormData) => {
    if (data.payment_type === 'piece_rate') {
      if (!data.batch_id || !data.department || !data.quantity) {
        toast.error('Please fill in all required fields for piece rate payment');
        return;
      }
      
      // Validate batch quantity limit
      if (!batchValidation.isValid) {
        toast.error(batchValidation.message || 'Cannot exceed batch production limit');
        return;
      }
    } else {
      if (!salaryConfigured) {
        toast.error('Employee salary is not configured');
        return;
      }
    }

    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    try {
      const settlementDate = currentWeek.end;

      if (formData.payment_type === 'fixed_salary') {
        await createSettlement.mutateAsync({
          employee_id: employeeId,
          batch_id: null,
          week_start_date: currentWeek.start,
          week_end_date: currentWeek.end,
          total_production_amount: productionAmount,
          total_part_payments: totalWeekPartPayments,
          net_payable: netPayable,
          payment_date: settlementDate,
          payment_mode: formData.payment_mode,
          payment_status: 'paid',
          remarks: `Fixed ${(employee as any)?.salary_type} salary payment. ${formData.remarks || ''}`,
        });
      } else {
        // Server-side validation - Re-validate against cutting completion
        if (!selectedBatch?.cutting_completed) {
          toast.error('Cutting completion must be recorded first');
          setShowConfirmation(false);
          return;
        }
        
        if (!selectedBatch?.cut_quantity || selectedBatch.cut_quantity <= 0) {
          toast.error('Invalid cutting quantity for this batch');
          setShowConfirmation(false);
          return;
        }
        
        // Calculate current usage across ALL employees and ALL skills
        const batchProduction = allProductionEntries?.filter(p => p.batch_id === formData.batch_id) || [];
        const totalUsed = batchProduction.reduce((sum, p) => sum + p.quantity_completed, 0);
        const newTotal = totalUsed + (formData.quantity || 0);
        
        if (newTotal > selectedBatch.cut_quantity) {
          const remaining = selectedBatch.cut_quantity - totalUsed;
          toast.error(
            `Cannot exceed cutting total! Only ${remaining} pieces remaining out of ${selectedBatch.cut_quantity} cut pieces.`
          );
          setShowConfirmation(false);
          return;
        }
        
        await createProduction.mutateAsync({
          employee_id: employeeId,
          batch_id: formData.batch_id!,
          employee_name: employeeName,
          employee_type: employee?.employee_type || 'direct',
          section: formData.department!,
          quantity_completed: formData.quantity!,
          rate_per_piece: ratePerPiece,
          total_amount: productionAmount,
          date: settlementDate,
          remarks: formData.remarks,
        });

        await createSettlement.mutateAsync({
          employee_id: employeeId,
          batch_id: formData.batch_id!,
          section: formData.department!,
          week_start_date: currentWeek.start,
          week_end_date: currentWeek.end,
          total_production_amount: productionAmount,
          total_part_payments: totalWeekPartPayments,
          net_payable: netPayable,
          payment_date: settlementDate,
          payment_mode: formData.payment_mode,
          payment_status: 'paid',
          remarks: formData.remarks,
        });

        // Calculate and update batch progress
        const updatedBatchProduction = allProductionEntries?.filter(p => p.batch_id === formData.batch_id) || [];
        const newTotalQuantity = updatedBatchProduction.reduce((sum, p) => sum + p.quantity_completed, 0) + formData.quantity!;
        const baseProgress = 35; // Cutting completion
        const productionProgressPercent = (newTotalQuantity / selectedBatch!.cut_quantity) * 65;
        const newOverallProgress = Math.min(100, baseProgress + productionProgressPercent);
        
        await updateBatch.mutateAsync({
          id: formData.batch_id!,
          data: {
            overall_progress: Math.round(newOverallProgress)
          }
        });
      }

      // Mark all part payments as settled
      if (weekPartPayments.length > 0) {
        for (const payment of weekPartPayments) {
          await updatePartPayment.mutateAsync({
            id: payment.id,
            data: { is_settled: true }
          });
        }
      }

      toast.success('Weekly settlement completed successfully!');
      onClose();
    } catch (error) {
      console.error('Settlement error:', error);
      toast.error('Failed to complete settlement');
    } finally {
      setShowConfirmation(false);
      setFormData(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Week Information Alert */}
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Settlement for week:</strong> {getWeekRange(currentWeek.start, currentWeek.end)}
            <br />
            <strong>Settlement Date:</strong> {format(new Date(currentWeek.end), 'EEEE, MMM dd, yyyy')} (Saturday)
          </AlertDescription>
        </Alert>

        {/* Week Already Settled Warning */}
        {weekAlreadySettled && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Settlement for {department} has already been completed for this batch this week ({getWeekRange(currentWeek.start, currentWeek.end)}).
              You can settle other skills/departments for this employee.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Type Selection */}
        <div className="space-y-2">
          <Label>Payment Type</Label>
          <Select 
            value={paymentType} 
            onValueChange={(value) => setValue('payment_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="piece_rate">Piece Rate</SelectItem>
              <SelectItem value="fixed_salary">Fixed Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Piece Rate Section */}
        {paymentType === 'piece_rate' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch_id">Select Batch *</Label>
              <Select value={batchId} onValueChange={(value) => setValue('batch_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.filter(b => b.status !== 'completed').map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_number} - {batch.fabric_type} ({batch.color})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department/Skill *</Label>
              <Select value={department} onValueChange={(value) => setValue('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {employeeDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {ratePerPiece > 0 && (
              <Alert>
                <AlertDescription>
                  Rate for {department}: ₹{ratePerPiece.toFixed(2)} per piece
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Completed *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={batchValidation.remaining || undefined}
              className={!batchValidation.isValid ? "border-destructive" : ""}
              {...register('quantity', { valueAsNumber: true })}
            />
            {selectedBatch?.cutting_completed && (
              <Alert variant={!batchValidation.isValid ? "destructive" : "default"} className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold text-base">
                      📊 Batch Production Limit
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Total Cut: <strong>{batchValidation.total}</strong> pieces</div>
                      <div>Already Used: <strong>{batchValidation.used}</strong> pieces</div>
                      <div className="col-span-2 text-lg font-bold text-green-600">
                        Remaining: <strong>{batchValidation.remaining}</strong> pieces
                      </div>
                    </div>
                    {!batchValidation.isValid && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive font-semibold">
                        ⚠️ {batchValidation.message}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      * This limit applies across all employees and all skills for this batch
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            </div>
          </div>
        )}

        {/* Fixed Salary Section */}
        {paymentType === 'fixed_salary' && (
          <div className="space-y-4">
            {!salaryConfigured ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Employee salary is not configured. Please configure salary in employee settings.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  <strong>Salary Type:</strong> {(employee as any)?.salary_type}
                  <br />
                  <strong>Configured Amount:</strong> ₹{((employee as any)?.salary_amount || 0).toFixed(2)}
                  <br />
                  <strong>Weekly Amount:</strong> ₹{productionAmount.toFixed(2)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Settlement Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Settlement Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Production/Salary (This Week):</span>
              <span className="font-semibold">₹{productionAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>Part Payments Collected:</span>
              <span className="font-semibold">-₹{totalWeekPartPayments.toFixed(2)}</span>
            </div>
            {weekPartPayments.length > 0 && (
              <div className="text-xs text-muted-foreground pl-4 space-y-1">
                {weekPartPayments.map(p => (
                  <div key={p.id}>
                    • {format(new Date(p.payment_date), 'MMM dd')}: ₹{p.amount} 
                    {p.note && ` (${p.note})`}
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Net Payable:</span>
              <span>₹{netPayable.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="font-semibold">Payment Details</h3>
          
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
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={
              createSettlement.isPending || 
              createProduction.isPending || 
              weekAlreadySettled ||
              (paymentType === 'piece_rate' && !batchValidation.isValid)
            }
          >
            {weekAlreadySettled ? 'Week Already Settled' : 'Record & Settle'}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Weekly Settlement</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm the weekly settlement:
              
              <div className="mt-4 space-y-2 text-sm">
                <div><strong>Employee:</strong> {employeeName}</div>
                <div><strong>Week:</strong> {getWeekRange(currentWeek.start, currentWeek.end)}</div>
                <div><strong>Settlement Date:</strong> {format(new Date(currentWeek.end), 'MMM dd, yyyy')} (Saturday)</div>
                
                {formData?.payment_type === 'piece_rate' ? (
                  <>
                    <div><strong>Batch:</strong> {selectedBatch?.batch_number}</div>
                    <div><strong>Skill:</strong> {formData.department}</div>
                    <div><strong>Quantity:</strong> {formData.quantity} pieces</div>
                    
                    <div className="p-2 bg-muted rounded mt-2">
                      <div className="text-xs font-semibold mb-1">Batch Production Status:</div>
                      <div className="text-xs">
                        Before: {batchValidation.used} / {batchValidation.total} pieces used
                        <br />
                        After: {batchValidation.used + (formData.quantity || 0)} / {batchValidation.total} pieces
                      </div>
                    </div>
                    
                    <div><strong>Production Amount:</strong> ₹{productionAmount.toFixed(2)}</div>
                  </>
                ) : (
                  <div><strong>Salary Type:</strong> {(employee as any)?.salary_type}</div>
                )}
                
                <div><strong>Part Payments:</strong> -₹{totalWeekPartPayments.toFixed(2)}</div>
                <div className="text-lg font-bold text-primary">
                  <strong>Net Payable:</strong> ₹{netPayable.toFixed(2)}
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  After confirmation, this week's part payments will be marked as settled 
                  and the "Record & Settle Work" button will be disabled for this week.
                </AlertDescription>
              </Alert>
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
