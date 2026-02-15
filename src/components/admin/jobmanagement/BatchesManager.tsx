import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, Eye, Trash2, Scissors, IndianRupee, CreditCard, Briefcase, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useJobBatches, useDeleteJobBatch } from '@/hooks/useJobBatches';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import BatchForm from './BatchForm';
import { format } from 'date-fns';

const BatchesManager = () => {
  const navigate = useNavigate();
  const { data: batches, isLoading } = useJobBatches();
  const deleteBatchMutation = useDeleteJobBatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteBatchId, setDeleteBatchId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Compute overall stats
  const stats = useMemo(() => {
    if (!batches) return null;
    return {
      totalBatches: batches.length,
      totalPieces: batches.reduce((s: number, b: any) => s + (b.total_cut_pieces || 0), 0),
      totalPayments: batches.reduce((s: number, b: any) => s + (b.total_payments || 0), 0),
      totalSalary: batches.reduce((s: number, b: any) => s + (b.total_salary || 0), 0),
      totalAdvances: batches.reduce((s: number, b: any) => s + (b.total_advances || 0), 0),
      totalExpenses: batches.reduce((s: number, b: any) => s + (b.total_expenses || 0), 0),
      totalJobWork: batches.reduce((s: number, b: any) => s + (b.total_job_work || 0), 0),
    };
  }, [batches]);

  const filteredBatches = batches?.filter((batch: any) => {
    const styleNames = (batch.batch_styles || []).map((s: any) => s.style_name?.toLowerCase() || '').join(' ');
    const matchesSearch =
      batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      styleNames.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || batch.payment_status === paymentStatusFilter;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      'created': 'bg-blue-500', 'draft': 'bg-gray-500', 'in_progress': 'bg-yellow-500',
      'completed': 'bg-green-500', 'payment_pending': 'bg-orange-500', 'done': 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: any = { 'unpaid': 'bg-red-500', 'partial': 'bg-orange-500', 'paid': 'bg-green-500', 'on_hold': 'bg-gray-500' };
    return colors[status] || 'bg-gray-500';
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: any = { 'unpaid': 'Unpaid', 'partial': 'Partial', 'paid': 'Paid', 'on_hold': 'On Hold' };
    return labels[status] || status;
  };

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <Card className="p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              Batches
            </div>
            <div className="text-xl font-bold">{stats.totalBatches}</div>
          </Card>
          <Card className="p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Scissors className="h-3.5 w-3.5" />
              Total Pieces
            </div>
            <div className="text-xl font-bold">{fmt(stats.totalPieces)}</div>
          </Card>
          <Card className="p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              Collected
            </div>
            <div className="text-xl font-bold text-emerald-600">₹{fmt(stats.totalPayments)}</div>
          </Card>
          <Card className="p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IndianRupee className="h-3.5 w-3.5" />
              Salary
            </div>
            <div className="text-xl font-bold">₹{fmt(stats.totalSalary)}</div>
            <div className="text-[10px] text-muted-foreground">Adv: ₹{fmt(stats.totalAdvances)}</div>
          </Card>
          <Card className="p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Receipt className="h-3.5 w-3.5" />
              Expenses
            </div>
            <div className="text-xl font-bold">₹{fmt(stats.totalExpenses)}</div>
          </Card>
          <Card className="p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              Job Work
            </div>
            <div className="text-xl font-bold">₹{fmt(stats.totalJobWork)}</div>
          </Card>
          <Card className="p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Total Cost
            </div>
            <div className="text-xl font-bold text-destructive">
              ₹{fmt(stats.totalSalary + stats.totalExpenses + stats.totalJobWork)}
            </div>
          </Card>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="payment_pending">Payment Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Batch
        </Button>
      </div>

      {/* Batches Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Batch Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Styles</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBatches?.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-mono font-semibold text-sm">{batch.batch_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {(batch.batch_styles || []).length > 0 ? (
                          (batch.batch_styles as any[]).map((s: any, i: number) => (
                            <div key={i} className="text-sm">
                              <span className="font-medium">{s.style_name}</span>
                              <span className="text-xs text-muted-foreground ml-1">({s.style_code})</span>
                            </div>
                          ))
                        ) : (
                          <div>
                            <div className="font-medium text-sm">{batch.job_styles?.style_name || '—'}</div>
                            <div className="text-xs text-muted-foreground">{batch.job_styles?.style_code}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(batch.date_created), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-semibold">{batch.total_cut_pieces || 0} pcs</div>
                        {(batch.style_quantities || []).length > 1 && (
                          <div className="mt-0.5 space-y-0.5">
                            {(batch.style_quantities as any[]).map((sq: any, i: number) => (
                              <div key={i} className="text-[11px] text-muted-foreground">
                                {sq.style_code}: {sq.pieces} pcs
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(batch.status)} text-white`}>
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getPaymentStatusColor(batch.payment_status || 'unpaid')} text-white`}>
                        {getPaymentStatusLabel(batch.payment_status || 'unpaid')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/job-management/batch/${batch.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { setDeleteBatchId(batch.id); setDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredBatches?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No batches found</p>
        </div>
      )}

      {/* Batch Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <BatchForm onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete batch <span className="font-semibold">{batches?.find((b: any) => b.id === deleteBatchId)?.batch_number}</span> and all associated records.
              <p className="mt-2 font-semibold text-destructive">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { if (deleteBatchId) { await deleteBatchMutation.mutateAsync(deleteBatchId); setDeleteDialogOpen(false); setDeleteBatchId(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BatchesManager;
