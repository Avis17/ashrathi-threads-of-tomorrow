import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, Package, Clock, FileText, Building2, Trash2, Pencil, Receipt, TrendingUp, Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExternalJobOrder, useUpdateExternalJobOrder, useDeleteExternalJobPayment } from "@/hooks/useExternalJobOrders";
import { useExternalJobExpenses, useDeleteExternalJobExpense, ExternalJobExpense } from "@/hooks/useExternalJobExpenses";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AddPaymentDialog } from "@/components/admin/external-jobs/AddPaymentDialog";
import { EditPaymentDialog } from "@/components/admin/external-jobs/EditPaymentDialog";
import { JobExpenseForm } from "@/components/admin/external-jobs/JobExpenseForm";
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
  const { data: jobOrder, isLoading, refetch } = useExternalJobOrder(id!);
  const { data: expenses = [] } = useExternalJobExpenses(id);
  const updateStatus = useUpdateExternalJobOrder();
  const deletePayment = useDeleteExternalJobPayment();
  const deleteExpense = useDeleteExternalJobExpense();
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState<number>(0);
  
  // Expense states
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExternalJobExpense | null>(null);
  const [expenseDeleteDialogOpen, setExpenseDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Local state for payment status to ensure UI updates
  const [localPaymentStatus, setLocalPaymentStatus] = useState<string>("");
  const [localJobStatus, setLocalJobStatus] = useState<string>("");

  useEffect(() => {
    if (jobOrder) {
      setGstEnabled((jobOrder.gst_percentage || 0) > 0);
      setGstPercentage(jobOrder.gst_percentage || 0);
      setLocalPaymentStatus(jobOrder.payment_status || "unpaid");
      setLocalJobStatus(jobOrder.job_status || "pending");
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

  const handleEditExpense = (expense: ExternalJobExpense) => {
    setSelectedExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpenseClick = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setExpenseDeleteDialogOpen(true);
  };

  const handleDeleteExpenseConfirm = async () => {
    if (expenseToDelete) {
      await deleteExpense.mutateAsync(expenseToDelete);
      setExpenseDeleteDialogOpen(false);
      setExpenseToDelete(null);
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

  const handleStatusChange = async (newStatus: string) => {
    const previousStatus = localJobStatus;
    setLocalJobStatus(newStatus);
    try {
      await updateStatus.mutateAsync({
        id: jobOrder.id,
        data: { job_status: newStatus },
      });
      toast.success('Job status updated successfully');
      refetch();
    } catch (error: any) {
      setLocalJobStatus(previousStatus);
      toast.error(error.message || 'Failed to update job status');
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    const previousStatus = localPaymentStatus;
    setLocalPaymentStatus(newStatus);
    try {
      await updateStatus.mutateAsync({
        id: jobOrder.id,
        data: { payment_status: newStatus },
      });
      toast.success('Payment status updated successfully');
      refetch();
    } catch (error: any) {
      setLocalPaymentStatus(previousStatus);
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  // Calculate totals - include GST in balance
  const baseTotal = jobOrder?.total_amount || 0;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const gstAmount = gstEnabled ? (baseTotal * gstPercentage) / 100 : 0;
  const totalWithGst = baseTotal + gstAmount;
  
  // Calculate the correct balance including GST
  const effectiveTotal = jobOrder.gst_percentage > 0 
    ? (jobOrder.total_with_gst || totalWithGst) 
    : jobOrder.total_amount;
  const correctBalanceAmount = effectiveTotal - (jobOrder.paid_amount || 0);

  // Calculate company profit details
  const operationsTotal = jobOrder.external_job_operations?.reduce((sum: number, op: any) => sum + (op.total_rate || 0), 0) || 0;
  const accessoriesCost = jobOrder.accessories_cost || 0;
  const deliveryCharge = jobOrder.delivery_charge || 0;
  
  // Calculate total adjustments from round-offs
  const totalAdjustmentsPerPiece = jobOrder.external_job_operations?.reduce((sum: number, op: any) => {
    const categoriesTotal = op.external_job_operation_categories
      ?.reduce((s: number, cat: any) => s + cat.rate, 0) || 0;
    const commissionPercent = op.commission_percent || 0;
    const commissionAmount = (categoriesTotal * commissionPercent) / 100;
    const calculatedTotal = categoriesTotal + commissionAmount;
    const roundOff = op.round_off ?? null;
    const adjustment = (roundOff !== null && roundOff !== undefined) 
      ? roundOff - calculatedTotal 
      : 0;
    return sum + adjustment;
  }, 0) || 0;
  
  // Calculate total commission from commission_percent field
  let totalCommissionPerPiece = 0;
  jobOrder.external_job_operations?.forEach((op: any) => {
    const categoriesTotal = op.external_job_operation_categories
      ?.reduce((sum: number, cat: any) => sum + cat.rate, 0) || 0;
    
    const commissionPercent = op.commission_percent || 0;
    if (commissionPercent > 0) {
      totalCommissionPerPiece += (categoriesTotal * commissionPercent) / 100;
    }
  });

  // Company profit calculation - rate per piece minus operations total (which includes round-off adjustments)
  const actualCompanyProfitPerPiece = jobOrder.rate_per_piece - operationsTotal;
  
  const totalCompanyProfit = actualCompanyProfitPerPiece * jobOrder.number_of_pieces;
  const totalCommission = totalCommissionPerPiece * jobOrder.number_of_pieces;
  const totalAdjustments = totalAdjustmentsPerPiece * jobOrder.number_of_pieces;
  
  // Net profit after expenses
  const netProfitAfterExpenses = totalCompanyProfit - totalExpenses;
  const netProfitPerPiece = netProfitAfterExpenses / jobOrder.number_of_pieces;

  const handleGstUpdate = async () => {
    try {
      await updateStatus.mutateAsync({
        id: jobOrder.id,
        data: {
          gst_percentage: gstEnabled ? gstPercentage : 0,
          gst_amount: gstAmount,
          total_with_gst: totalWithGst,
        },
      });
      toast.success('GST updated successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update GST');
    }
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
              <p className="text-2xl font-bold">
                ₹{(jobOrder.gst_percentage > 0 ? jobOrder.total_with_gst : jobOrder.total_amount).toFixed(2)}
              </p>
              {jobOrder.gst_percentage > 0 && (
                <p className="text-xs text-muted-foreground">Incl. {jobOrder.gst_percentage}% GST</p>
              )}
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
              <p className="text-2xl font-bold">
                ₹{((jobOrder.gst_percentage > 0 ? jobOrder.total_with_gst : jobOrder.total_amount) - jobOrder.paid_amount).toFixed(2)}
              </p>
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
            <Select value={localJobStatus} onValueChange={handleStatusChange}>
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
            <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
            <Select value={localPaymentStatus} onValueChange={handlePaymentStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Detailed Cost Breakdown
            </h3>
            <div className="space-y-6">
              {jobOrder.external_job_operations.map((operation: any) => {
                const categoriesTotal = operation.external_job_operation_categories
                  ?.reduce((sum: number, cat: any) => sum + cat.rate, 0) || 0;
                
                const commissionPercent = operation.commission_percent || 0;
                const commissionAmount = (categoriesTotal * commissionPercent) / 100;
                const calculatedTotal = categoriesTotal + commissionAmount;
                
                // Get round_off and adjustment from operations_data if available
                const roundOff = operation.round_off ?? null;
                const adjustment = (roundOff !== null && roundOff !== undefined) 
                  ? roundOff - calculatedTotal 
                  : 0;
                const finalTotal = roundOff ?? calculatedTotal;
                
                return (
                  <div key={operation.id} className="bg-white/50 p-5 rounded-lg space-y-3 border-l-4 border-primary">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-lg text-primary">{operation.operation_name}</h4>
                      <span className="text-lg font-bold">₹{operation.total_rate?.toFixed(2) || finalTotal.toFixed(2)}</span>
                    </div>
                    
                    {operation.external_job_operation_categories?.length > 0 && (
                      <div className="space-y-2 ml-4">
                        {operation.external_job_operation_categories.map((category: any) => (
                          <div key={category.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{category.category_name}</span>
                            <span className="font-medium">₹{category.rate.toFixed(2)}</span>
                          </div>
                        ))}
                        
                        {commissionPercent > 0 && (
                          <>
                            <div className="flex justify-between text-sm pt-2 border-t">
                              <span className="font-medium">Categories Total:</span>
                              <span className="font-semibold">₹{categoriesTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-orange-600">
                              <span className="font-medium">Commission ({commissionPercent}%):</span>
                              <span className="font-semibold">₹{commissionAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}

                        {/* Display Round-off Adjustment if present */}
                        {roundOff !== null && adjustment !== 0 && (
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span className={`font-medium ${adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Adjustment:
                            </span>
                            <span className={`font-semibold ${adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {adjustment >= 0 ? '+' : ''}₹{adjustment.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Operation Type Subtotals */}
              {(() => {
                const singerTotal = jobOrder.external_job_operations
                  ?.filter((op: any) => op.operation_name?.toLowerCase().includes('singer'))
                  ?.reduce((sum: number, op: any) => sum + (op.total_rate || 0), 0) || 0;
                
                const overlockTotal = jobOrder.external_job_operations
                  ?.filter((op: any) => op.operation_name?.toLowerCase().includes('overlock'))
                  ?.reduce((sum: number, op: any) => sum + (op.total_rate || 0), 0) || 0;
                
                const flatlockTotal = jobOrder.external_job_operations
                  ?.filter((op: any) => op.operation_name?.toLowerCase().includes('flatlock'))
                  ?.reduce((sum: number, op: any) => sum + (op.total_rate || 0), 0) || 0;
                
                const powerTableTotal = overlockTotal + flatlockTotal;
                
                const hasSinger = singerTotal > 0;
                const hasPowerTable = powerTableTotal > 0;
                
                // Calculate total adjustments from all operations
                const totalAdjustments = jobOrder.external_job_operations?.reduce((sum: number, op: any) => {
                  const categoriesTotal = op.external_job_operation_categories
                    ?.reduce((s: number, cat: any) => s + cat.rate, 0) || 0;
                  const commissionPercent = op.commission_percent || 0;
                  const commissionAmount = (categoriesTotal * commissionPercent) / 100;
                  const calculatedTotal = categoriesTotal + commissionAmount;
                  const roundOff = op.round_off ?? null;
                  const adjustment = (roundOff !== null && roundOff !== undefined) 
                    ? roundOff - calculatedTotal 
                    : 0;
                  return sum + adjustment;
                }, 0) || 0;
                
                // Calculate company profit percent
                const companyProfitPercent = operationsTotal > 0 
                  ? ((jobOrder.rate_per_piece - operationsTotal) / operationsTotal * 100)
                  : 0;
                
                return (
                  <div className="space-y-4">
                    {(hasSinger || hasPowerTable) && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2 border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">Operation Subtotals</h4>
                        {hasSinger && (
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Singer Total:</span>
                            <span className="font-bold text-blue-600">₹{singerTotal.toFixed(2)}</span>
                          </div>
                        )}
                        {hasPowerTable && (
                          <>
                            {overlockTotal > 0 && (
                              <div className="flex justify-between text-sm pl-4">
                                <span className="text-muted-foreground">Overlock:</span>
                                <span className="font-medium">₹{overlockTotal.toFixed(2)}</span>
                              </div>
                            )}
                            {flatlockTotal > 0 && (
                              <div className="flex justify-between text-sm pl-4">
                                <span className="text-muted-foreground">Flatlock:</span>
                                <span className="font-medium">₹{flatlockTotal.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm pt-1 border-t border-blue-200 dark:border-blue-700">
                              <span className="font-medium">Power Table Total:</span>
                              <span className="font-bold text-blue-600">₹{powerTableTotal.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Company Profit Section */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2 border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">Company Profit</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Operations Cost (per piece):</span>
                        <span className="font-medium">₹{operationsTotal.toFixed(2)}</span>
                      </div>
                      {totalAdjustments !== 0 && (
                        <div className="flex justify-between text-sm">
                          <span className={`${totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Total Round-off Adjustments:
                          </span>
                          <span className={`font-medium ${totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalAdjustments >= 0 ? '+' : ''}₹{totalAdjustments.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate per Piece:</span>
                        <span className="font-medium">₹{jobOrder.rate_per_piece.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-green-200 dark:border-green-700">
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          Company Profit (per piece):
                        </span>
                        <span className="font-bold text-green-600">
                          ₹{(jobOrder.rate_per_piece - operationsTotal).toFixed(2)} 
                          <span className="text-xs ml-1">({companyProfitPercent.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t border-green-200 dark:border-green-700">
                        <span className="text-green-700 dark:text-green-300">
                          Total Company Profit ({jobOrder.number_of_pieces} pcs):
                        </span>
                        <span className="text-green-600">
                          ₹{((jobOrder.rate_per_piece - operationsTotal) * jobOrder.number_of_pieces).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

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
        </TabsContent>

        <TabsContent value="profit">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Profit Analysis
            </h3>
            
            {/* Expected vs Actual Comparison */}
            {(() => {
              const expectedTotal = jobOrder.gst_percentage > 0 
                ? (jobOrder.total_with_gst || totalWithGst) 
                : jobOrder.total_amount;
              const paidAmount = jobOrder.paid_amount || 0;
              const paymentDifference = paidAmount - expectedTotal;
              const actualNetProfit = totalCompanyProfit - totalExpenses + paymentDifference;
              const expectedNetProfit = netProfitAfterExpenses;
              const profitDifference = actualNetProfit - expectedNetProfit;
              
              return (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-900/20">
                  <h4 className="font-semibold text-lg mb-4 text-blue-700 dark:text-blue-300">
                    Expected vs Actual (Based on Payment)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Expected Amount</p>
                      <p className="text-lg font-bold">₹{expectedTotal.toFixed(2)}</p>
                      {jobOrder.gst_percentage > 0 && (
                        <p className="text-xs text-muted-foreground">Incl. {jobOrder.gst_percentage}% GST</p>
                      )}
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Actually Paid</p>
                      <p className="text-lg font-bold">₹{paidAmount.toFixed(2)}</p>
                      {paymentDifference !== 0 && (
                        <p className={`text-xs font-medium ${paymentDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {paymentDifference >= 0 ? '+' : ''}₹{paymentDifference.toFixed(2)} from expected
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Actual Net Profit</p>
                      <p className={`text-lg font-bold ${actualNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{actualNetProfit.toFixed(2)}
                      </p>
                      {profitDifference !== 0 && (
                        <p className={`text-xs font-medium ${profitDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitDifference >= 0 ? '+' : ''}₹{profitDifference.toFixed(2)} from expected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Per Piece Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Per Piece Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operations Cost:</span>
                    <span className="font-medium">₹{operationsTotal.toFixed(2)}</span>
                  </div>
                  {totalAdjustmentsPerPiece !== 0 && (
                    <div className="flex justify-between">
                      <span className={`text-muted-foreground ${totalAdjustmentsPerPiece >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Round-off Adjustments:
                      </span>
                      <span className={`font-medium ${totalAdjustmentsPerPiece >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalAdjustmentsPerPiece >= 0 ? '+' : ''}₹{totalAdjustmentsPerPiece.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission (Contractor):</span>
                    <span className="font-medium text-orange-600">₹{totalCommissionPerPiece.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Company Profit:
                    </span>
                    <span className="font-medium text-green-600">₹{actualCompanyProfitPerPiece.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Rate per Piece:</span>
                    <span className="text-primary">₹{jobOrder.rate_per_piece.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Total Summary - Expected */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Expected Summary ({jobOrder.number_of_pieces} pcs)</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-medium">₹{jobOrder.total_amount.toFixed(2)}</span>
                  </div>
                  {jobOrder.gst_percentage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST ({jobOrder.gst_percentage}%):</span>
                      <span className="font-medium">₹{(jobOrder.gst_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Commission Paid:</span>
                    <span className="font-medium text-orange-600">₹{totalCommission.toFixed(2)}</span>
                  </div>
                  {totalAdjustments !== 0 && (
                    <div className="flex justify-between">
                      <span className={`text-muted-foreground ${totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Total Round-off Adjustments:
                      </span>
                      <span className={`font-medium ${totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalAdjustments >= 0 ? '+' : ''}₹{totalAdjustments.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Company Profit:</span>
                    <span className="font-medium text-green-600">₹{totalCompanyProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span className="text-muted-foreground">Total Expenses:</span>
                    <span className="font-medium">-₹{totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 text-xl font-bold">
                    <span>Expected Net Profit:</span>
                    <span className={netProfitAfterExpenses >= 0 ? "text-green-600" : "text-destructive"}>
                      ₹{netProfitAfterExpenses.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Net Profit per Piece:</span>
                    <span className={netProfitPerPiece >= 0 ? "text-green-600" : "text-destructive"}>
                      ₹{netProfitPerPiece.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Job Expenses
              </h3>
              <Button onClick={() => { setSelectedExpense(null); setShowExpenseForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>

            {expenses.length > 0 ? (
              <>
                <div className="mb-4 p-4 bg-muted/50 rounded-lg flex justify-between items-center">
                  <span className="font-medium">Total Expenses:</span>
                  <span className="text-xl font-bold text-destructive">₹{totalExpenses.toFixed(2)}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(new Date(expense.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expense.expense_type}</Badge>
                        </TableCell>
                        <TableCell>{expense.item_name}</TableCell>
                        <TableCell>
                          {expense.quantity ? `${expense.quantity} ${expense.unit || ''}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">₹{expense.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpenseClick(expense.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No expenses recorded yet</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments">
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
        </TabsContent>
      </Tabs>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          GST Configuration
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
                {jobOrder.gst_percentage > 0 ? 'Update GST' : 'Add GST'}
              </Button>
            </div>
          )}

          {!gstEnabled && jobOrder.gst_percentage > 0 && (
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
        balanceAmount={correctBalanceAmount}
      />

      {selectedPayment && (
        <EditPaymentDialog
          open={showEditPaymentDialog}
          onOpenChange={(open) => {
            setShowEditPaymentDialog(open);
            if (!open) setSelectedPayment(null);
          }}
          payment={selectedPayment}
          balanceAmount={correctBalanceAmount}
        />
      )}

      <JobExpenseForm
        open={showExpenseForm}
        onOpenChange={(open) => {
          setShowExpenseForm(open);
          if (!open) setSelectedExpense(null);
        }}
        jobOrderId={jobOrder.id}
        expense={selectedExpense}
      />

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

      <AlertDialog open={expenseDeleteDialogOpen} onOpenChange={setExpenseDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExpenseConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobDetails;
