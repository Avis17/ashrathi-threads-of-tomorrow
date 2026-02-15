import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, Plus, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useBatchJobWorks, useDeleteJobWork, useJobWorkOperations } from '@/hooks/useJobWorks';
import { JobWorkCreateForm } from './JobWorkCreateForm';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  batchId: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
}

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-300',
  partial: 'bg-blue-500/10 text-blue-700 border-blue-300',
  paid: 'bg-green-500/10 text-green-700 border-green-300',
};

export const BatchJobWorkSection = ({ batchId, rollsData, cuttingSummary }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: jobWorks = [] } = useBatchJobWorks(batchId);
  const deleteMutation = useDeleteJobWork();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const totalAmount = jobWorks.reduce((sum, jw) => sum + jw.total_amount, 0);
  const totalPaid = jobWorks.reduce((sum, jw) => sum + jw.paid_amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Job Works</div>
            <div className="text-2xl font-bold text-indigo-600">{jobWorks.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Paid</div>
            <div className="text-2xl font-bold text-emerald-600">₹{totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Balance</div>
            <div className="text-2xl font-bold text-orange-600">₹{(totalAmount - totalPaid).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Job Works List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" />
            Job Work Entries
          </CardTitle>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Job Work
          </Button>
        </CardHeader>
        <CardContent>
          {jobWorks.length > 0 ? (
            <div className="space-y-3">
              {jobWorks.map((jw) => (
                <JobWorkRow
                  key={jw.id}
                  jobWork={jw}
                  isExpanded={expandedId === jw.id}
                  onToggle={() => setExpandedId(expandedId === jw.id ? null : jw.id)}
                  onDelete={() => setDeleteId(jw.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No job works created yet. Click "Add Job Work" to outsource operations.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Form */}
      <JobWorkCreateForm
        batchId={batchId}
        rollsData={rollsData}
        cuttingSummary={cuttingSummary}
        open={showForm}
        onOpenChange={setShowForm}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Work?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job work entry and all its operations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const JobWorkRow = ({
  jobWork,
  isExpanded,
  onToggle,
  onDelete,
}: {
  jobWork: any;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const { data: operations = [] } = useJobWorkOperations(isExpanded ? jobWork.id : undefined);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div>
                <p className="font-medium">{jobWork.company_name}</p>
                <p className="text-sm text-muted-foreground">
                  {jobWork.color} · {jobWork.pieces} pcs · {format(new Date(jobWork.created_at), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={PAYMENT_COLORS[jobWork.payment_status] || ''}>
                {jobWork.payment_status}
              </Badge>
              <div className="text-right">
                <p className="font-semibold">₹{jobWork.total_amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Paid: ₹{jobWork.paid_amount.toFixed(2)}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-4 pb-4 pt-2">
            {jobWork.notes && (
              <p className="text-sm text-muted-foreground mb-3">Notes: {jobWork.notes}</p>
            )}
            {operations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
                    <TableHead className="text-right">Rate/Pc</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell className="font-medium">{op.operation}</TableCell>
                      <TableCell className="text-right">₹{op.rate_per_piece.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{op.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">₹{op.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{op.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Loading operations...</p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
