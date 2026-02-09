import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateJobBatchExpense } from '@/hooks/useJobExpenses';
import { format } from 'date-fns';

interface BatchExpenseFormProps {
  batchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPENSE_TYPES = [
  'Thread',
  'Buttons',
  'Labels',
  'Packaging',
  'Transport',
  'Electricity',
  'Maintenance',
  'Accessories',
  'Consumables',
  'Other'
];

export const BatchExpenseForm = ({ batchId, open, onOpenChange }: BatchExpenseFormProps) => {
  const [expenseType, setExpenseType] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [ratePerUnit, setRatePerUnit] = useState('');
  const [amount, setAmount] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [note, setNote] = useState('');
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const createExpenseMutation = useCreateJobBatchExpense();

  const handleQuantityRateChange = (newQuantity: string, newRate: string) => {
    const qty = parseFloat(newQuantity) || 0;
    const rate = parseFloat(newRate) || 0;
    if (qty > 0 && rate > 0) {
      setAmount((qty * rate).toFixed(2));
    }
  };

  const handleSubmit = async () => {
    if (!expenseType || !itemName || !amount) return;

    await createExpenseMutation.mutateAsync({
      batch_id: batchId,
      date: expenseDate,
      expense_type: expenseType,
      item_name: itemName,
      quantity: quantity ? parseFloat(quantity) : null,
      unit: unit || null,
      rate_per_unit: ratePerUnit ? parseFloat(ratePerUnit) : null,
      amount: parseFloat(amount),
      supplier_name: supplierName || null,
      bill_number: billNumber || null,
      note: note || null,
    });

    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setExpenseType('');
    setItemName('');
    setQuantity('');
    setUnit('');
    setRatePerUnit('');
    setAmount('');
    setSupplierName('');
    setBillNumber('');
    setNote('');
    setExpenseDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="expense-type">Expense Type *</Label>
              <Select value={expenseType} onValueChange={setExpenseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="item-name">Item Name *</Label>
            <Input
              id="item-name"
              placeholder="e.g., Black Thread 40/2"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  handleQuantityRateChange(e.target.value, ratePerUnit);
                }}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="pcs/kg/m"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rate">Rate/Unit</Label>
              <Input
                id="rate"
                type="number"
                placeholder="0.00"
                value={ratePerUnit}
                onChange={(e) => {
                  setRatePerUnit(e.target.value);
                  handleQuantityRateChange(quantity, e.target.value);
                }}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier Name</Label>
              <Input
                id="supplier"
                placeholder="Optional"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bill">Bill Number</Label>
              <Input
                id="bill"
                placeholder="Optional"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="note">Notes</Label>
            <Textarea
              id="note"
              placeholder="Any additional remarks..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!expenseType || !itemName || !amount || createExpenseMutation.isPending}
          >
            {createExpenseMutation.isPending ? 'Saving...' : 'Add Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
