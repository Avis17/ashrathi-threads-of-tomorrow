import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Calculator, IndianRupee, Minus, Check } from 'lucide-react';
import { useUpsertBatchSalary, BatchSalaryEntry } from '@/hooks/useBatchSalary';
import { useBatchSalaryAdvances } from '@/hooks/useBatchSalaryAdvances';

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
  totalCutPieces: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  styles: StyleOption[];
  editEntry?: BatchSalaryEntry | null;
}

export const RecordSalaryDialog = ({ open, onOpenChange, batchId, styles, editEntry }: Props) => {
  const [styleId, setStyleId] = useState('');
  const [operation, setOperation] = useState('');
  const [description, setDescription] = useState('');
  const [pieces, setPieces] = useState('');
  const [ratePerPiece, setRatePerPiece] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [deductAdvance, setDeductAdvance] = useState(true);
  const [notes, setNotes] = useState('');

  const upsertMutation = useUpsertBatchSalary();
  const { data: allAdvances = [] } = useBatchSalaryAdvances(batchId);

  // Populate form when editing
  useEffect(() => {
    if (editEntry && open) {
      setStyleId(editEntry.style_id);
      setOperation(editEntry.operation);
      setDescription(editEntry.description || '');
      setPieces(String(editEntry.quantity));
      setRatePerPiece(String(editEntry.rate_per_piece));
      setNotes(editEntry.notes || '');
      setDeductAdvance(false);
    } else if (!open) {
      setStyleId('');
      setOperation('');
      setDescription('');
      setPieces('');
      setRatePerPiece('');
      setPaymentMode('cash');
      setNotes('');
      setDeductAdvance(true);
    }
  }, [editEntry, open]);

  const selectedStyle = styles.find(s => s.id === styleId);

  // Advances for selected style + operation
  const advanceTotal = useMemo(() => {
    if (!styleId || !operation) return 0;
    return allAdvances
      .filter(a => a.style_id === styleId && a.operation === operation)
      .reduce((sum, a) => sum + Number(a.amount), 0);
  }, [allAdvances, styleId, operation]);

  const piecesNum = parseInt(pieces) || 0;
  const rateNum = parseFloat(ratePerPiece) || 0;
  const grossAmount = piecesNum * rateNum;
  const advanceDeduction = deductAdvance ? advanceTotal : 0;
  const netPayable = Math.max(0, grossAmount - advanceDeduction);

  const handleSubmit = async () => {
    if (!styleId || !operation || piecesNum <= 0 || rateNum <= 0) return;

    await upsertMutation.mutateAsync({
      ...(editEntry ? { id: editEntry.id } : {}),
      batch_id: batchId,
      style_id: styleId,
      operation,
      description: description || operation,
      rate_per_piece: rateNum,
      quantity: piecesNum,
      payment_status: 'paid',
      payment_mode: paymentMode,
      paid_amount: netPayable,
      notes: [
        notes,
        deductAdvance && advanceTotal > 0 ? `Advance deducted: ₹${advanceTotal.toFixed(2)}` : '',
      ].filter(Boolean).join(' | '),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {editEntry ? 'Edit Salary Entry' : 'Record Salary'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Style Selection */}
          <div className="space-y-1.5">
            <Label>Style / Type *</Label>
            <Select value={styleId} onValueChange={setStyleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select style..." />
              </SelectTrigger>
              <SelectContent>
                {styles.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.style_code} — {s.style_name} ({s.totalCutPieces} pcs cut)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Operation */}
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

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Side seam, Hemming..." />
          </div>

          {/* Pieces + Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Number of Pieces *</Label>
              <Input
                type="number"
                value={pieces}
                onChange={e => setPieces(e.target.value)}
                placeholder="Enter pieces"
              />
              {selectedStyle && (
                <p className="text-xs text-muted-foreground">
                  Total cut: <span className="font-medium">{selectedStyle.totalCutPieces}</span> pcs
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Rate per Piece (₹) *</Label>
              <Input
                type="number"
                value={ratePerPiece}
                onChange={e => setRatePerPiece(e.target.value)}
                placeholder="Enter rate"
                step="0.5"
              />
            </div>
          </div>

          {/* Payment Mode */}
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

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
          </div>

          <Separator />

          {/* Calculation Breakdown */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Salary Calculation
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pieces × Rate</span>
                <span>{piecesNum} × ₹{rateNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Gross Amount</span>
                <span>₹{grossAmount.toFixed(2)}</span>
              </div>

              {/* Advance info */}
              {styleId && operation && (
                <>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Advance Collected</span>
                    <span className={advanceTotal > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                      ₹{advanceTotal.toFixed(2)}
                    </span>
                  </div>
                  {advanceTotal > 0 && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deductAdvance}
                          onChange={e => setDeductAdvance(e.target.checked)}
                          className="rounded border-input"
                        />
                        <span>Deduct advance from salary</span>
                      </label>
                      {deductAdvance && (
                        <span className="text-destructive flex items-center gap-1">
                          <Minus className="h-3 w-3" /> ₹{advanceTotal.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}

              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Net Payable</span>
                <span className="text-primary">₹{netPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!styleId || !operation || piecesNum <= 0 || rateNum <= 0 || upsertMutation.isPending}
            className="w-full"
          >
            {upsertMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Check className="h-4 w-4 mr-2" />
            {editEntry ? 'Update' : 'Record'} Salary — ₹{netPayable.toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
