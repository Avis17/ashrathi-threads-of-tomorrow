import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useJobBatchExpenses } from '@/hooks/useJobExpenses';
import { format } from 'date-fns';
import ExpenseForm from './ExpenseForm';

const ExpensesManager = () => {
  const { data: expenses, isLoading } = useJobBatchExpenses();
  const [isFormOpen, setIsFormOpen] = useState(false);

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

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Recent Expenses</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 animate-pulse rounded" />
              ))}
            </div>
          ) : expenses && expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.slice(0, 20).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium">{expense.item_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {expense.expense_type} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                      {expense.supplier_name && ` • ${expense.supplier_name}`}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-bold text-lg text-primary">₹{expense.amount.toFixed(2)}</div>
                    {expense.quantity && expense.rate_per_unit && (
                      <div className="text-xs text-muted-foreground">
                        {expense.quantity} {expense.unit} × ₹{expense.rate_per_unit}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No expenses recorded yet</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <ExpenseForm onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesManager;
