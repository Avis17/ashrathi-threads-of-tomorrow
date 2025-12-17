import { useState, useMemo } from "react";
import { format } from "date-fns";
import { 
  Plus, Search, Filter, Download, Eye, Copy, Lock, Trash2, 
  FileText, IndianRupee, Receipt, AlertCircle, Building2,
  Calendar, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { usePurchaseOrders, PurchaseOrder } from "@/hooks/usePurchaseOrders";
import PurchaseOrderForm from "@/components/admin/purchases/PurchaseOrderForm";
import PurchaseOrderDetail from "@/components/admin/purchases/PurchaseOrderDetail";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "fabric", label: "Fabric" },
  { value: "elastic", label: "Elastic" },
  { value: "thread", label: "Thread" },
  { value: "packaging", label: "Packaging" },
  { value: "machine", label: "Machine" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

const PurchasesExpenses = () => {
  const { purchaseOrders, suppliers, isLoading, deletePurchaseOrder, lockPurchaseOrder } = usePurchaseOrders();
  
  const [showAmounts, setShowAmounts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [gstFilter, setGstFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [missingBillsFilter, setMissingBillsFilter] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [lockConfirmId, setLockConfirmId] = useState<string | null>(null);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!purchaseOrders) return { totalValue: 0, totalGst: 0, pendingBills: 0, topSupplier: null };
    
    const totalValue = purchaseOrders.reduce((sum, po) => sum + Number(po.grand_total), 0);
    const totalGst = purchaseOrders.reduce((sum, po) => 
      sum + Number(po.cgst_amount) + Number(po.sgst_amount) + Number(po.igst_amount), 0);
    
    // For pending bills, we'd need to check po_files - simplified for now
    const pendingBills = purchaseOrders.filter(po => po.status === 'draft').length;
    
    // Top supplier by spend
    const supplierSpend: Record<string, { name: string; total: number }> = {};
    purchaseOrders.forEach(po => {
      if (po.supplier_id && po.po_suppliers) {
        if (!supplierSpend[po.supplier_id]) {
          supplierSpend[po.supplier_id] = { name: po.po_suppliers.supplier_name, total: 0 };
        }
        supplierSpend[po.supplier_id].total += Number(po.grand_total);
      }
    });
    
    const topSupplier = Object.values(supplierSpend).sort((a, b) => b.total - a.total)[0] || null;
    
    return { totalValue, totalGst, pendingBills, topSupplier };
  }, [purchaseOrders]);

  // Filter purchase orders
  const filteredOrders = useMemo(() => {
    if (!purchaseOrders) return [];
    
    return purchaseOrders.filter(po => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!po.po_number.toLowerCase().includes(search) &&
            !po.po_suppliers?.supplier_name?.toLowerCase().includes(search) &&
            !po.invoice_number?.toLowerCase().includes(search)) {
          return false;
        }
      }
      if (categoryFilter !== "all" && po.category !== categoryFilter) return false;
      if (gstFilter !== "all" && po.gst_type !== gstFilter) return false;
      if (statusFilter !== "all" && po.status !== statusFilter) return false;
      
      return true;
    });
  }, [purchaseOrders, searchTerm, categoryFilter, gstFilter, statusFilter]);

  const formatCurrency = (amount: number) => {
    if (!showAmounts) return "****";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDetailOpen(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    if (po.status === 'locked') {
      return;
    }
    setSelectedPO(po);
    setIsFormOpen(true);
  };

  const handleDuplicate = (po: PurchaseOrder) => {
    // Create a copy without id and po_number
    const duplicate = { ...po, id: '', po_number: '', status: 'draft' };
    setSelectedPO(duplicate as any);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deletePurchaseOrder.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleLock = async () => {
    if (lockConfirmId) {
      await lockPurchaseOrder.mutateAsync(lockConfirmId);
      setLockConfirmId(null);
    }
  };

  const exportToCSV = () => {
    if (!filteredOrders.length) return;
    
    const headers = ['PO Number', 'Supplier', 'Category', 'Invoice No', 'Date', 'Total', 'GST', 'Status'];
    const rows = filteredOrders.map(po => [
      po.po_number,
      po.po_suppliers?.supplier_name || '',
      po.category,
      po.invoice_number || '',
      format(new Date(po.purchase_date), 'dd/MM/yyyy'),
      po.grand_total,
      Number(po.cgst_amount) + Number(po.sgst_amount) + Number(po.igst_amount),
      po.status
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchases_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Purchases & Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Every purchase traceable. Every bill accounted.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAmounts(!showAmounts)}
          >
            {showAmounts ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showAmounts ? "Hide" : "Show"}
          </Button>
          <Button onClick={() => { setSelectedPO(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Purchase / Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Total Purchase Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(kpis.totalValue)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Total GST Paid (Input Credit)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">{formatCurrency(kpis.totalGst)}</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-600">{kpis.pendingBills}</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Top Supplier by Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900 truncate">
              {kpis.topSupplier?.name || "N/A"}
            </p>
            {kpis.topSupplier && (
              <p className="text-sm text-gray-500">{formatCurrency(kpis.topSupplier.total)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search PO, supplier, invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={gstFilter} onValueChange={setGstFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="GST Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="gst">GST</SelectItem>
                <SelectItem value="non_gst">Non-GST</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">PO Number</TableHead>
                <TableHead className="font-semibold">Supplier</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Invoice No</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
                <TableHead className="font-semibold text-right">GST</TableHead>
                <TableHead className="font-semibold">Payment</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((po) => {
                  const gstAmount = Number(po.cgst_amount) + Number(po.sgst_amount) + Number(po.igst_amount);
                  return (
                    <TableRow key={po.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-blue-600">
                        {po.po_number}
                      </TableCell>
                      <TableCell>{po.po_suppliers?.supplier_name || "-"}</TableCell>
                      <TableCell className="capitalize">{po.category}</TableCell>
                      <TableCell>{po.invoice_number || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(po.purchase_date), "dd MMM yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(po.grand_total))}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(gstAmount)}
                      </TableCell>
                      <TableCell className="capitalize">{po.payment_type}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={po.status === 'locked' ? 'default' : 'secondary'}
                          className={po.status === 'locked' ? 'bg-gray-800' : 'bg-amber-100 text-amber-800'}
                        >
                          {po.status === 'locked' ? (
                            <><Lock className="h-3 w-3 mr-1" />Locked</>
                          ) : (
                            'Draft'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleView(po)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {po.status !== 'locked' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(po)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600"
                                onClick={() => setLockConfirmId(po.id)}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setDeleteConfirmId(po.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDuplicate(po)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPO?.id ? "Edit Purchase Order" : "Create Purchase / Expense"}
            </DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            purchaseOrder={selectedPO}
            suppliers={suppliers || []}
            onClose={() => { setIsFormOpen(false); setSelectedPO(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <PurchaseOrderDetail
              purchaseOrder={selectedPO}
              onClose={() => { setIsDetailOpen(false); setSelectedPO(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The purchase order and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lock Confirmation */}
      <AlertDialog open={!!lockConfirmId} onOpenChange={() => setLockConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Once locked, financial fields become read-only and cannot be edited. Only bill re-upload will be allowed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLock}>
              Lock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PurchasesExpenses;
