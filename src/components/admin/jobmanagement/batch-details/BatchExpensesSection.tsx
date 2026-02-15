import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Plus, Trash2, Pencil } from 'lucide-react';
import { useJobBatchExpenses, useDeleteJobBatchExpense, JobBatchExpense } from '@/hooks/useJobExpenses';
import { BatchExpenseForm } from './BatchExpenseForm';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BatchExpensesSectionProps {
  batchId: string;
  totalCutPieces?: number;
}

export const BatchExpensesSection = ({ batchId, totalCutPieces = 0 }: BatchExpensesSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<JobBatchExpense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: expenses = [] } = useJobBatchExpenses(batchId);
  const deleteExpenseMutation = useDeleteJobBatchExpense();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteExpenseMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleEdit = (expense: JobBatchExpense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = (open: boolean) => {
    setShowForm(open);
    if (!open) setEditingExpense(null);
  };

  const typeTotals: Record<string, number> = {};
  expenses.forEach(exp => {
    typeTotals[exp.expense_type] = (typeTotals[exp.expense_type] || 0) + exp.amount;
  });

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Per Piece Cost</div>
            <div className="text-2xl font-bold text-amber-600">
              ₹{totalCutPieces > 0 ? (totalAmount / totalCutPieces).toFixed(2) : '0.00'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {totalCutPieces > 0 ? `${totalCutPieces} pcs` : 'No cut pieces'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">No. of Entries</div>
            <div className="text-2xl font-bold text-blue-600">{expenses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Expense Types</div>
            <div className="text-2xl font-bold text-purple-600">{Object.keys(typeTotals).length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg per Entry</div>
            <div className="text-2xl font-bold text-orange-600">
              ₹{expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type-wise Summary */}
      {Object.keys(typeTotals).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Expenses by Type</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(typeTotals).map(([type, amount]) => (
                <div key={type} className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-medium text-sm">{type}</div>
                  <div className="text-lg font-semibold mt-1">₹{amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Expense Entries
          </CardTitle>
          <Button onClick={() => { setEditingExpense(null); setShowForm(true); }} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(expense.date), 'dd MMM')}
                    </TableCell>
                    <TableCell><Badge variant="outline">{expense.expense_type}</Badge></TableCell>
                    <TableCell className="font-medium">{expense.item_name}</TableCell>
                    <TableCell>
                      {expense.quantity && expense.unit ? `${expense.quantity} ${expense.unit}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {expense.supplier_name || '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">₹{expense.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                      {expense.note || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No expenses recorded yet. Click "Add Expense" to start tracking.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <BatchExpenseForm
        batchId={batchId}
        open={showForm}
        onOpenChange={handleFormClose}
        editingExpense={editingExpense}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense entry. This action cannot be undone.
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
