import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  IndianRupee, Plus, Banknote, Trash2, Loader2, TrendingUp, Wallet, Receipt, PiggyBank, ExternalLink,
} from 'lucide-react';
import { useBatchSalaryEntries, useDeleteBatchSalary, BatchSalaryEntry } from '@/hooks/useBatchSalary';
import { useBatchSalaryAdvances } from '@/hooks/useBatchSalaryAdvances';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { RecordSalaryDialog } from './RecordSalaryDialog';
import { GiveAdvanceDialog } from './GiveAdvanceDialog';

interface StyleInfo {
  id: string;
  style_code: string;
  style_name: string;
}

interface Props {
  batchId: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
  totalCutPieces?: number;
}

export const BatchSalarySection = ({ batchId, rollsData, cuttingSummary, totalCutPieces = 0 }: Props) => {
  const navigate = useNavigate();
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);

  const { data: existingEntries = [], isLoading: loadingEntries } = useBatchSalaryEntries(batchId);
  const { data: allAdvances = [], isLoading: loadingAdvances } = useBatchSalaryAdvances(batchId);
  const deleteMutation = useDeleteBatchSalary();

  // Build style groups from rolls
  const styleGroups = useMemo(() => {
    const groups: Record<string, { styleId: string; typeIndices: number[] }> = {};
    rollsData.forEach((type, idx) => {
      const sid = type.style_id;
      if (!sid) return;
      if (!groups[sid]) groups[sid] = { styleId: sid, typeIndices: [] };
      groups[sid].typeIndices.push(idx);
    });
    return Object.values(groups);
  }, [rollsData]);

  const styleIds = styleGroups.map(g => g.styleId);

  const { data: styles = [] } = useQuery({
    queryKey: ['styles-for-salary', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase
        .from('job_styles')
        .select('id, style_code, style_name')
        .in('id', styleIds);
      if (error) throw error;
      return data as StyleInfo[];
    },
    enabled: styleIds.length > 0,
  });

  // Style options with cut pieces
  const styleOptions = useMemo(() => {
    return styleGroups.map(g => {
      const style = styles.find(s => s.id === g.styleId);
      const totalPieces = g.typeIndices.reduce((sum, idx) => sum + (cuttingSummary[idx] || 0), 0);
      return {
        id: g.styleId,
        style_code: style?.style_code || 'Unknown',
        style_name: style?.style_name || 'Unknown',
        totalCutPieces: totalPieces,
      };
    });
  }, [styleGroups, styles, cuttingSummary]);

  // Stats calculations
  const totalSalary = existingEntries.reduce((sum, e) => sum + (e.rate_per_piece * e.quantity), 0);
  const totalPaidAmount = existingEntries.reduce((sum, e) => sum + e.paid_amount, 0);
  const totalAdvances = allAdvances.reduce((sum, a) => sum + Number(a.amount), 0);
  const totalPaid = totalPaidAmount + totalAdvances;
  const totalBalance = totalSalary - totalAdvances;
  const perPieceCost = totalCutPieces > 0 ? totalSalary / totalCutPieces : 0;
  const entryCount = existingEntries.length;
  const advanceCount = allAdvances.length;

  const getStyleName = (styleId: string) => {
    const s = styles.find(st => st.id === styleId);
    return s ? s.style_code : 'Unknown';
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id, batchId });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-xs text-muted-foreground">Total Salary</div>
            <div className="text-lg font-bold">₹{totalSalary.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Banknote className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <div className="text-xs text-muted-foreground">Total Advances</div>
            <div className="text-lg font-bold text-amber-600">₹{totalAdvances.toFixed(0)}</div>
            <div className="text-[10px] text-muted-foreground">{advanceCount} txn{advanceCount !== 1 ? 's' : ''}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wallet className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <div className="text-xs text-muted-foreground">Total Paid</div>
            <div className="text-lg font-bold text-emerald-600">₹{totalPaid.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Receipt className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="text-lg font-bold text-destructive">₹{totalBalance.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-xs text-muted-foreground">Per Piece Cost</div>
            <div className="text-lg font-bold text-blue-600">₹{perPieceCost.toFixed(2)}</div>
            <div className="text-[10px] text-muted-foreground">{totalCutPieces} pcs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <PiggyBank className="h-5 w-5 mx-auto mb-1 text-violet-500" />
            <div className="text-xs text-muted-foreground">Entries</div>
            <div className="text-lg font-bold text-violet-600">{entryCount}</div>
            <div className="text-[10px] text-muted-foreground">salary records</div>
          </CardContent>
        </Card>
      </div>

      {/* Header + Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          Salary Management
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/job-management/batch/${batchId}/advances`)}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Advance History
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAdvanceDialog(true)}>
            <Banknote className="h-4 w-4 mr-1" />
            Give Advance
          </Button>
          <Button size="sm" onClick={() => setShowSalaryDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Record Salary
          </Button>
        </div>
      </div>

      {/* Recorded Entries List */}
      <Card>
        <CardContent className="p-0">
          {loadingEntries ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : existingEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IndianRupee className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No salary entries recorded yet</p>
              <p className="text-xs mt-1">Click "Record Salary" to add the first entry</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Style</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Pieces</TableHead>
                    <TableHead className="text-right">Rate (₹)</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Paid (₹)</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingEntries.map(entry => {
                    const amount = entry.rate_per_piece * entry.quantity;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {getStyleName(entry.style_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{entry.operation}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.description || '—'}</TableCell>
                        <TableCell className="text-right text-sm">{entry.quantity}</TableCell>
                        <TableCell className="text-right text-sm">₹{entry.rate_per_piece.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium text-sm">₹{amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-sm">
                          <span className="text-emerald-600 font-medium">₹{entry.paid_amount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {entry.notes || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(entry.updated_at), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advance Entries Summary */}
      {allAdvances.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-amber-500" />
              Recent Advances ({allAdvances.length})
            </h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Style</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAdvances.slice(0, 10).map(adv => (
                    <TableRow key={adv.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getStyleName(adv.style_id)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{adv.operation}</TableCell>
                      <TableCell className="text-right font-medium text-sm text-amber-600">
                        ₹{Number(adv.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(adv.advance_date), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{adv.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {allAdvances.length > 10 && (
                <div className="text-center py-2">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate(`/admin/job-management/batch/${batchId}/advances`)}
                  >
                    View all {allAdvances.length} advances →
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <RecordSalaryDialog
        open={showSalaryDialog}
        onOpenChange={setShowSalaryDialog}
        batchId={batchId}
        styles={styleOptions}
      />
      <GiveAdvanceDialog
        open={showAdvanceDialog}
        onOpenChange={setShowAdvanceDialog}
        batchId={batchId}
        styles={styleOptions}
      />
    </div>
  );
};
