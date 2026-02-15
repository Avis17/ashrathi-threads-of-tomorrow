import { useState, useMemo } from 'react';
import { Plus, Trash2, CreditCard, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useBatchPayments, useCreateBatchPayment, useDeleteBatchPayment } from '@/hooks/useBatchPayments';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface BatchPaymentSectionProps {
  batchId: string;
  rollsData: any[];
}

const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
];

export const BatchPaymentSection = ({ batchId, rollsData }: BatchPaymentSectionProps) => {
  const { data: payments, isLoading } = useBatchPayments(batchId);
  const createMutation = useCreateBatchPayment();
  const deleteMutation = useDeleteBatchPayment();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Extract unique style IDs from rollsData and fetch their details
  const styleIds = useMemo(() => {
    const ids = new Set<string>();
    rollsData.forEach((type: any) => {
      if (type.style_id) ids.add(type.style_id);
    });
    return Array.from(ids);
  }, [rollsData]);

  const { data: styles } = useQuery({
    queryKey: ['batch-payment-styles', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase
        .from('job_styles')
        .select('id, style_name, style_code')
        .in('id', styleIds);
      if (error) throw error;
      return data || [];
    },
    enabled: styleIds.length > 0,
  });

  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    style_id: '',
    payment_mode: 'cash',
    amount: '',
    notes: '',
  });

  const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      batch_id: batchId,
      style_id: formData.style_id || null,
      payment_date: formData.payment_date,
      payment_mode: formData.payment_mode,
      amount: Number(formData.amount),
      notes: formData.notes || null,
    });
    setFormOpen(false);
    setFormData({
      payment_date: new Date().toISOString().split('T')[0],
      style_id: '',
      payment_mode: 'cash',
      amount: '',
      notes: '',
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync({ id: deleteId, batchId });
      setDeleteId(null);
    }
  };

  const getModeLabel = (mode: string) => PAYMENT_MODES.find(m => m.value === mode)?.label || mode;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Total Payments</div>
            <div className="text-lg font-bold text-emerald-600">₹{totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-xs text-muted-foreground">Transactions</div>
            <div className="text-lg font-bold">{payments?.length || 0}</div>
          </Card>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Payments List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />)}
        </div>
      ) : payments && payments.length > 0 ? (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Style</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mode</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Notes</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm">{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</td>
                  <td className="px-4 py-3 text-sm">
                    {payment.job_styles ? (
                      <span>{payment.job_styles.style_name} <span className="text-muted-foreground">({payment.job_styles.style_code})</span></span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {getModeLabel(payment.payment_mode)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-emerald-600">
                    ₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                    {payment.notes || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(payment.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Banknote className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No payments recorded yet</p>
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Record Payment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={e => setFormData(p => ({ ...p, payment_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={formData.style_id || 'none'} onValueChange={v => setFormData(p => ({ ...p, style_id: v === 'none' ? '' : v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All / General</SelectItem>
                  {(styles || []).map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.style_name} ({s.style_code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Mode *</Label>
              <Select value={formData.payment_mode} onValueChange={v => setFormData(p => ({ ...p, payment_mode: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Add any notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
