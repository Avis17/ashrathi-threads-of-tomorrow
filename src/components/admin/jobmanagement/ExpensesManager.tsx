import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobBatchExpenses, useDeleteJobBatchExpense, JobBatchExpense } from '@/hooks/useJobExpenses';
import { useJobBatches } from '@/hooks/useJobBatches';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import ExpenseForm from './ExpenseForm';

const ExpensesManager = () => {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<JobBatchExpense | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: batches } = useJobBatches();
  const { data: expenses, isLoading } = useJobBatchExpenses(selectedBatch === 'all' ? undefined : selectedBatch);
  const deleteExpenseMutation = useDeleteJobBatchExpense();

  const filteredExpenses = expenses?.filter((expense) => {
    if (!debouncedSearchTerm) return true;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      expense.item_name.toLowerCase().includes(searchLower) ||
      expense.expense_type.toLowerCase().includes(searchLower) ||
      expense.supplier_name?.toLowerCase().includes(searchLower) ||
      expense.bill_number?.toLowerCase().includes(searchLower) ||
      expense.note?.toLowerCase().includes(searchLower)
    );
  });

  const totalAmount = filteredExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  const handleEdit = (expense: JobBatchExpense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExpenseMutation.mutate(id, {
      onSuccess: () => {
        setDeleteExpenseId(null);
      },
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Job Expenses</h2>
          <p className="text-muted-foreground mt-1">Track all batch-related expenses</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches?.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.batch_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Current Results Total</p>
            <p className="text-3xl font-bold text-foreground">₹{totalAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              Showing {filteredExpenses?.length || 0} of {expenses?.length || 0} expenses
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Expenses</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 animate-pulse rounded" />
              ))}
            </div>
          ) : filteredExpenses && filteredExpenses.length > 0 ? (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{expense.item_name}</span>
                      {expense.batch_id && (() => {
                        const batch = batches?.find(b => b.id === expense.batch_id);
                        return batch ? (
                          <button
                            onClick={() => navigate(`/admin/job-management/batch/${expense.batch_id}`)}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {batch.batch_number}
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        ) : null;
                      })()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {expense.expense_type} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                      {expense.supplier_name && ` • ${expense.supplier_name}`}
                    </div>
                  </div>
                  <div className="text-right space-y-1 mr-4">
                    <div className="font-bold text-lg text-primary">₹{expense.amount.toFixed(2)}</div>
                    {expense.quantity && expense.rate_per_unit && (
                      <div className="text-xs text-muted-foreground">
                        {expense.quantity} {expense.unit} × ₹{expense.rate_per_unit}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteExpenseId(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No expenses found</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl">
          <ExpenseForm expense={editingExpense} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteExpenseId} onOpenChange={() => setDeleteExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteExpenseId && handleDelete(deleteExpenseId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpensesManager;
