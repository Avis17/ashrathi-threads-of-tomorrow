import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { externalSupabase } from '@/integrations/supabase/externalClient';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Hash,
  Tag,
  Layers,
  CalendarDays,
  FileText,
  MessageSquare,
  ShieldCheck,
  Image as ImageIcon,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock; color: string }> = {
  Pending: { label: 'Pending', variant: 'outline', icon: Clock, color: 'text-amber-600' },
  Approved: { label: 'Approved', variant: 'default', icon: CheckCircle2, color: 'text-emerald-600' },
  Rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle, color: 'text-red-600' },
  Paid: { label: 'Paid', variant: 'secondary', icon: CheckCircle2, color: 'text-blue-600' },
};

async function syncBillToExpense(bill: CashRequest, adminNote: string) {
  const batchNumber = bill.batch_number || '';
  if (batchNumber.toUpperCase() === 'COMPANY' || !batchNumber) {
    const { error } = await supabase.from('company_expenses').upsert({
      cash_request_id: bill.id,
      employee_code: bill.employee_code,
      category: bill.category,
      item_name: bill.reason,
      amount: bill.amount,
      date: bill.request_date || bill.created_at,
      note: adminNote,
      batch_number: 'COMPANY',
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
        const expenseDate = bill.request_date || bill.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
        const { error } = await supabase.from('job_batch_expenses').insert({
          batch_id: batch.id,
          expense_type: bill.category,
          item_name: bill.reason,
          amount: bill.amount,
          date: expenseDate,
          cash_request_id: bill.id,
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
        date: bill.request_date || bill.created_at,
        note: adminNote,
        batch_number: batchNumber,
      }, { onConflict: 'cash_request_id' });
      if (error) throw error;
    }
  }
}

export default function BillDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const { data: bill, isLoading } = useQuery({
    queryKey: ['bill-detail', id],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from('cash_requests')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as CashRequest;
    },
    enabled: !!id,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['job-employees-for-bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_employees')
        .select('id, name, employee_type');
      if (error) throw error;
      return data || [];
    },
  });

  const employeeName = employees.find((e) => e.id === bill?.staff_id)?.name || 'Unknown';
  const employeeType = employees.find((e) => e.id === bill?.staff_id)?.employee_type || '';

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, admin_note }: { status: string; admin_note: string }) => {
      const { error } = await externalSupabase
        .from('cash_requests')
        .update({ status, admin_note })
        .eq('id', id!);
      if (error) throw error;
      if (status === 'Approved' && bill) {
        await syncBillToExpense(bill, admin_note);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['external-cash-requests'] });
      toast.success(`Bill ${actionType?.toLowerCase()} successfully`);
      setActionType(null);
      setAdminNote('');
    },
    onError: (err: any) => {
      toast.error('Failed to update: ' + err.message);
    },
  });

  const handleAction = () => {
    if (!actionType) return;
    updateStatusMutation.mutate({ status: actionType, admin_note: adminNote });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/bills')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Bills
        </Button>
        <p className="text-muted-foreground">Bill not found.</p>
      </div>
    );
  }

  const cfg = statusConfig[bill.status] || statusConfig.Pending;
  const StatusIcon = cfg.icon;
  const hasImages = bill.image_urls && bill.image_urls.length > 0 && bill.image_urls.some(u => u);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/bills')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Bill Details</h1>
            <Badge variant={cfg.variant} className="gap-1 text-sm px-3 py-1">
              <StatusIcon className="h-3.5 w-3.5" />
              {cfg.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            ID: <span className="font-mono text-xs">{bill.id}</span>
          </p>
        </div>
      </div>

      {/* Amount Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Requested Amount</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(bill.amount)}</p>
          </div>
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <IndianRupee className="h-7 w-7 text-primary" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Info */}
        <Card>
          <CardContent className="pt-5 pb-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" /> Employee Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Name" value={employeeName} />
              <InfoItem label="Employee Code" value={bill.employee_code} mono />
              {employeeType && <InfoItem label="Type" value={employeeType} />}
              <InfoItem label="Staff ID" value={bill.staff_id} mono small />
            </div>
          </CardContent>
        </Card>

        {/* Request Info */}
        <Card>
          <CardContent className="pt-5 pb-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4" /> Request Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Category" value={bill.category} badge />
              <InfoItem label="Batch Number" value={bill.batch_number || 'N/A'} badge badgeVariant="outline" />
              <InfoItem label="Status" value={bill.status} badge badgeVariant={cfg.variant} />
              <InfoItem label="Auth User ID" value={bill.auth_user_id} mono small />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardContent className="pt-5 pb-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Request Date</p>
                  <p className="font-medium">
                    {bill.request_date ? format(parseISO(bill.request_date), 'dd MMMM yyyy (EEEE)') : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted At</p>
                  <p className="font-medium">{format(new Date(bill.created_at), 'dd MMM yyyy, hh:mm:ss a')}</p>
                </div>
              </div>
              {bill.updated_at && bill.updated_at !== bill.created_at && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{format(new Date(bill.updated_at), 'dd MMM yyyy, hh:mm:ss a')}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reason & Notes */}
        <Card>
          <CardContent className="pt-5 pb-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4" /> Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{bill.reason || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{bill.notes || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Note */}
      {bill.admin_note && (
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-5 pb-4 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Admin Note
            </h3>
            <p className="text-sm whitespace-pre-wrap bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              {bill.admin_note}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Attachments
          </h3>
          {hasImages ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {bill.image_urls.filter(u => u).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg border overflow-hidden bg-muted"
                >
                  <img
                    src={url}
                    alt={`Attachment ${i + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No attachments</p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons for Pending */}
      {bill.status === 'Pending' && (
        <Card>
          <CardContent className="py-5">
            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2"
                size="lg"
                onClick={() => { setActionType('Approved'); setAdminNote(''); }}
              >
                <CheckCircle2 className="h-5 w-5" />
                Approve Bill
              </Button>
              <Button
                className="flex-1 gap-2"
                variant="destructive"
                size="lg"
                onClick={() => { setActionType('Rejected'); setAdminNote(''); }}
              >
                <XCircle className="h-5 w-5" />
                Reject Bill
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setAdminNote(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{actionType === 'Approved' ? 'Approve' : 'Reject'} Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{employeeName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{bill.employee_code}</p>
                </div>
                <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Category:</span>
                  <p>{bill.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Batch:</span>
                  <p>{bill.batch_number || 'N/A'}</p>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground text-xs">Reason:</span>
                <p>{bill.reason}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                Admin Note {actionType === 'Rejected' && <span className="text-destructive">*</span>}
              </label>
              <Textarea
                placeholder={actionType === 'Rejected' ? 'Reason for rejection (required)...' : 'Optional note...'}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionType(null); setAdminNote(''); }}>Cancel</Button>
            <Button
              variant={actionType === 'Rejected' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={updateStatusMutation.isPending || (actionType === 'Rejected' && !adminNote.trim())}
            >
              {updateStatusMutation.isPending ? 'Updating...' : `Confirm ${actionType === 'Approved' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value, mono, small, badge, badgeVariant }: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  badge?: boolean;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      {badge ? (
        <Badge variant={badgeVariant || 'secondary'}>{value}</Badge>
      ) : (
        <p className={`${mono ? 'font-mono' : 'font-medium'} ${small ? 'text-xs text-muted-foreground' : 'text-sm'}`}>
          {value}
        </p>
      )}
    </div>
  );
}
