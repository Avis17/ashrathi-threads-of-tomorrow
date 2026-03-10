import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { externalSupabase } from '@/integrations/supabase/externalClient';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  CalendarDays,
  CalendarOff,
  Sun,
  Sunset,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface LeaveRequest {
  id: string;
  staff_id: string;
  employee_code: string;
  auth_user_id: string | null;
  from_date: string;
  to_date: string;
  leave_type: string;
  reason: string | null;
  status: string;
  admin_note: string | null;
  approved_at: string | null;
  synced_absence_id: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeeInfo {
  id: string;
  name: string;
  employee_type: string;
  employee_code: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  Pending: { label: 'Pending', variant: 'outline', icon: Clock },
  Approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
};

const leaveTypeConfig: Record<string, { label: string; icon: typeof CalendarDays }> = {
  full_day: { label: 'Full Day', icon: CalendarDays },
  first_half: { label: 'First Half (AM)', icon: Sun },
  second_half: { label: 'Second Half (PM)', icon: Sunset },
};

export default function LeaveManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionLeave, setActionLeave] = useState<{ leave: LeaveRequest; action: 'Approved' | 'Rejected' } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const queryClient = useQueryClient();

  // Fetch leave requests from external project
  const { data: leaves = [], isLoading, refetch } = useQuery({
    queryKey: ['external-leave-requests'],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as LeaveRequest[];
    },
  });

  // Fetch employee names from local job_employees table
  const { data: employees = [] } = useQuery({
    queryKey: ['job-employees-for-leaves'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_employees')
        .select('id, name, employee_type, employee_code');
      if (error) throw error;
      return (data || []) as EmployeeInfo[];
    },
  });

  // Build lookup by employee_code for name resolution
  const employeeByCodeMap = useMemo(() => {
    const map: Record<string, EmployeeInfo> = {};
    employees.forEach((e) => { map[e.employee_code] = e; });
    return map;
  }, [employees]);

  const leaveEmployeeCodes = useMemo(() => [...new Set(leaves.map((l) => l.employee_code))], [leaves]);

  const filtered = useMemo(() => {
    return leaves.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (leaveTypeFilter !== 'all' && l.leave_type !== leaveTypeFilter) return false;
      if (employeeFilter !== 'all' && l.employee_code !== employeeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const empName = employeeByCodeMap[l.employee_code]?.name || '';
        return (
          (l.reason || '').toLowerCase().includes(q) ||
          l.employee_code.toLowerCase().includes(q) ||
          empName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leaves, statusFilter, leaveTypeFilter, employeeFilter, search, employeeByCodeMap]);

  const stats = useMemo(() => {
    const pending = leaves.filter((l) => l.status === 'Pending');
    const approved = leaves.filter((l) => l.status === 'Approved');
    const rejected = leaves.filter((l) => l.status === 'Rejected');
    return {
      totalCount: leaves.length,
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
    };
  }, [leaves]);

  const getEmployeeName = (staffId: string) => employeeMap[staffId]?.name || 'Unknown';

  const getLeaveTypeLabel = (type: string) => leaveTypeConfig[type]?.label || type;

  const getDateRange = (from: string, to: string, leaveType: string) => {
    const fromFormatted = format(new Date(from), 'dd MMM yyyy');
    const toFormatted = format(new Date(to), 'dd MMM yyyy');
    if (from === to) {
      return fromFormatted;
    }
    return `${fromFormatted} — ${toFormatted}`;
  };

  // Approve mutation: update external + insert local absence + sync back
  const approveMutation = useMutation({
    mutationFn: async ({ leave, note }: { leave: LeaveRequest; note: string }) => {
      // 1. Look up job_employees.id by employee_code, then find staff_members.id
      const { data: employee, error: empError } = await supabase
        .from('job_employees')
        .select('id')
        .eq('employee_code', leave.employee_code)
        .single();
      if (empError || !employee) throw new Error(`Employee with code "${leave.employee_code}" not found in this project.`);

      const { data: staffMember, error: smError } = await supabase
        .from('staff_members')
        .select('id')
        .eq('employee_id', employee.id)
        .single();
      if (smError || !staffMember) throw new Error(`Employee "${leave.employee_code}" is not registered as staff. Please add them to staff first.`);

      // 2. Insert into local staff_absences using staff_members.id
      const { data: absence, error: absError } = await supabase
        .from('staff_absences')
        .insert({
          staff_id: staffMember.id,
          from_date: leave.from_date,
          to_date: leave.to_date,
          reason: leave.reason || 'Leave approved',
          leave_type: leave.leave_type,
        })
        .select('id')
        .single();
      if (absError) throw absError;

      // 3. Update external leave_requests
      const { error: extError } = await externalSupabase
        .from('leave_requests')
        .update({
          status: 'Approved',
          admin_note: note || null,
          approved_at: new Date().toISOString(),
          synced_absence_id: absence.id,
        })
        .eq('id', leave.id);
      if (extError) throw extError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-leave-requests'] });
      toast.success('Leave approved and synced successfully');
      setActionLeave(null);
      setAdminNote('');
      setSelectedLeave(null);
    },
    onError: (err: any) => toast.error('Failed to approve: ' + err.message),
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ leave, note }: { leave: LeaveRequest; note: string }) => {
      const { error } = await externalSupabase
        .from('leave_requests')
        .update({ status: 'Rejected', admin_note: note })
        .eq('id', leave.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-leave-requests'] });
      toast.success('Leave rejected');
      setActionLeave(null);
      setAdminNote('');
      setSelectedLeave(null);
    },
    onError: (err: any) => toast.error('Failed to reject: ' + err.message),
  });

  const handleAction = () => {
    if (!actionLeave) return;
    if (actionLeave.action === 'Approved') {
      approveMutation.mutate({ leave: actionLeave.leave, note: adminNote });
    } else {
      rejectMutation.mutate({ leave: actionLeave.leave, note: adminNote });
    }
  };

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setLeaveTypeFilter('all');
    setEmployeeFilter('all');
  };

  const hasActiveFilters = search || statusFilter !== 'all' || leaveTypeFilter !== 'all' || employeeFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage staff leave requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Requests</p>
                <p className="text-2xl font-bold mt-1">{stats.totalCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingCount}</p>
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
                <p className="text-2xl font-bold mt-1">{stats.approvedCount}</p>
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
                <p className="text-2xl font-bold mt-1">{stats.rejectedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
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
                placeholder="Search name, code, reason..."
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
              </SelectContent>
            </Select>
            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_day">Full Day</SelectItem>
                <SelectItem value="first_half">First Half (AM)</SelectItem>
                <SelectItem value="second_half">Second Half (PM)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {leaveEmployeeIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {getEmployeeName(id)}
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
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {leaves.length} requests
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading leave requests...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-3" />
              <p className="font-medium">No leave requests found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((leave) => {
                  const cfg = statusConfig[leave.status] || statusConfig.Pending;
                  const StatusIcon = cfg.icon;
                  const ltCfg = leaveTypeConfig[leave.leave_type];
                  return (
                    <TableRow key={leave.id} className="group">
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(leave.created_at), 'dd MMM yyyy')}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(leave.created_at), 'hh:mm a')}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{getEmployeeName(leave.staff_id)}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{leave.employee_code}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {getDateRange(leave.from_date, leave.to_date, leave.leave_type)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1 font-normal">
                          {ltCfg && <ltCfg.icon className="h-3 w-3" />}
                          {getLeaveTypeLabel(leave.leave_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{leave.reason || '—'}</TableCell>
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
                          onClick={() => setSelectedLeave(leave)}
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
      <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="font-medium">{getEmployeeName(selectedLeave.staff_id)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employee Code</p>
                  <p className="font-mono text-sm">{selectedLeave.employee_code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">From Date</p>
                  <p className="text-sm">{format(new Date(selectedLeave.from_date), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">To Date</p>
                  <p className="text-sm">{format(new Date(selectedLeave.to_date), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Leave Type</p>
                  <Badge variant="secondary">{getLeaveTypeLabel(selectedLeave.leave_type)}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[selectedLeave.status]?.variant || 'outline'}>
                    {selectedLeave.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Applied On</p>
                  <p className="text-sm">{format(new Date(selectedLeave.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              </div>
              {selectedLeave.reason && (
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm mt-1">{selectedLeave.reason}</p>
                </div>
              )}
              {selectedLeave.admin_note && (
                <div>
                  <p className="text-xs text-muted-foreground">Admin Note</p>
                  <p className="text-sm mt-1 bg-muted p-2 rounded">{selectedLeave.admin_note}</p>
                </div>
              )}
              {selectedLeave.approved_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Approved At</p>
                  <p className="text-sm">{format(new Date(selectedLeave.approved_at), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              )}

              {selectedLeave.status === 'Pending' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    className="flex-1 gap-1"
                    variant="default"
                    onClick={() => {
                      setActionLeave({ leave: selectedLeave, action: 'Approved' });
                      setAdminNote('');
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1 gap-1"
                    variant="destructive"
                    onClick={() => {
                      setActionLeave({ leave: selectedLeave, action: 'Rejected' });
                      setAdminNote('');
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Confirmation Dialog */}
      <Dialog open={!!actionLeave} onOpenChange={() => { setActionLeave(null); setAdminNote(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionLeave?.action === 'Approved' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
          </DialogHeader>
          {actionLeave && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg space-y-1">
                <p className="text-sm"><span className="text-muted-foreground">Employee:</span> {getEmployeeName(actionLeave.leave.staff_id)}</p>
                <p className="text-sm"><span className="text-muted-foreground">Dates:</span> {getDateRange(actionLeave.leave.from_date, actionLeave.leave.to_date, actionLeave.leave.leave_type)}</p>
                <p className="text-sm"><span className="text-muted-foreground">Type:</span> {getLeaveTypeLabel(actionLeave.leave.leave_type)}</p>
                {actionLeave.leave.reason && (
                  <p className="text-sm"><span className="text-muted-foreground">Reason:</span> {actionLeave.leave.reason}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  Admin Note {actionLeave.action === 'Rejected' && <span className="text-destructive">*</span>}
                </label>
                <Textarea
                  placeholder={actionLeave.action === 'Rejected' ? 'Reason for rejection (required)...' : 'Optional note...'}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionLeave(null); setAdminNote(''); }}>
              Cancel
            </Button>
            <Button
              variant={actionLeave?.action === 'Rejected' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={isPending || (actionLeave?.action === 'Rejected' && !adminNote.trim())}
            >
              {isPending ? 'Processing...' : `Confirm ${actionLeave?.action === 'Approved' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
