import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Clock, Tag, FileText, Building2, 
  Receipt, CreditCard, StickyNote, DollarSign 
} from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/expenseCategories";

interface GenericExpenseDetailsDialogProps {
  expense: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenericExpenseDetailsDialog({ 
  expense, 
  open, 
  onOpenChange 
}: GenericExpenseDetailsDialogProps) {
  if (!expense) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    return EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]?.label || category;
  };

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return '-';
    return method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">Expense Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Highlight Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Total Amount</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {getCategoryLabel(expense.category)}
              </Badge>
            </div>
          </div>

          {/* Date & Time Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Expense Date</p>
                <p className="text-base font-semibold">{formatDate(expense.date)}</p>
              </div>
            </div>
            
            {expense.expense_time && (
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Expense Time</p>
                  <p className="text-base font-semibold">{formatTime(expense.expense_time)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Category</p>
                <p className="text-base font-semibold">{getCategoryLabel(expense.category)}</p>
              </div>
            </div>
            
            {expense.subcategory && (
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Subcategory</p>
                  <p className="text-base font-semibold">{expense.subcategory}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">Description</p>
              <p className="text-base">{expense.description}</p>
            </div>
          </div>

          <Separator />

          {/* Supplier & Bill Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Supplier Name</p>
                <p className="text-base font-semibold">{expense.supplier_name || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Bill Number</p>
                <p className="text-base font-semibold">{expense.bill_number || '-'}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Payment Method</p>
              <p className="text-base font-semibold">{formatPaymentMethod(expense.payment_method)}</p>
            </div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <>
              <Separator />
              <div className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                <StickyNote className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Notes</p>
                  <p className="text-base text-amber-900 dark:text-amber-100">{expense.notes}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="font-medium mb-1">Created At</p>
              <p>{formatDateTime(expense.created_at)}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="font-medium mb-1">Last Updated</p>
              <p>{formatDateTime(expense.updated_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
