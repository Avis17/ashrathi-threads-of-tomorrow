import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Truck, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useJobWorkOperations, useUpdateJobWork } from '@/hooks/useJobWorks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { BatchJobWork } from '@/hooks/useJobWorks';

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-300' },
  { value: 'partial', label: 'Partial', color: 'bg-blue-500/10 text-blue-700 border-blue-300' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500/10 text-green-700 border-green-300' },
];

const WORK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-500/10 text-gray-700 border-gray-300' },
  { value: 'started', label: 'Started', color: 'bg-blue-500/10 text-blue-700 border-blue-300' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-500/10 text-amber-700 border-amber-300' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/10 text-green-700 border-green-300' },
];

const JOB_WORK_OPERATIONS = [
  'Cutting', 'Stitching(Singer)', 'Stitching(Powertable)', 'Checking', 'Ironing', 'Packing',
] as const;

interface EditableOp {
  id?: string;
  operation: string;
  rate_per_piece: number;
  quantity: number;
  notes: string;
  isNew?: boolean;
}

const JobWorkDetailPage = () => {
  const { id: batchId, jwId } = useParams<{ id: string; jwId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateJobWork();
  const [editingOps, setEditingOps] = useState<EditableOp[] | null>(null);
  const [savingOps, setSavingOps] = useState(false);

  const { data: jobWork, isLoading } = useQuery({
    queryKey: ['job-work-detail', jwId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_job_works')
        .select('*')
        .eq('id', jwId!)
        .single();
      if (error) throw error;
      return data as BatchJobWork;
    },
    enabled: !!jwId,
  });

  const { data: operations = [] } = useJobWorkOperations(jwId);

  const { data: styles = [] } = useQuery({
    queryKey: ['jw-styles', jobWork?.variations],
    queryFn: async () => {
      const variations = (jobWork?.variations || []) as Array<{ style_id: string }>;
      const ids = [...new Set(variations.map(v => v.style_id).filter(Boolean))];
      if (ids.length === 0) return [];
      const { data, error } = await supabase.from('job_styles').select('id, style_code, style_name').in('id', ids);
      if (error) throw error;
      return data;
    },
    enabled: !!jobWork,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!jobWork) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job Work not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(`/admin/job-management/batch/${batchId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const variations = (jobWork.variations || []) as Array<{ type_index: number; style_id: string; color: string; pieces: number; sizes?: string }>;
  const totalOperationAmount = operations.reduce((s, op) => s + (op.rate_per_piece * op.quantity), 0);
  const pricePerPiece = jobWork.pieces > 0 ? totalOperationAmount / jobWork.pieces : 0;
  const profitPerPiece = jobWork.company_profit || 0;
  const profitPercent = pricePerPiece > 0 ? (profitPerPiece / pricePerPiece) * 100 : 0;

  const handleStatusChange = async (status: string) => {
    await updateMutation.mutateAsync({ id: jobWork.id, data: { payment_status: status } });
    queryClient.invalidateQueries({ queryKey: ['job-work-detail', jwId] });
  };

  const handleWorkStatusChange = async (status: string) => {
    await updateMutation.mutateAsync({ id: jobWork.id, data: { work_status: status } });
    queryClient.invalidateQueries({ queryKey: ['job-work-detail', jwId] });
  };

  const handleCreateDC = () => {
    const opToPurpose: Record<string, string> = {
      'Cutting': 'cutting',
      'Stitching(Singer)': 'stitching',
      'Stitching(Powertable)': 'stitching',
      'Checking': 'checking',
      'Ironing': 'ironing',
      'Packing': 'packing',
    };
    const purposes = [...new Set(operations.map(op => opToPurpose[op.operation]).filter(Boolean))];

    const items = variations.map(v => {
      const style = styles.find(s => s.id === v.style_id);
      return {
        product_name: style?.style_name || style?.style_code || 'Unknown',
        color: v.color,
        size: v.sizes || '',
        quantity: v.pieces,
      };
    });

    const params = new URLSearchParams({
      prefill: JSON.stringify({
        job_worker_name: jobWork.company_name,
        dc_type: 'job_work',
        job_work_direction: 'given',
        purpose: purposes[0] || 'stitching',
        purposes,
        items,
      }),
    });

    navigate(`/admin/delivery-challan/create?${params.toString()}`);
  };

  // Operations editing
  const startEditOps = () => {
    setEditingOps(operations.map(op => ({
      id: op.id,
      operation: op.operation,
      rate_per_piece: op.rate_per_piece,
      quantity: op.quantity,
      notes: op.notes || '',
    })));
  };

  const addNewOp = () => {
    setEditingOps(prev => [...(prev || []), {
      operation: '',
      rate_per_piece: 0,
      quantity: jobWork.pieces,
      notes: '',
      isNew: true,
    }]);
  };

  const removeEditOp = (idx: number) => {
    setEditingOps(prev => prev?.filter((_, i) => i !== idx) || null);
  };

  const updateEditOp = (idx: number, field: string, value: any) => {
    setEditingOps(prev => prev?.map((op, i) => i === idx ? { ...op, [field]: value } : op) || null);
  };

  const saveOps = async () => {
    if (!editingOps || !jwId) return;
    setSavingOps(true);
    try {
      // Delete existing operations
      await supabase.from('batch_job_work_operations').delete().eq('job_work_id', jwId);
      // Insert all
      const opsData = editingOps.filter(op => op.operation).map(op => ({
        job_work_id: jwId,
        operation: op.operation,
        rate_per_piece: op.rate_per_piece,
        quantity: op.quantity,
        notes: op.notes || null,
      }));
      if (opsData.length > 0) {
        const { error } = await supabase.from('batch_job_work_operations').insert(opsData);
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ['job-work-operations', jwId] });
      queryClient.invalidateQueries({ queryKey: ['job-work-detail', jwId] });
      queryClient.invalidateQueries({ queryKey: ['batch-job-works'] });
      setEditingOps(null);
      toast.success('Operations updated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update operations');
    } finally {
      setSavingOps(false);
    }
  };

  const currentWorkStatus = WORK_STATUSES.find(s => s.value === (jobWork.work_status || 'pending'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/job-management/batch/${batchId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              {jobWork.company_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Job Work · {format(new Date(jobWork.created_at), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <Label className="text-xs text-muted-foreground">Work Status</Label>
            <Select value={jobWork.work_status || 'pending'} onValueChange={handleWorkStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    <Badge className={s.color} variant="outline">{s.label}</Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Payment</Label>
            <Select value={jobWork.payment_status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    <Badge className={s.color} variant="outline">{s.label}</Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4">
            <Button variant="outline" onClick={handleCreateDC}>
              <Truck className="h-4 w-4 mr-2" />
              Create DC
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Pieces</div>
            <div className="text-2xl font-bold text-indigo-600">{jobWork.pieces}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-2xl font-bold text-green-600">₹{jobWork.total_amount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Price / Piece</div>
            <div className="text-2xl font-bold text-blue-600">₹{pricePerPiece.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Profit / Piece</div>
            <div className="text-2xl font-bold text-purple-600">₹{profitPerPiece.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">{profitPercent.toFixed(1)}% of price/pc</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Balance</div>
            <div className="text-2xl font-bold text-orange-600">₹{jobWork.balance_amount.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Paid: ₹{jobWork.paid_amount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Variations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Style & Color Variations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Style</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Sizes</TableHead>
                <TableHead className="text-right">Pieces</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variations.map((v, i) => {
                const style = styles.find(s => s.id === v.style_id);
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{style?.style_code || 'Unknown'} - {style?.style_name || ''}</TableCell>
                    <TableCell>{v.color}</TableCell>
                    <TableCell>{v.sizes || '-'}</TableCell>
                    <TableCell className="text-right">{v.pieces}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">{jobWork.pieces}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Operations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Operations</CardTitle>
          {editingOps === null ? (
            <Button variant="outline" size="sm" onClick={startEditOps}>
              Edit Operations
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addNewOp}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
              <Button size="sm" onClick={saveOps} disabled={savingOps}>
                <Save className="h-4 w-4 mr-1" /> {savingOps ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingOps(null)}>Cancel</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {editingOps !== null ? (
            <div className="space-y-3">
              {editingOps.map((op, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs">Operation *</Label>
                      <Select value={op.operation} onValueChange={v => updateEditOp(idx, 'operation', v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {JOB_WORK_OPERATIONS.map(o => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Rate/Pc (₹)</Label>
                      <Input type="number" step="0.5" value={op.rate_per_piece} onChange={e => updateEditOp(idx, 'rate_per_piece', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input type="number" value={op.quantity} onChange={e => updateEditOp(idx, 'quantity', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Notes</Label>
                      <Input placeholder="Notes" value={op.notes} onChange={e => updateEditOp(idx, 'notes', e.target.value)} />
                    </div>
                    <div className="text-sm font-semibold whitespace-nowrap">= ₹{(op.rate_per_piece * op.quantity).toFixed(2)}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeEditOp(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operation</TableHead>
                  <TableHead className="text-right">Rate/Pc</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map(op => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium">{op.operation}</TableCell>
                    <TableCell className="text-right">₹{op.rate_per_piece.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{op.quantity}</TableCell>
                    <TableCell className="text-right font-semibold">₹{(op.rate_per_piece * op.quantity).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{op.notes || '-'}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={3} className="font-semibold">Operations Total</TableCell>
                  <TableCell className="text-right font-bold">₹{totalOperationAmount.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={3} className="font-semibold">Company Profit ({profitPercent.toFixed(1)}%)</TableCell>
                  <TableCell className="text-right font-bold">₹{(profitPerPiece * jobWork.pieces).toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {jobWork.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{jobWork.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobWorkDetailPage;
