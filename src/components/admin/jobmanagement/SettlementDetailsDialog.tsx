import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useJobBatches } from '@/hooks/useJobBatches';

interface Settlement {
  id: string;
  employee_id: string;
  settlement_date: string;
  total_production_amount: number;
  advances_deducted: number;
  net_payable: number;
  payment_mode: string;
  payment_status: string;
  remarks: string | null;
}

interface SettlementDetailsDialogProps {
  settlement: Settlement | null;
  open: boolean;
  onClose: () => void;
}

export const SettlementDetailsDialog = ({ settlement, open, onClose }: SettlementDetailsDialogProps) => {
  const { data: allProductionEntries } = useJobProductionEntries();
  const { data: partPayments } = usePartPayments(settlement?.employee_id);
  const { data: batches } = useJobBatches();

  if (!settlement) return null;

  const productionEntries = allProductionEntries?.filter(p => p.settlement_id === settlement.id) || [];
  const settledAdvances = partPayments?.filter(p => p.settlement_id === settlement.id) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settlement Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card className="p-4 bg-muted/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Settlement Date:</span>
                <p className="font-semibold">{format(new Date(settlement.settlement_date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Mode:</span>
                <p className="font-semibold">{settlement.payment_mode}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge className={settlement.payment_status === 'paid' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}>
                  {settlement.payment_status}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Production Entries */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Production Entries</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Job Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionEntries.map((entry) => {
                  const batch = batches?.find(b => b.id === entry.batch_id);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{batch?.batch_number || entry.batch_id}</TableCell>
                      <TableCell>{entry.section}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.remarks || '-'}
                      </TableCell>
                      <TableCell>{entry.quantity_completed}</TableCell>
                      <TableCell>₹{Number(entry.rate_per_piece).toFixed(2)}</TableCell>
                      <TableCell className="font-medium">₹{Number(entry.total_amount).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Advances Deducted */}
          {settledAdvances.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Advances Deducted</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settledAdvances.map((advance) => (
                    <TableRow key={advance.id}>
                      <TableCell>{format(new Date(advance.payment_date), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="font-medium">₹{Number(advance.amount).toFixed(2)}</TableCell>
                      <TableCell>{advance.payment_mode}</TableCell>
                      <TableCell className="text-muted-foreground">{advance.note || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          <Card className="p-4 bg-primary/5">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Production:</span>
                <span className="font-medium">₹{Number(settlement.total_production_amount).toFixed(2)}</span>
              </div>
              
              {Number(settlement.advances_deducted) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Advances Deducted:</span>
                  <span className="font-medium">- ₹{Number(settlement.advances_deducted).toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Net Paid:</span>
                <span className="text-primary">₹{Number(settlement.net_payable).toFixed(2)}</span>
              </div>
            </div>
            
            {settlement.remarks && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Remarks:</span>
                <p className="text-sm mt-1 whitespace-pre-wrap">{settlement.remarks}</p>
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
