import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalJobSalary } from "@/hooks/useExternalJobSalaries";
import { 
  CalendarDays, 
  User, 
  Briefcase, 
  Hash, 
  Wallet, 
  CreditCard,
  FileText
} from "lucide-react";

interface SalaryDetailViewProps {
  salary: ExternalJobSalary;
}

export const SalaryDetailView = ({ salary }: SalaryDetailViewProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Pending</Badge>;
    }
  };

  const getPaymentModeLabel = (mode: string | null) => {
    switch (mode) {
      case 'cash': return 'Cash';
      case 'upi': return 'UPI';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cheque': return 'Cheque';
      default: return mode || '-';
    }
  };

  return (
    <div className="space-y-4">
      {/* Job Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Job Details
        </h4>
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="font-mono text-sm">{salary.job_order?.job_id || '-'}</p>
          <p className="font-medium">{salary.job_order?.style_name || '-'}</p>
          {salary.job_order?.company && (
            <p className="text-sm text-muted-foreground">
              {salary.job_order.company.company_name}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Employee Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <User className="h-4 w-4" />
          Employee Details
        </h4>
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="font-medium">{salary.employee?.name || '-'}</p>
          <p className="text-sm text-muted-foreground">
            Code: {salary.employee?.employee_code || '-'}
          </p>
          {salary.employee?.contractor && (
            <p className="text-sm text-muted-foreground">
              Contractor: {salary.employee.contractor.contractor_name}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Operation & Calculation */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Operation & Calculation
        </h4>
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Operation</span>
            <Badge variant="outline">{salary.operation}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pieces</span>
            <span className="font-medium">{salary.number_of_pieces}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate per Piece</span>
            <span>₹{salary.rate_per_piece}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-primary">{formatAmount(salary.total_amount)}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Payment Details
        </h4>
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            {getStatusBadge(salary.payment_status)}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Date</span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(new Date(salary.payment_date), 'dd MMM yyyy')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Mode</span>
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              {getPaymentModeLabel(salary.payment_mode)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {salary.notes && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </h4>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm whitespace-pre-wrap">{salary.notes}</p>
            </div>
          </div>
        </>
      )}

      {/* Timestamps */}
      <div className="text-xs text-muted-foreground pt-2">
        {salary.created_at && (
          <p>Created: {format(new Date(salary.created_at), 'dd MMM yyyy, HH:mm')}</p>
        )}
        {salary.updated_at && salary.updated_at !== salary.created_at && (
          <p>Updated: {format(new Date(salary.updated_at), 'dd MMM yyyy, HH:mm')}</p>
        )}
      </div>
    </div>
  );
};
