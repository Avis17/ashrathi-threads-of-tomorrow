import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePartPayments, useDeletePartPayment, type PartPayment } from '@/hooks/usePartPayments';
import { useWeeklySettlements, useDeleteWeeklySettlement, type WeeklySettlement } from '@/hooks/useWeeklySettlements';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { Banknote, Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import EditPartPaymentForm from './EditPartPaymentForm';
import { SettlementDetailsDialog } from './SettlementDetailsDialog';
import { Eye } from 'lucide-react';

interface EmployeePaymentRecordsProps {
  employeeId: string;
  employeeName: string;
}

const EmployeePaymentRecords = ({ employeeId, employeeName }: EmployeePaymentRecordsProps) => {
  const { data: partPayments } = usePartPayments(employeeId);
  const { data: settlements } = useWeeklySettlements(employeeId);
  const { data: productionEntries } = useJobProductionEntries();
  const deletePartPayment = useDeletePartPayment();
  const deleteSettlement = useDeleteWeeklySettlement();

  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deletingRecord, setDeletingRecord] = useState<any>(null);
  const [viewingSettlement, setViewingSettlement] = useState<WeeklySettlement | null>(null);

  const now = new Date();
  const earnings = useMemo(() => {
    const employeeProduction = productionEntries?.filter(entry => entry.employee_id === employeeId) || [];
    return {
      week: employeeProduction.filter(e => isWithinInterval(parseISO(e.date), { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) })).reduce((s, e) => s + (e.total_amount || 0), 0),
      month: employeeProduction.filter(e => isWithinInterval(parseISO(e.date), { start: startOfMonth(now), end: endOfMonth(now) })).reduce((s, e) => s + (e.total_amount || 0), 0),
      year: employeeProduction.filter(e => isWithinInterval(parseISO(e.date), { start: startOfYear(now), end: endOfYear(now) })).reduce((s, e) => s + (e.total_amount || 0), 0),
    };
  }, [productionEntries, employeeId]);

  const allRecords = useMemo(() => {
    const payments = (partPayments || []).map(p => ({ 
      id: p.id, 
      date: p.payment_date, 
      type: p.is_settled ? 'Advance (Settled)' : 'Advance Payment', 
      amount: p.amount, 
      mode: p.payment_mode, 
      status: p.is_settled ? 'settled' : 'pending', 
      note: p.note, 
      originalData: p 
    }));
    const sRecords = (settlements || []).map(s => ({ 
      id: s.id, 
      date: s.settlement_date || s.payment_date || s.week_end_date, 
      type: 'Settlement', 
      amount: s.net_payable || 0, 
      mode: s.payment_mode, 
      status: s.payment_status || 'paid', 
      note: s.remarks, 
      originalData: s 
    }));
    return [...payments, ...sRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [partPayments, settlements]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle className="text-2xl text-green-600">₹{earnings.week.toFixed(2)}</CardTitle><p className="text-sm text-muted-foreground">This Week</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-2xl text-blue-600">₹{earnings.month.toFixed(2)}</CardTitle><p className="text-sm text-muted-foreground">This Month</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-2xl text-purple-600">₹{earnings.year.toFixed(2)}</CardTitle><p className="text-sm text-muted-foreground">This Year</p></CardHeader></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{format(parseISO(r.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell><Badge>{r.type}</Badge></TableCell>
                  <TableCell>₹{r.amount.toFixed(2)}</TableCell>
                  <TableCell>{r.mode || '-'}</TableCell>
                  <TableCell><Badge variant={r.status === 'paid' ? 'default' : 'outline'}>{r.status}</Badge></TableCell>
                  <TableCell>{r.note || '-'}</TableCell>
                  <TableCell className="text-right">
                    {r.type === 'Settlement' ? (
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setViewingSettlement(r.originalData as WeeklySettlement)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDeletingRecord(r)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingRecord(r)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDeletingRecord(r)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {editingRecord && editingRecord.type.includes('Advance') && (
        <Dialog open={true} onOpenChange={() => setEditingRecord(null)}>
          <DialogContent><EditPartPaymentForm partPayment={editingRecord.originalData} onClose={() => setEditingRecord(null)} /></DialogContent>
        </Dialog>
      )}
      <AlertDialog open={!!deletingRecord} onOpenChange={() => setDeletingRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingRecord?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingRecord?.type === 'Weekly Settlement' ? (
                <div className="space-y-2">
                  <p>This will permanently delete this settlement record and all associated data:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Production entries created during settlement</li>
                    <li>Part payments will be marked as un-settled</li>
                    <li>Batch cost summary will be recalculated</li>
                  </ul>
                  <p className="font-semibold mt-2">This action cannot be undone.</p>
                </div>
              ) : (
                "This will permanently delete this part payment record. This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { 
              if (deletingRecord.type === 'Part Payment') {
                await deletePartPayment.mutateAsync(deletingRecord.id);
              } else {
                await deleteSettlement.mutateAsync(deletingRecord.originalData);
              }
              setDeletingRecord(null);
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <SettlementDetailsDialog 
        settlement={viewingSettlement}
        open={!!viewingSettlement}
        onClose={() => setViewingSettlement(null)}
      />
    </div>
  );
};

export default EmployeePaymentRecords;
