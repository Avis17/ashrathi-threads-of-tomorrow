import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, Package, Clock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExternalJobOrder, useUpdateExternalJobOrder } from "@/hooks/useExternalJobOrders";
import { format } from "date-fns";
import { useState } from "react";
import { AddPaymentDialog } from "@/components/admin/external-jobs/AddPaymentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: jobOrder, isLoading } = useExternalJobOrder(id!);
  const updateStatus = useUpdateExternalJobOrder();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!jobOrder) {
    return <div>Job order not found</div>;
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      partial: "secondary",
      unpaid: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getJobStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      in_progress: "secondary",
      pending: "secondary",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateStatus.mutateAsync({
      id: jobOrder.id,
      data: { job_status: newStatus },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/external-jobs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{jobOrder.job_id}</h1>
            <p className="text-muted-foreground mt-1">Job Order Details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">₹{jobOrder.total_amount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Amount</p>
              <p className="text-2xl font-bold">₹{jobOrder.paid_amount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold">₹{jobOrder.balance_amount.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Job Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Company</p>
            <p className="font-medium">{jobOrder.external_job_companies.company_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Style Name</p>
            <p className="font-medium">{jobOrder.style_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Number of Pieces</p>
            <p className="font-medium">{jobOrder.number_of_pieces}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rate per Piece</p>
            <p className="font-medium">₹{jobOrder.rate_per_piece.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Delivery Date</p>
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4" />
              {format(new Date(jobOrder.delivery_date), 'dd MMM yyyy')}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Job Status</p>
            <Select value={jobOrder.job_status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Status</p>
            <div className="mt-1">{getPaymentStatusBadge(jobOrder.payment_status)}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Operations & Categories</h3>
        <div className="space-y-4">
          {jobOrder.external_job_operations.map((operation: any) => (
            <div key={operation.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">{operation.operation_name}</h4>
                <span className="text-sm font-medium">Total: ₹{operation.total_rate.toFixed(2)}</span>
              </div>
              {operation.external_job_operation_categories.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operation.external_job_operation_categories.map((category: any) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.category_name}</TableCell>
                        <TableCell className="text-right">₹{category.rate.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Payment History</h3>
          <Button onClick={() => setShowPaymentDialog(true)}>Add Payment</Button>
        </div>

        {jobOrder.external_job_payments && jobOrder.external_job_payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobOrder.external_job_payments.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="font-semibold">₹{payment.payment_amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.payment_mode}</TableCell>
                  <TableCell>{payment.reference_number || '-'}</TableCell>
                  <TableCell>{payment.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">No payments recorded yet</p>
        )}
      </Card>

      <AddPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        jobOrderId={jobOrder.id}
        balanceAmount={jobOrder.balance_amount}
      />
    </div>
  );
};

export default JobDetails;