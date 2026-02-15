import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Banknote } from 'lucide-react';
import { useAdvancesForOperation, useCreateBatchSalaryAdvance, useDeleteBatchSalaryAdvance } from '@/hooks/useBatchSalaryAdvances';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  styleId: string;
  operation: string;
  description: string;
  maxAmount: number; // predicted total = rate * qty
}

export const RecordAdvanceDialog = ({ open, onOpenChange, batchId, styleId, operation, description, maxAmount }: Props) => {
  const { data: advances = [], isLoading } = useAdvancesForOperation(batchId, styleId, operation, description);
  const createMutation = useCreateBatchSalaryAdvance();
  const deleteMutation = useDeleteBatchSalaryAdvance();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const totalAdvanced = advances.reduce((sum, a) => sum + Number(a.amount), 0);
  const remaining = maxAmount - totalAdvanced;

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (val > remaining) return;

    await createMutation.mutateAsync({
      batch_id: batchId,
      style_id: styleId,
      operation,
      description,
      amount: val,
      advance_date: date,
      notes: notes || undefined,
    });
    setAmount('');
    setNotes('');
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id, batchId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Record Advance — {operation}
          </DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-xs text-muted-foreground">Total Amount</div>
            <div className="font-bold">₹{maxAmount.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 text-center">
            <div className="text-xs text-muted-foreground">Advanced</div>
            <div className="font-bold text-primary">₹{totalAdvanced.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 text-center">
            <div className="text-xs text-muted-foreground">Remaining</div>
            <div className="font-bold text-destructive">₹{remaining.toFixed(2)}</div>
          </div>
        </div>

        {/* Add new advance */}
        <div className="space-y-3 border rounded-lg p-3">
          <h4 className="text-sm font-medium">New Advance</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Amount (₹) *</label>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                max={remaining}
              />
              {parseFloat(amount) > remaining && (
                <p className="text-xs text-destructive mt-1">Cannot exceed ₹{remaining.toFixed(2)}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Date *</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remaining || createMutation.isPending}
            className="w-full"
            size="sm"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Record Advance
          </Button>
        </div>

        {/* Advance history */}
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : advances.length > 0 ? (
          <div className="max-h-[200px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map(adv => (
                  <TableRow key={adv.id}>
                    <TableCell className="text-sm">{format(new Date(adv.advance_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right font-medium text-sm">₹{Number(adv.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{adv.notes || '—'}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(adv.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">No advances recorded yet.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
