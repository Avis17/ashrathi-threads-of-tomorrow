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
import { useCreateJobBatchExpense, useUpdateJobBatchExpense } from '@/hooks/useJobExpenses';

interface ExpenseFormProps {
  expense?: any;
  onClose: () => void;
}

const ExpenseForm = ({ expense, onClose }: ExpenseFormProps) => {
  const { data: batches } = useJobBatches();
  const createMutation = useCreateJobBatchExpense();
  const updateMutation = useUpdateJobBatchExpense();
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      batch_id: expense?.batch_id || '',
      date: expense?.date || new Date().toISOString().split('T')[0],
      expense_type: expense?.expense_type || 'fabric',
      item_name: expense?.item_name || '',
      quantity: expense?.quantity || 0,
      unit: expense?.unit || 'kg',
      rate_per_unit: expense?.rate_per_unit || 0,
      amount: expense?.amount || 0,
      supplier_name: expense?.supplier_name || '',
      bill_number: expense?.bill_number || '',
      note: expense?.note || '',
    },
  });

  const quantity = watch('quantity');
  const ratePerUnit = watch('rate_per_unit');

  const handleCalculateAmount = () => {
    if (quantity && ratePerUnit) {
      setValue('amount', quantity * ratePerUnit);
    }
  };

  const onSubmit = async (data: any) => {
    if (expense) {
      await updateMutation.mutateAsync({ id: expense.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {expense ? 'Edit' : 'Add'} Batch Expense
        </h2>
        <p className="text-sm text-muted-foreground">
          {expense ? 'Update' : 'Record'} an expense for a production batch
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Batch *</Label>
          <Select 
            defaultValue={expense?.batch_id || ''}
            onValueChange={(value) => setValue('batch_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a batch..." />
            </SelectTrigger>
            <SelectContent>
              {batches?.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.batch_number} - {batch.job_styles?.style_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" {...register('date')} required />
          </div>
          <div className="space-y-2">
            <Label>Expense Type *</Label>
            <Select 
              defaultValue={expense?.expense_type || 'fabric'}
              onValueChange={(value) => setValue('expense_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fabric">Fabric</SelectItem>
                <SelectItem value="thread">Thread</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item_name">Item Name *</Label>
          <Input id="item_name" {...register('item_name')} required placeholder="Polyester Lycra Fabric" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input 
              id="quantity" 
              type="number"
              step="0.01"
              {...register('quantity', { valueAsNumber: true })} 
              placeholder="180"
              onBlur={handleCalculateAmount}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" {...register('unit')} placeholder="kg / meters / pcs" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_per_unit">Rate Per Unit (₹)</Label>
            <Input 
              id="rate_per_unit" 
              type="number"
              step="0.01"
              {...register('rate_per_unit', { valueAsNumber: true })} 
              placeholder="180.00"
              onBlur={handleCalculateAmount}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Total Amount (₹) *</Label>
          <Input 
            id="amount" 
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })} 
            required 
            placeholder="32500.00"
            className="font-mono text-lg font-bold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name</Label>
            <Input id="supplier_name" {...register('supplier_name')} placeholder="ABC Fabrics" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bill_number">Bill Number</Label>
            <Input id="bill_number" {...register('bill_number')} placeholder="INV-2025-001" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Textarea id="note" {...register('note')} rows={3} placeholder="Additional details..." />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-primary to-secondary"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (expense ? 'Update' : 'Save') + ' Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
