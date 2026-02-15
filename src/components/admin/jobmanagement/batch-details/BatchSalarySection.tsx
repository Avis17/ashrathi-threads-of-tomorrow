import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { IndianRupee, Save, Loader2, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBatchSalaryEntries, useUpsertBatchSalary, useDeleteBatchSalary, BatchSalaryEntry } from '@/hooks/useBatchSalary';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface StyleInfo {
  id: string;
  style_code: string;
  style_name: string;
  linked_cmt_quotation_id: string | null;
}

interface CMTApprovedRates {
  operations: Array<{ category: string; rate: number }>;
  finishingPackingCost: number;
  overheadsCost: number;
  companyProfitPercent: number;
  finalCMTPerPiece: number;
}

interface CMTOperation {
  id: string;
  category: string;
  description: string;
  machineType: string;
  ratePerPiece: number;
  amount: number;
}

interface LocalEntry {
  id?: string;
  operation: string;
  description: string;
  rate_per_piece: number;
  quantity: number;
  payment_status: string;
  paid_amount: number;
  notes: string;
  isNew?: boolean;
}

interface Props {
  batchId: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
}

export const BatchSalarySection = ({ batchId, rollsData, cuttingSummary }: Props) => {
  // Group rolls by style_id
  const styleGroups = useMemo(() => {
    const groups: Record<string, { styleId: string; typeIndices: number[]; colors: string[] }> = {};
    rollsData.forEach((type, idx) => {
      const sid = type.style_id;
      if (!sid) return;
      if (!groups[sid]) {
        groups[sid] = { styleId: sid, typeIndices: [], colors: [] };
      }
      groups[sid].typeIndices.push(idx);
      groups[sid].colors.push(type.color || `Type ${idx + 1}`);
    });
    return Object.values(groups);
  }, [rollsData]);

  const styleIds = styleGroups.map(g => g.styleId);

  // Fetch style info
  const { data: styles } = useQuery({
    queryKey: ['styles-for-salary', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase
        .from('job_styles')
        .select('id, style_code, style_name, linked_cmt_quotation_id')
        .in('id', styleIds);
      if (error) throw error;
      return data as StyleInfo[];
    },
    enabled: styleIds.length > 0,
  });

  // Fetch CMT quotations for styles
  const cmtIds = (styles || []).map(s => s.linked_cmt_quotation_id).filter(Boolean) as string[];
  const { data: cmtQuotations } = useQuery({
    queryKey: ['cmt-for-salary', cmtIds],
    queryFn: async () => {
      if (cmtIds.length === 0) return [];
      const { data, error } = await supabase
        .from('cmt_quotations')
        .select('id, approved_rates, operations, status')
        .in('id', cmtIds);
      if (error) throw error;
      return data;
    },
    enabled: cmtIds.length > 0,
  });

  const { data: existingEntries } = useBatchSalaryEntries(batchId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          Salary Management
        </h3>
      </div>

      {styleGroups.map(group => {
        const style = styles?.find(s => s.id === group.styleId);
        const cmt = cmtQuotations?.find(c => c.id === style?.linked_cmt_quotation_id);
        const totalPieces = group.typeIndices.reduce((sum, idx) => sum + (cuttingSummary[idx] || 0), 0);
        const operations = Array.from(new Set(
          group.typeIndices.flatMap(idx => rollsData[idx]?.operations || [])
        ));

        return (
          <StyleSalaryCard
            key={group.styleId}
            batchId={batchId}
            styleId={group.styleId}
            style={style}
            cmt={cmt}
            totalPieces={totalPieces}
            operations={operations}
            existingEntries={(existingEntries || []).filter(e => e.style_id === group.styleId)}
            colors={group.colors}
          />
        );
      })}
    </div>
  );
};

const StyleSalaryCard = ({
  batchId, styleId, style, cmt, totalPieces, operations, existingEntries, colors,
}: {
  batchId: string;
  styleId: string;
  style?: StyleInfo;
  cmt?: any;
  totalPieces: number;
  operations: string[];
  existingEntries: BatchSalaryEntry[];
  colors: string[];
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [localEntries, setLocalEntries] = useState<LocalEntry[]>([]);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const upsertMutation = useUpsertBatchSalary();
  const deleteMutation = useDeleteBatchSalary();

  // Get approved CMT operations
  const cmtApproved = cmt?.approved_rates as CMTApprovedRates | null;
  const cmtOps = (cmt?.operations || []) as CMTOperation[];

  // Map batch operations to CMT rates
  const getApprovedRate = (operation: string): { rate: number; description: string }[] => {
    if (!cmtApproved || !cmtOps.length) return [{ rate: 0, description: '' }];

    // Map batch operation names to CMT categories
    const categoryMap: Record<string, string[]> = {
      'Cutting': ['Cutting'],
      'Stitching(Singer)': ['Stitching'],
      'Stitching(Powertable)': ['Stitching'],
      'Checking': ['Checking'],
      'Ironing': ['Finishing'],
      'Packing': ['Packing'],
      'Maintenance': ['Special'],
    };

    const machineFilter: Record<string, string | null> = {
      'Stitching(Singer)': 'Singer',
      'Stitching(Powertable)': 'Power Table',
    };

    const cats = categoryMap[operation] || [];
    const machineReq = machineFilter[operation] || null;

    // Find matching CMT operations
    const matches = cmtOps.filter(op => {
      if (!cats.includes(op.category)) return false;
      if (machineReq && op.machineType !== machineReq) return false;
      if (!machineReq && operation !== 'Cutting' && operation !== 'Checking') return false;
      return true;
    });

    if (matches.length === 0) {
      // Try from approved_rates
      const approvedIdx = cmtApproved.operations.findIndex(
        op => cats.includes(op.category)
      );
      if (approvedIdx >= 0) {
        return [{ rate: cmtApproved.operations[approvedIdx].rate, description: '' }];
      }
      return [{ rate: 0, description: '' }];
    }

    // Use approved rates (which override the original CMT operation amounts)
    // Map each CMT operation to its approved rate
    return matches.map((match, i) => {
      // Find corresponding approved rate by matching position
      const approvedOps = cmtApproved.operations.filter(
        op => cats.includes(op.category)
      );
      // For stitching with machine filter, narrow down
      let rate = match.ratePerPiece;
      if (machineReq === 'Singer') {
        const singerOps = cmtOps.filter(o => cats.includes(o.category) && o.machineType === 'Singer');
        const singerIdx = singerOps.indexOf(match);
        const approvedSinger = approvedOps.filter((_, ai) => {
          const origOp = cmtOps.filter(o => cats.includes(o.category));
          return origOp[ai]?.machineType === 'Singer';
        });
        if (approvedSinger[singerIdx]) rate = approvedSinger[singerIdx].rate;
      } else if (machineReq === 'Power Table') {
        const ptOps = cmtOps.filter(o => cats.includes(o.category) && o.machineType === 'Power Table');
        const ptIdx = ptOps.indexOf(match);
        const approvedPT = approvedOps.filter((_, ai) => {
          const origOp = cmtOps.filter(o => cats.includes(o.category));
          return origOp[ai]?.machineType === 'Power Table';
        });
        if (approvedPT[ptIdx]) rate = approvedPT[ptIdx].rate;
      } else {
        if (approvedOps[i]) rate = approvedOps[i].rate;
      }

      return { rate, description: match.description || '' };
    });
  };

  // Initialize local entries from existing or generate from operations
  useEffect(() => {
    if (existingEntries.length > 0) {
      setLocalEntries(existingEntries.map(e => ({
        id: e.id,
        operation: e.operation,
        description: e.description,
        rate_per_piece: e.rate_per_piece,
        quantity: e.quantity,
        payment_status: e.payment_status,
        paid_amount: e.paid_amount,
        notes: e.notes || '',
      })));
    } else {
      // Auto-generate from operations with CMT rates
      const entries: LocalEntry[] = [];
      operations.forEach(op => {
        const rates = getApprovedRate(op);
        rates.forEach(r => {
          entries.push({
            operation: op,
            description: r.description,
            rate_per_piece: r.rate,
            quantity: totalPieces,
            payment_status: 'pending',
            paid_amount: 0,
            notes: '',
            isNew: true,
          });
        });
      });
      setLocalEntries(entries);
    }
  }, [existingEntries.length, operations.length]);

  const updateEntry = (idx: number, field: keyof LocalEntry, value: any) => {
    setLocalEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleSave = async (idx: number) => {
    const entry = localEntries[idx];
    setSavingIdx(idx);
    try {
      await upsertMutation.mutateAsync({
        id: entry.id,
        batch_id: batchId,
        style_id: styleId,
        operation: entry.operation,
        description: entry.description,
        rate_per_piece: entry.rate_per_piece,
        quantity: entry.quantity,
        payment_status: entry.payment_status,
        paid_amount: entry.paid_amount,
        notes: entry.notes,
      });
    } finally {
      setSavingIdx(null);
    }
  };

  const handleDelete = async (idx: number) => {
    const entry = localEntries[idx];
    if (entry.id) {
      await deleteMutation.mutateAsync({ id: entry.id, batchId });
    }
    setLocalEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const totalAmount = localEntries.reduce((sum, e) => sum + (e.rate_per_piece * e.quantity), 0);
  const totalPaid = localEntries.reduce((sum, e) => sum + e.paid_amount, 0);
  const totalBalance = totalAmount - totalPaid;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500/10 text-green-600 border-green-200">Paid</Badge>;
      case 'partial': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Partial</Badge>;
      default: return <Badge className="bg-red-500/10 text-red-600 border-red-200">Pending</Badge>;
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div>
                  <CardTitle className="text-base">
                    {style?.style_code || 'Unknown'} — {style?.style_name || 'Loading...'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Colors: {colors.join(', ')} | Total Cut Pieces: {totalPieces}
                    {cmtApproved && (
                      <span className="text-green-600 ml-2">
                        | CMT Rate: ₹{cmtApproved.finalCMTPerPiece}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="font-semibold">₹{totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    Paid: ₹{totalPaid.toFixed(2)} | Bal: ₹{totalBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Operation</TableHead>
                    <TableHead className="w-[140px]">Description</TableHead>
                    <TableHead className="w-[100px] text-right">Rate/Pc (₹)</TableHead>
                    <TableHead className="w-[100px] text-right">Quantity</TableHead>
                    <TableHead className="w-[110px] text-right">Amount (₹)</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="w-[100px] text-right">Paid (₹)</TableHead>
                    <TableHead className="w-[90px] text-right">Balance (₹)</TableHead>
                    <TableHead className="w-[140px]">Notes</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localEntries.map((entry, idx) => {
                    const amount = entry.rate_per_piece * entry.quantity;
                    const balance = amount - entry.paid_amount;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-sm">{entry.operation}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.description || '—'}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={entry.rate_per_piece}
                            onChange={e => updateEntry(idx, 'rate_per_piece', parseFloat(e.target.value) || 0)}
                            className="h-8 w-20 text-right text-sm"
                            step="0.5"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={entry.quantity}
                            onChange={e => updateEntry(idx, 'quantity', parseInt(e.target.value) || 0)}
                            className="h-8 w-20 text-right text-sm"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">₹{amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Select
                            value={entry.payment_status}
                            onValueChange={v => updateEntry(idx, 'payment_status', v)}
                          >
                            <SelectTrigger className="h-8 w-[100px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={entry.paid_amount}
                            onChange={e => updateEntry(idx, 'paid_amount', parseFloat(e.target.value) || 0)}
                            className="h-8 w-20 text-right text-sm"
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                            ₹{balance.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={entry.notes}
                            onChange={e => updateEntry(idx, 'notes', e.target.value)}
                            className="h-8 text-xs"
                            placeholder="Notes..."
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleSave(idx)}
                              disabled={savingIdx === idx}
                            >
                              {savingIdx === idx ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDelete(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Summary row */}
            <div className="mt-4 flex justify-end gap-6 text-sm border-t pt-3">
              <div>Total: <span className="font-bold">₹{totalAmount.toFixed(2)}</span></div>
              <div>Paid: <span className="font-bold text-green-600">₹{totalPaid.toFixed(2)}</span></div>
              <div>Balance: <span className="font-bold text-red-600">₹{totalBalance.toFixed(2)}</span></div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
