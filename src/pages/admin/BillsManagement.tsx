import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { externalSupabase } from '@/integrations/supabase/externalClient';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
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

export default function BillsManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState<CashRequest | null>(null);
  const [actionBill, setActionBill] = useState<{ bill: CashRequest; action: 'Approved' | 'Rejected' } | null>(null);
  const [adminNote, setAdminNote] = useState('');
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

  // Unique categories for filter
  const categories = useMemo(() => [...new Set(bills.map((b) => b.category))].sort(), [bills]);

  // Unique employees who have bills
  const billEmployeeIds = useMemo(() => [...new Set(bills.map((b) => b.staff_id))], [bills]);

  // Filter logic
  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (employeeFilter !== 'all' && b.staff_id !== employeeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const empName = employeeMap[b.staff_id]?.name || '';
        return (
          b.reason.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.employee_code.toLowerCase().includes(q) ||
          empName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bills, statusFilter, categoryFilter, employeeFilter, search, employeeMap]);

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

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setEmployeeFilter('all');
  };

  const hasActiveFilters = search || statusFilter !== 'all' || categoryFilter !== 'all' || employeeFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all cash requests from staff</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
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
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
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
                  return (
                    <TableRow key={bill.id} className="group">
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(bill.created_at), 'dd MMM yyyy')}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(bill.created_at), 'hh:mm a')}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{getEmployeeName(bill.staff_id)}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{bill.employee_code}</TableCell>
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
                          onClick={() => setSelectedBill(bill)}
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="font-medium">{getEmployeeName(selectedBill.staff_id)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employee Code</p>
                  <p className="font-mono text-sm">{selectedBill.employee_code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="secondary">{selectedBill.category}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[selectedBill.status]?.variant || 'outline'}>
                    {selectedBill.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedBill.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm">{format(new Date(selectedBill.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm mt-1">{selectedBill.reason}</p>
              </div>
              {selectedBill.admin_note && (
                <div>
                  <p className="text-xs text-muted-foreground">Admin Note</p>
                  <p className="text-sm mt-1 bg-muted p-2 rounded">{selectedBill.admin_note}</p>
                </div>
              )}
              {selectedBill.image_urls && selectedBill.image_urls.length > 0 && selectedBill.image_urls[0] !== '' && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Attachments</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedBill.image_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="Bill attachment" className="h-20 w-20 rounded border object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
