import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Banknote } from 'lucide-react';
import { useCreateBatchSalaryAdvance, useUpdateBatchSalaryAdvance, BatchSalaryAdvance } from '@/hooks/useBatchSalaryAdvances';

const OPERATIONS = [
  'Stitching(Singer)',
  'Stitching(Powertable)',
  'Checking',
  'Cutting',
  'Ironing',
  'Packing',
  'Maintenance',
];

interface StyleOption {
  id: string;
  style_code: string;
  style_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  styles: StyleOption[];
  editAdvance?: BatchSalaryAdvance | null;
}

export const GiveAdvanceDialog = ({ open, onOpenChange, batchId, styles, editAdvance }: Props) => {
  const [styleId, setStyleId] = useState('');
  const [operation, setOperation] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const createMutation = useCreateBatchSalaryAdvance();
  const updateMutation = useUpdateBatchSalaryAdvance();

  const isEditing = !!editAdvance;

  useEffect(() => {
    if (editAdvance) {
      setStyleId(editAdvance.style_id);
      setOperation(editAdvance.operation);
      setAmount(String(editAdvance.amount));
      setDate(editAdvance.advance_date);
      setNotes(editAdvance.notes || '');
    }
  }, [editAdvance]);

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    if (!styleId || !operation || !val || val <= 0) return;

    if (isEditing && editAdvance) {
      await updateMutation.mutateAsync({
        id: editAdvance.id,
        batchId,
        data: {
          style_id: styleId,
          operation,
          description: operation,
          amount: val,
          advance_date: date,
          payment_mode: paymentMode,
          notes: notes || null,
        },
      });
      onOpenChange(false);
    } else {
      await createMutation.mutateAsync({
        batch_id: batchId,
        style_id: styleId,
        operation,
        description: operation,
        amount: val,
        advance_date: date,
        payment_mode: paymentMode,
        notes: notes || undefined,
      });
      setAmount('');
      setNotes('');
    }
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      setStyleId('');
      setOperation('');
      setAmount('');
      setPaymentMode('cash');
      setNotes('');
    }
    onOpenChange(openState);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            {isEditing ? 'Edit Advance' : 'Give Advance'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Style / Type *</Label>
            <Select value={styleId} onValueChange={setStyleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select style..." />
              </SelectTrigger>
              <SelectContent>
                {styles.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.style_code} — {s.style_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Operation *</Label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger>
                <SelectValue placeholder="Select operation..." />
              </SelectTrigger>
              <SelectContent>
                {OPERATIONS.map(op => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Advance Amount (₹) *</Label>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Payment Mode *</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode..." />
              </SelectTrigger>
              <SelectContent>
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(mode => (
                  <SelectItem key={mode} value={mode.toLowerCase()}>{mode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!styleId || !operation || !amount || parseFloat(amount) <= 0 || isPending}
            className="w-full"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Advance' : 'Record Advance'}
          </Button>

          {!isEditing && createMutation.isSuccess && (
            <p className="text-sm text-center text-primary">✓ Advance recorded. You can add more.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
