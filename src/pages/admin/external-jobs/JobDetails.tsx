import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, Package, Clock, Edit, FileText, Building2, Trash2, Pencil, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExternalJobOrder, useUpdateExternalJobOrder, useDeleteExternalJobPayment } from "@/hooks/useExternalJobOrders";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { AddPaymentDialog } from "@/components/admin/external-jobs/AddPaymentDialog";
import { EditPaymentDialog } from "@/components/admin/external-jobs/EditPaymentDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: jobOrder, isLoading } = useExternalJobOrder(id!);
  const updateStatus = useUpdateExternalJobOrder();
  const deletePayment = useDeleteExternalJobPayment();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState<number>(0);

  useEffect(() => {
    if (jobOrder) {
      setGstEnabled((jobOrder.gst_percentage || 0) > 0);
      setGstPercentage(jobOrder.gst_percentage || 0);
    }
  }, [jobOrder]);

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowEditPaymentDialog(true);
  };

  const handleDeleteClick = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (paymentToDelete) {
      await deletePayment.mutateAsync(paymentToDelete);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

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

  const baseTotal = jobOrder?.total_amount || 0;
  const gstAmount = gstEnabled ? (baseTotal * gstPercentage) / 100 : 0;
  const totalWithGst = baseTotal + gstAmount;

  const handleGstUpdate = () => {
    updateStatus.mutateAsync({
      id: jobOrder.id,
      data: {
        gst_percentage: gstEnabled ? gstPercentage : 0,
        gst_amount: gstAmount,
        total_with_gst: totalWithGst,
      },
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/external-jobs/company/${jobOrder.external_job_companies.id}`)}
          >
            <Building2 className="h-4 w-4 mr-2" />
            View Company
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/external-jobs/invoice/${jobOrder.id}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
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

      {/* Detailed Cost Breakdown */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Detailed Cost Breakdown
        </h3>
        <div className="space-y-6">
          {jobOrder.external_job_operations.map((operation: any) => {
            const baseTotal = operation.external_job_operation_categories
              .filter((cat: any) => cat.category_name !== "Contract Commission")
              .reduce((sum: number, cat: any) => sum + cat.rate, 0);
            
            const commissionCat = operation.external_job_operation_categories
              .find((cat: any) => cat.category_name === "Contract Commission");
            
            const commissionAmount = commissionCat ? (baseTotal * commissionCat.rate) / 100 : 0;
            
            return (
              <div key={operation.id} className="bg-white/50 p-5 rounded-lg space-y-3 border-l-4 border-primary">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-lg text-primary">{operation.operation_name}</h4>
                  <span className="text-lg font-bold">₹{operation.total_rate.toFixed(2)}</span>
                </div>
                
                {operation.external_job_operation_categories.length > 0 && (
                  <div className="space-y-2 ml-4">
                    {operation.external_job_operation_categories
                      .filter((cat: any) => cat.category_name !== "Contract Commission")
                      .map((category: any) => (
                        <div key={category.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{category.category_name}</span>
                          <span className="font-medium">{category.rate}% = ₹{category.rate.toFixed(2)}</span>
                        </div>
                      ))}
                    
                    {commissionCat && (
                      <>
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="font-medium">Base Total:</span>
                          <span className="font-semibold">₹{baseTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-orange-600">
                          <span className="font-medium">Contract Commission ({commissionCat.rate}%):</span>
                          <span className="font-semibold">₹{commissionAmount.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t-2 pt-4 space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Rate per Piece:</span>
              <span className="text-primary">₹{jobOrder.rate_per_piece.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Number of Pieces:</span>
              <span className="font-medium">{jobOrder.number_of_pieces}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Subtotal:</span>
              <span>₹{(jobOrder.rate_per_piece * jobOrder.number_of_pieces).toFixed(2)}</span>
            </div>
            
            {jobOrder.accessories_cost > 0 && (
              <div className="flex justify-between text-sm">
                <span>Accessories:</span>
                <span className="font-medium">₹{jobOrder.accessories_cost.toFixed(2)}</span>
              </div>
            )}
            
            {jobOrder.delivery_charge > 0 && (
              <div className="flex justify-between text-sm">
                <span>Delivery:</span>
                <span className="font-medium">₹{jobOrder.delivery_charge.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-2xl font-bold pt-3 border-t-2">
              <span>Total Amount:</span>
              <span className="text-primary">₹{jobOrder.total_amount.toFixed(2)}</span>
            </div>
          </div>
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
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPayment(payment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(payment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">No payments recorded yet</p>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          GST & Final Total
        </h3>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gst-enabled"
              checked={gstEnabled}
              onCheckedChange={(checked) => setGstEnabled(!!checked)}
            />
            <Label htmlFor="gst-enabled" className="cursor-pointer">
              Apply GST
            </Label>
          </div>

          {gstEnabled && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="gst-percentage">GST Percentage (%)</Label>
                <Input
                  id="gst-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                  placeholder="Enter GST percentage"
                />
              </div>
              <Button onClick={handleGstUpdate} className="w-full">
                Update GST
              </Button>
            </div>
          )}

          {!gstEnabled && baseTotal > 0 && (
            <Button onClick={handleGstUpdate} variant="outline" className="w-full">
              Remove GST
            </Button>
          )}

          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Total:</span>
              <span className="font-medium">₹{baseTotal.toFixed(2)}</span>
            </div>
            {gstEnabled && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({gstPercentage}%):</span>
                <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Final Total:</span>
              <span className="text-primary">₹{totalWithGst.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      <AddPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        jobOrderId={jobOrder.id}
        balanceAmount={jobOrder.balance_amount}
      />

      {selectedPayment && (
        <EditPaymentDialog
          open={showEditPaymentDialog}
          onOpenChange={setShowEditPaymentDialog}
          payment={selectedPayment}
          balanceAmount={jobOrder.balance_amount}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record? This action cannot be undone and will affect the balance calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobDetails;