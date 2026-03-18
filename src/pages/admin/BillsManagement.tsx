import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { externalSupabase } from '@/integrations/supabase/externalClient';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Receipt,
  AlertCircle,
  Eye,
  CalendarIcon,
  Upload,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CashRequest {
  id: string;
  staff_id: string;
  auth_user_id: string;
  category: string;
  reason: string;
  amount: number;
  image_urls: string[];
  status: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  employee_code: string;
  notes: string | null;
  batch_number: string | null;
  request_date: string;
}

interface EmployeeInfo {
  id: string;
  name: string;
  employee_type: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  Pending: { label: 'Pending', variant: 'outline', icon: Clock },
  Approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  Paid: { label: 'Paid', variant: 'secondary', icon: CheckCircle2 },
};

function mapCategoryToExpenseType(category: string): string {
  const mapping: Record<string, string> = {
    'Production': 'Production',
    'Logistics': 'Transport',
    'Maintenance': 'Maintenance',
    'Welfare': 'Welfare',
    'Packaging': 'Packaging',
    'Raw Materials': 'Raw Materials',
    'Office & Admin': 'Office & Admin',
    'Marketing & Sales': 'Marketing & Sales',
    'Equipment & Tools': 'Equipment & Tools',
    'Utilities': 'Utilities',
    'Travel & Conveyance': 'Transport',
    'Salary & Wages': 'Salary & Wages',
    'Quality Control': 'Quality Control',
    'IT & Technology': 'IT & Technology',
    'Miscellaneous': 'Other',
  };
  return mapping[category] || category;
}

async function syncBillToExpense(bill: CashRequest) {
  const batchNumber = bill.batch_number || '';
  const expenseDate = bill.request_date || bill.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
  const combinedNote = [bill.notes, bill.admin_note].filter(Boolean).join(' | Admin: ');

  if (batchNumber.toUpperCase() === 'COMPANY' || !batchNumber) {
    const { error } = await supabase.from('company_expenses').upsert({
      cash_request_id: bill.id,
      employee_code: bill.employee_code,
      category: bill.category,
      item_name: bill.reason,
      amount: bill.amount,
      date: expenseDate,
      note: combinedNote || null,
      batch_number: 'COMPANY',
      supplier_name: null,
    }, { onConflict: 'cash_request_id' });
    if (error) throw error;
  } else {
    const { data: batch } = await supabase
      .from('job_batches')
      .select('id')
      .eq('batch_number', batchNumber)
      .maybeSingle();

    if (batch) {
      const { data: existing } = await supabase
        .from('job_batch_expenses')
        .select('id')
        .eq('cash_request_id', bill.id)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from('job_batch_expenses').insert({
          batch_id: batch.id,
          expense_type: mapCategoryToExpenseType(bill.category),
          item_name: `${bill.reason}${bill.notes ? ' - ' + bill.notes : ''}`,
          amount: bill.amount,
          date: expenseDate,
          cash_request_id: bill.id,
          note: combinedNote || null,
          supplier_name: null,
        });
        if (error) throw error;
      }
    } else {
      const { error } = await supabase.from('company_expenses').upsert({
        cash_request_id: bill.id,
        employee_code: bill.employee_code,
        category: bill.category,
        item_name: bill.reason,
        amount: bill.amount,
        date: expenseDate,
        note: combinedNote || null,
        batch_number: batchNumber,
        supplier_name: null,
      }, { onConflict: 'cash_request_id' });
      if (error) throw error;
    }
  }
}

export default function BillsManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [actionBill, setActionBill] = useState<{ bill: CashRequest; action: 'Approved' | 'Rejected' } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch cash requests from external project
  const { data: bills = [], isLoading, refetch } = useQuery({
    queryKey: ['external-cash-requests'],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from('cash_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CashRequest[];
    },
  });

  // Fetch employee names from local job_employees table
  const { data: employees = [] } = useQuery({
    queryKey: ['job-employees-for-bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_employees')
        .select('id, name, employee_type');
      if (error) throw error;
      return (data || []) as EmployeeInfo[];
    },
  });

  // Build employee lookup by staff_id
  const employeeMap = useMemo(() => {
    const map: Record<string, EmployeeInfo> = {};
    employees.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [employees]);

  // Unique categories and batch numbers for filters
  const categories = useMemo(() => [...new Set(bills.map((b) => b.category))].sort(), [bills]);
  const batchNumbers = useMemo(() => [...new Set(bills.map((b) => b.batch_number).filter(Boolean))].sort() as string[], [bills]);
  const billEmployeeIds = useMemo(() => [...new Set(bills.map((b) => b.staff_id))], [bills]);

  // Filter logic
  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (employeeFilter !== 'all' && b.staff_id !== employeeFilter) return false;
      if (batchFilter !== 'all' && (b.batch_number || '') !== batchFilter) return false;
      
      // Date range filter on request_date
      if (dateFrom || dateTo) {
        const billDate = b.request_date ? parseISO(b.request_date) : new Date(b.created_at);
        if (dateFrom && billDate < startOfDay(dateFrom)) return false;
        if (dateTo && billDate > endOfDay(dateTo)) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        const empName = employeeMap[b.staff_id]?.name || '';
        return (
          b.reason.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.employee_code.toLowerCase().includes(q) ||
          empName.toLowerCase().includes(q) ||
          (b.batch_number || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bills, statusFilter, categoryFilter, employeeFilter, batchFilter, dateFrom, dateTo, search, employeeMap]);

  // Stats
  const stats = useMemo(() => {
    const total = bills.reduce((s, b) => s + b.amount, 0);
    const pending = bills.filter((b) => b.status === 'Pending');
    const approved = bills.filter((b) => b.status === 'Approved');
    const rejected = bills.filter((b) => b.status === 'Rejected');
    const paid = bills.filter((b) => b.status === 'Paid');
    return {
      totalAmount: total,
      totalCount: bills.length,
      pendingAmount: pending.reduce((s, b) => s + b.amount, 0),
      pendingCount: pending.length,
      approvedAmount: approved.reduce((s, b) => s + b.amount, 0),
      approvedCount: approved.length,
      rejectedAmount: rejected.reduce((s, b) => s + b.amount, 0),
      rejectedCount: rejected.length,
      paidAmount: paid.reduce((s, b) => s + b.amount, 0),
      paidCount: paid.length,
    };
  }, [bills]);

  const getEmployeeName = (staffId: string) => employeeMap[staffId]?.name || 'Unknown';

  // Status update mutation with expense sync
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, admin_note }: { id: string; status: string; admin_note: string }) => {
      const { error } = await externalSupabase
        .from('cash_requests')
        .update({ status, admin_note })
        .eq('id', id);
      if (error) throw error;

      // If approving, sync to expense table
      if (status === 'Approved' && actionBill) {
        await syncBillToExpense({ ...actionBill.bill, admin_note });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-cash-requests'] });
      toast.success(`Bill ${actionBill?.action?.toLowerCase()} successfully`);
      setActionBill(null);
      setAdminNote('');
    },
    onError: (err: any) => {
      toast.error('Failed to update: ' + err.message);
    },
  });

  const handleAction = () => {
    if (!actionBill) return;
    updateStatusMutation.mutate({
      id: actionBill.bill.id,
      status: actionBill.action,
      admin_note: adminNote,
    });
  };

  // Sync past approvals
  const handleSyncPastApprovals = async () => {
    setIsSyncing(true);
    try {
      const approvedBills = bills.filter((b) => b.status === 'Approved' || b.status === 'Paid');
      let synced = 0;
      let skipped = 0;
      let errors = 0;

      for (const bill of approvedBills) {
        try {
          await syncBillToExpense(bill);
          synced++;
        } catch (err: any) {
          if (err?.message?.includes('duplicate') || err?.code === '23505') {
            skipped++;
          } else {
            errors++;
            console.error('Sync error for bill', bill.id, err);
          }
        }
      }

      toast.success(`Sync complete: ${synced} synced, ${skipped} already existed, ${errors} errors`);
    } catch (err: any) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setEmployeeFilter('all');
    setBatchFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = search || statusFilter !== 'all' || categoryFilter !== 'all' || employeeFilter !== 'all' || batchFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all cash requests from staff</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncPastApprovals}
            disabled={isSyncing}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isSyncing ? 'Syncing...' : 'Sync Past Approvals'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Bills</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.totalCount} requests</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.pendingAmount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.pendingCount} requests</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.approvedAmount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.approvedCount} requests</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rejected</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.rejectedAmount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.rejectedCount} requests</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.paidAmount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.paidCount} requests</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs ml-auto">
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reason, category, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {billEmployeeIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {getEmployeeName(id)} ({bills.filter((b) => b.staff_id === id).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Second row: batch filter + date range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batchNumbers.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'dd MMM yyyy') : 'From date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'dd MMM yyyy') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {bills.length} bills
          {hasActiveFilters && (
            <span className="ml-2">
              • Filtered total: <span className="font-semibold text-foreground">{formatCurrency(filtered.reduce((s, b) => s + b.amount, 0))}</span>
            </span>
          )}
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading bills...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-3" />
              <p className="font-medium">No bills found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>Date</TableHead>
                   <TableHead>Time</TableHead>
                   <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((bill) => {
                  const cfg = statusConfig[bill.status] || statusConfig.Pending;
                  const StatusIcon = cfg.icon;
                  const displayDate = bill.request_date || bill.created_at;
                  return (
                    <TableRow key={bill.id} className="group">
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(displayDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(bill.created_at), 'hh:mm a')}
                      </TableCell>
                      <TableCell className="font-medium">{getEmployeeName(bill.staff_id)}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{bill.employee_code}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-xs">
                          {bill.batch_number || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{bill.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{bill.reason}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(bill.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/admin/bills/${bill.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>


      {/* Approve/Reject Confirmation Dialog */}
      <Dialog open={!!actionBill} onOpenChange={() => { setActionBill(null); setAdminNote(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionBill?.action === 'Approved' ? 'Approve' : 'Reject'} Bill
            </DialogTitle>
          </DialogHeader>
          {actionBill && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{getEmployeeName(actionBill.bill.staff_id)}</p>
                    <p className="text-xs text-muted-foreground font-mono">{actionBill.bill.employee_code}</p>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(actionBill.bill.amount)}</p>
                </div>
                <div className="border-t pt-2 mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Category:</span>
                    <p>{actionBill.bill.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Batch:</span>
                    <p>{actionBill.bill.batch_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Request Date:</span>
                    <p>{actionBill.bill.request_date ? format(parseISO(actionBill.bill.request_date), 'dd MMM yyyy') : '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Submitted:</span>
                    <p>{format(new Date(actionBill.bill.created_at), 'dd MMM, hh:mm a')}</p>
                  </div>
                </div>
                {actionBill.bill.reason && (
                  <div className="border-t pt-2 mt-1">
                    <span className="text-muted-foreground text-xs">Reason:</span>
                    <p className="text-sm whitespace-pre-wrap">{actionBill.bill.reason}</p>
                  </div>
                )}
                {actionBill.bill.image_urls && actionBill.bill.image_urls.length > 0 && actionBill.bill.image_urls[0] !== '' && (
                  <div className="border-t pt-2 mt-1">
                    <span className="text-muted-foreground text-xs">Attachments:</span>
                    <div className="flex gap-2 mt-1">
                      {actionBill.bill.image_urls.filter(u => u).map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Attachment ${i + 1}`} className="h-14 w-14 rounded border object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  Admin Note {actionBill.action === 'Rejected' && <span className="text-destructive">*</span>}
                </label>
                <Textarea
                  placeholder={actionBill.action === 'Rejected' ? 'Reason for rejection (required)...' : 'Optional note...'}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionBill(null); setAdminNote(''); }}>
              Cancel
            </Button>
            <Button
              variant={actionBill?.action === 'Rejected' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={updateStatusMutation.isPending || (actionBill?.action === 'Rejected' && !adminNote.trim())}
            >
              {updateStatusMutation.isPending ? 'Updating...' : `Confirm ${actionBill?.action === 'Approved' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
