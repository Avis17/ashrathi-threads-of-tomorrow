import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, Save, Loader2, Trash2, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
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
}

interface Props {
  batchId: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
}

export const BatchSalarySection = ({ batchId, rollsData, cuttingSummary }: Props) => {
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
            cmtId={style?.linked_cmt_quotation_id || null}
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

/** Build the default rows from batch operations + CMT approved rates */
function buildDefaultEntries(
  operations: string[],
  cmtOps: CMTOperation[],
  cmtApproved: CMTApprovedRates | null,
  totalPieces: number,
): LocalEntry[] {
  const entries: LocalEntry[] = [];

  operations.forEach(operation => {
    const rates = getApprovedRatesForOp(operation, cmtOps, cmtApproved);
    rates.forEach(r => {
      entries.push({
        operation,
        description: r.description,
        rate_per_piece: r.rate,
        quantity: totalPieces,
        payment_status: 'pending',
        paid_amount: 0,
        notes: '',
      });
    });
  });

  return entries;
}

function getApprovedRatesForOp(
  operation: string,
  cmtOps: CMTOperation[],
  cmtApproved: CMTApprovedRates | null,
): { rate: number; description: string }[] {
  if (!cmtApproved || !cmtOps.length) return [{ rate: 0, description: '' }];

  const machineMap: Record<string, string> = {
    'Stitching(Singer)': 'Singer',
    'Stitching(Powertable)': 'Power Table',
  };
  const categoryMap: Record<string, string> = {
    'Cutting': 'Cutting',
    'Stitching(Singer)': 'Stitching',
    'Stitching(Powertable)': 'Stitching',
    'Checking': 'Checking',
    'Ironing': 'Finishing',
    'Packing': 'Packing',
    'Maintenance': 'Special',
  };

  const category = categoryMap[operation];
  if (!category) return [{ rate: 0, description: '' }];

  const machine = machineMap[operation] || null;

  // Filter CMT operations by category + machine
  const matchingCmtOps = cmtOps.filter(op => {
    if (op.category !== category) return false;
    if (machine && op.machineType !== machine) return false;
    // For non-machine operations (Cutting, Checking, etc.), match all in that category
    if (!machine && (operation === 'Stitching(Singer)' || operation === 'Stitching(Powertable)')) return false;
    return true;
  });

  if (matchingCmtOps.length === 0) {
    // Fallback: try approved_rates array
    const approvedMatch = cmtApproved.operations.find(op => op.category === category);
    return [{ rate: approvedMatch?.rate || 0, description: '' }];
  }

  // Now find corresponding approved rates by position
  // Build a positional index: for each CMT operation in the full list, track its position within its category
  const allCategoryOps = cmtOps.filter(op => op.category === category);
  
  return matchingCmtOps.map(match => {
    const posInCategory = allCategoryOps.indexOf(match);
    // The approved_rates.operations array has one entry per CMT operation, in order
    const approvedCategoryOps = cmtApproved.operations.filter(op => op.category === category);
    const rate = approvedCategoryOps[posInCategory]?.rate ?? match.ratePerPiece;
    return { rate, description: match.description || '' };
  });
}

/** Merge existing DB entries with expected operations (keep saved, add missing) */
function mergeEntries(
  existingEntries: BatchSalaryEntry[],
  defaultEntries: LocalEntry[],
): LocalEntry[] {
  const result: LocalEntry[] = [];

  // First, add all existing entries
  existingEntries.forEach(e => {
    result.push({
      id: e.id,
      operation: e.operation,
      description: e.description,
      rate_per_piece: e.rate_per_piece,
      quantity: e.quantity,
      payment_status: e.payment_status,
      paid_amount: e.paid_amount,
      notes: e.notes || '',
    });
  });

  // Then add any default entries that don't exist yet
  defaultEntries.forEach(def => {
    const exists = existingEntries.some(
      e => e.operation === def.operation && e.description === def.description
    );
    if (!exists) {
      result.push(def);
    }
  });

  return result;
}

const StyleSalaryCard = ({
  batchId, styleId, style, cmt, cmtId, totalPieces, operations, existingEntries, colors,
}: {
  batchId: string;
  styleId: string;
  style?: StyleInfo;
  cmt?: any;
  cmtId: string | null;
  totalPieces: number;
  operations: string[];
  existingEntries: BatchSalaryEntry[];
  colors: string[];
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [localEntries, setLocalEntries] = useState<LocalEntry[]>([]);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const upsertMutation = useUpsertBatchSalary();
  const deleteMutation = useDeleteBatchSalary();

  const cmtApproved = cmt?.approved_rates as CMTApprovedRates | null;
  const cmtOps = (cmt?.operations || []) as CMTOperation[];

  // Build defaults and merge with existing — always show all operation rows
  useEffect(() => {
    const defaults = buildDefaultEntries(operations, cmtOps, cmtApproved, totalPieces);
    const merged = mergeEntries(existingEntries, defaults);
    setLocalEntries(merged);
    setInitialized(true);
  }, [existingEntries, operations.length, cmtOps.length, totalPieces]);

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

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {style?.style_code || 'Unknown'} — {style?.style_name || 'Loading...'}
                    {cmtId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/cmt-quotation/${cmtId}`);
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View CMT
                      </Button>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Colors: {colors.join(', ')} | Total Cut Pieces: {totalPieces}
                    {cmtApproved && (
                      <span className="text-primary ml-2 font-medium">
                        | Approved CMT: ₹{cmtApproved.finalCMTPerPiece}
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
                      <TableRow key={`${entry.operation}-${entry.description}-${idx}`}>
                        <TableCell className="font-medium text-sm">
                          {entry.operation}
                          {!entry.id && (
                            <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">New</Badge>
                          )}
                        </TableCell>
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
                          <span className={balance > 0 ? 'text-destructive' : 'text-primary'}>
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

            <div className="mt-4 flex justify-end gap-6 text-sm border-t pt-3">
              <div>Total: <span className="font-bold">₹{totalAmount.toFixed(2)}</span></div>
              <div>Paid: <span className="font-bold text-primary">₹{totalPaid.toFixed(2)}</span></div>
              <div>Balance: <span className="font-bold text-destructive">₹{totalBalance.toFixed(2)}</span></div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
