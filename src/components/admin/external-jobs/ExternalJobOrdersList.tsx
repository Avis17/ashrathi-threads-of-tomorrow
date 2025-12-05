import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Calendar, Trash2, IndianRupee, Package, TrendingUp, CreditCard } from "lucide-react";
import { useExternalJobOrders, useDeleteExternalJobOrder } from "@/hooks/useExternalJobOrders";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export const ExternalJobOrdersList = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useExternalJobOrders();
  const deleteJobOrder = useDeleteExternalJobOrder();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobStatusFilter, setJobStatusFilter] = useState<string>("all");
  const [gstFilter, setGstFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      await deleteJobOrder.mutateAsync(orderToDelete);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders?.filter((order) => {
      const matchesSearch =
        search === "" ||
        order.job_id.toLowerCase().includes(search.toLowerCase()) ||
        order.style_name.toLowerCase().includes(search.toLowerCase()) ||
        order.external_job_companies?.company_name?.toLowerCase().includes(search.toLowerCase());
      
      const matchesPaymentStatus = statusFilter === "all" || order.payment_status === statusFilter;
      const matchesJobStatus = jobStatusFilter === "all" || order.job_status === jobStatusFilter;
      
      // GST filter: check if gst_percentage > 0 or gst_amount > 0
      const hasGst = (order.gst_percentage && order.gst_percentage > 0) || (order.gst_amount && order.gst_amount > 0);
      const matchesGstFilter = gstFilter === "all" || 
        (gstFilter === "with_gst" && hasGst) || 
        (gstFilter === "without_gst" && !hasGst);

      return matchesSearch && matchesPaymentStatus && matchesJobStatus && matchesGstFilter;
    });
  }, [orders, search, statusFilter, jobStatusFilter, gstFilter]);

  // Calculate stats based on filtered orders
  const stats = useMemo(() => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return {
        totalOrders: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalPieces: 0,
      };
    }

    const totalOrders = filteredOrders.length;
    const totalAmount = filteredOrders.reduce((sum, order) => {
      const amount = order.gst_amount && order.gst_amount > 0 
        ? (order.total_with_gst || order.total_amount) 
        : order.total_amount;
      return sum + (amount || 0);
    }, 0);
    const paidAmount = filteredOrders.reduce((sum, order) => sum + (order.paid_amount || 0), 0);
    const pendingAmount = totalAmount - paidAmount;
    const totalPieces = filteredOrders.reduce((sum, order) => sum + (order.number_of_pieces || 0), 0);

    return {
      totalOrders,
      totalAmount,
      paidAmount,
      pendingAmount,
      totalPieces,
    };
  }, [filteredOrders]);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
              <p className="text-blue-100 text-xs mt-1">{stats.totalPieces.toLocaleString()} pieces</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Amount</p>
              <p className="text-3xl font-bold mt-1">₹{stats.totalAmount.toLocaleString()}</p>
              <p className="text-emerald-100 text-xs mt-1">Including GST where applicable</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium">Paid Amount</p>
              <p className="text-3xl font-bold mt-1">₹{stats.paidAmount.toLocaleString()}</p>
              <p className="text-violet-100 text-xs mt-1">
                {stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount) * 100) : 0}% collected
              </p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Pending Amount</p>
              <p className="text-3xl font-bold mt-1">₹{stats.pendingAmount.toLocaleString()}</p>
              <p className="text-amber-100 text-xs mt-1">
                {stats.totalAmount > 0 ? Math.round((stats.pendingAmount / stats.totalAmount) * 100) : 0}% remaining
              </p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Job ID, Style, or Company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={gstFilter} onValueChange={setGstFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="GST Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="with_gst">With GST</SelectItem>
                <SelectItem value="without_gst">Without GST</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Job Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Pieces</TableHead>
                  <TableHead>Rate/Pc</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const hasGst = (order.gst_percentage && order.gst_percentage > 0) || (order.gst_amount && order.gst_amount > 0);
                    const displayTotal = hasGst ? (order.total_with_gst || order.total_amount) : order.total_amount;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.job_id}</TableCell>
                        <TableCell>{order.external_job_companies?.company_name}</TableCell>
                        <TableCell>{order.style_name}</TableCell>
                        <TableCell>{order.number_of_pieces}</TableCell>
                        <TableCell>₹{order.rate_per_piece.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">₹{displayTotal.toFixed(2)}</TableCell>
                        <TableCell>
                          {hasGst ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                              {order.gst_percentage}%
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              No GST
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                        <TableCell>{getJobStatusBadge(order.job_status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {order.order_date 
                              ? format(new Date(order.order_date), 'dd MMM yyyy')
                              : order.created_at 
                                ? format(new Date(order.created_at), 'dd MMM yyyy')
                                : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(order.delivery_date), 'dd MMM yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/external-jobs/details/${order.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(order.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      No job orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job order? This action cannot be undone and will remove all associated operations, categories, and payment records.
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
    </>
  );
};
