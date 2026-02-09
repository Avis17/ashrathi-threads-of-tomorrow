import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useJobProductionEntries, useDeleteJobProductionEntry } from '@/hooks/useJobProduction';
import { BatchProductionForm } from './BatchProductionForm';
import { format } from 'date-fns';
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

interface BatchProductionSectionProps {
  batchId: string;
}

export const BatchProductionSection = ({ batchId }: BatchProductionSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: productionEntries = [] } = useJobProductionEntries(batchId);
  const deleteEntryMutation = useDeleteJobProductionEntry();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEntryMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  // Group by section
  const sectionTotals: Record<string, { count: number; pieces: number; amount: number }> = {};
  productionEntries.forEach(entry => {
    if (!sectionTotals[entry.section]) {
      sectionTotals[entry.section] = { count: 0, pieces: 0, amount: 0 };
    }
    sectionTotals[entry.section].count++;
    sectionTotals[entry.section].pieces += entry.quantity_completed;
    sectionTotals[entry.section].amount += entry.total_amount;
  });

  const totalPieces = productionEntries.reduce((sum, e) => sum + e.quantity_completed, 0);
  const totalAmount = productionEntries.reduce((sum, e) => sum + e.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Entries</div>
            <div className="text-2xl font-bold text-blue-600">{productionEntries.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Pieces</div>
            <div className="text-2xl font-bold text-green-600">{totalPieces}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Labour Cost</div>
            <div className="text-2xl font-bold text-purple-600">₹{totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Operations</div>
            <div className="text-2xl font-bold text-orange-600">{Object.keys(sectionTotals).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Section-wise Summary */}
      {Object.keys(sectionTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Production by Operation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(sectionTotals).map(([section, data]) => (
                <div key={section} className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-medium text-sm">{section}</div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline">{data.pieces} pcs</Badge>
                    <span className="text-sm font-semibold">₹{data.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Entries List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Production Entries
          </CardTitle>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Production
          </Button>
        </CardHeader>
        <CardContent>
          {productionEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(entry.date), 'dd MMM')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.section}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{entry.employee_name}</TableCell>
                    <TableCell>
                      <Badge variant={entry.employee_type === 'Direct' ? 'default' : 'secondary'}>
                        {entry.employee_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {entry.quantity_completed}
                    </TableCell>
                    <TableCell className="text-right">₹{entry.rate_per_piece}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{entry.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                      {entry.remarks || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No production entries yet. Click "Add Production" to start tracking.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <BatchProductionForm
        batchId={batchId}
        open={showForm}
        onOpenChange={setShowForm}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Production Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this production entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
