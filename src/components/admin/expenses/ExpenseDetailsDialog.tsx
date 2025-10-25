import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EXPENSE_CATEGORIES } from "@/lib/expenseCategories";

interface ExpenseDetailsDialogProps {
  expense: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDetailsDialog({ expense, open, onOpenChange }: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    return EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]?.label || category;
  };

  const formatPaymentMethod = (method: string) => {
    return method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h3 className="text-lg font-semibold">Status</h3>
            {expense.is_approved ? (
              <Badge variant="default" className="bg-green-600">
                Approved
              </Badge>
            ) : (
              <Badge variant="secondary">Pending Approval</Badge>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expense Date</label>
              <p className="text-base mt-1">
                {new Date(expense.expense_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-base font-semibold mt-1">
                {formatCurrency(expense.amount)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p className="text-base mt-1">{getCategoryLabel(expense.category)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
              <p className="text-base mt-1">{expense.subcategory}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-base mt-1">{expense.description}</p>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
              <p className="text-base mt-1">{formatPaymentMethod(expense.payment_method)}</p>
            </div>

            {expense.receipt_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Receipt Number</label>
                <p className="text-base mt-1">{expense.receipt_number}</p>
              </div>
            )}

            {expense.vendor_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
                <p className="text-base mt-1">{expense.vendor_name}</p>
              </div>
            )}

            {expense.branches?.building_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Branch</label>
                <p className="text-base mt-1">{expense.branches.building_name}</p>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          {expense.notes && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="text-base mt-1">{expense.notes}</p>
            </div>
          )}

          {/* Approval Information */}
          {expense.is_approved && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground">Approval Details</label>
              <p className="text-base mt-1">
                Approved on {new Date(expense.approved_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t text-sm text-muted-foreground">
            <div>
              <label className="font-medium">Created At</label>
              <p className="mt-1">
                {new Date(expense.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="font-medium">Last Updated</label>
              <p className="mt-1">
                {new Date(expense.updated_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
