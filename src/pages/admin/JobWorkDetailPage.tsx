import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Truck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobWorkOperations, useUpdateJobWork } from '@/hooks/useJobWorks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { BatchJobWork } from '@/hooks/useJobWorks';

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-300' },
  { value: 'partial', label: 'Partial', color: 'bg-blue-500/10 text-blue-700 border-blue-300' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500/10 text-green-700 border-green-300' },
];

const JobWorkDetailPage = () => {
  const { id: batchId, jwId } = useParams<{ id: string; jwId: string }>();
  const navigate = useNavigate();
  const updateMutation = useUpdateJobWork();

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

  const variations = (jobWork.variations || []) as Array<{ type_index: number; style_id: string; color: string; pieces: number }>;
  const totalOperationAmount = operations.reduce((s, op) => s + (op.rate_per_piece * op.quantity), 0);
  const pricePerPiece = jobWork.pieces > 0 ? totalOperationAmount / jobWork.pieces : 0;
  const profitPerPiece = jobWork.company_profit || 0;
  const profitPercent = pricePerPiece > 0 ? (profitPerPiece / pricePerPiece) * 100 : 0;

  const handleStatusChange = async (status: string) => {
    await updateMutation.mutateAsync({ id: jobWork.id, data: { payment_status: status } });
  };

  const handleCreateDC = () => {
    // Map operations to DC purposes
    const opToPurpose: Record<string, string> = {
      'Cutting': 'cutting',
      'Stitching(Singer)': 'stitching',
      'Stitching(Powertable)': 'stitching',
      'Checking': 'checking',
      'Ironing': 'ironing',
      'Packing': 'packing',
    };
    const purposes = [...new Set(operations.map(op => opToPurpose[op.operation]).filter(Boolean))];

    // Build items from variations
    const items = variations.map(v => {
      const style = styles.find(s => s.id === v.style_id);
      return {
        product_name: style?.style_name || style?.style_code || 'Unknown',
        color: v.color,
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

  const currentStatus = PAYMENT_STATUSES.find(s => s.value === jobWork.payment_status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-3">
          <Select value={jobWork.payment_status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <Badge className={s.color} variant="outline">{s.label}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleCreateDC}>
            <Truck className="h-4 w-4 mr-2" />
            Create DC
          </Button>
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
                    <TableCell className="text-right">{v.pieces}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">{jobWork.pieces}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operations</CardTitle>
        </CardHeader>
        <CardContent>
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
