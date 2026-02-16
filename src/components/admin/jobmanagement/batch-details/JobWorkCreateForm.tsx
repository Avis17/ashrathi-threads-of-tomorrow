import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateJobWork } from '@/hooks/useJobWorks';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AddWorkerDialog } from './AddWorkerDialog';

const JOB_WORK_OPERATIONS = [
  'Cutting',
  'Stitching(Singer)',
  'Stitching(Powertable)',
  'Checking',
  'Ironing',
  'Accessories',
  'Packing',
] as const;

interface Props {
  batchId: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedVariation {
  index: number;
  styleId: string;
  color: string;
  pieces: number;
  label: string;
  sizes: string;
}

interface OperationRow {
  operation: string;
  rate_per_piece: number;
  quantity: number;
  notes: string;
}

export const JobWorkCreateForm = ({ batchId, rollsData, cuttingSummary, open, onOpenChange }: Props) => {
  const [selectedVariations, setSelectedVariations] = useState<SelectedVariation[]>([]);
  const [companyId, setCompanyId] = useState<string>('');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [notes, setNotes] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [companyProfitPercent, setCompanyProfitPercent] = useState('0');
  const [operations, setOperations] = useState<OperationRow[]>([
    { operation: '', rate_per_piece: 0, quantity: 0, notes: '' },
  ]);

  const createMutation = useCreateJobWork();

  // Fetch external_job_companies
  const { data: externalCompanies = [] } = useQuery({
    queryKey: ['external-job-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_companies')
        .select('id, company_name')
        .eq('is_active', true)
        .order('company_name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch unique job worker names from delivery_challans + job_workers
  const { data: jobWorkerNames = [] } = useQuery({
    queryKey: ['job-worker-companies'],
    queryFn: async () => {
      const [dcRes, jwRes] = await Promise.all([
        supabase.from('delivery_challans').select('job_worker_name').order('job_worker_name'),
        supabase.from('job_workers').select('name').eq('is_active', true).order('name'),
      ]);
      if (dcRes.error) throw dcRes.error;
      if (jwRes.error) throw jwRes.error;
      const names = new Set<string>();
      dcRes.data.forEach(d => { if (d.job_worker_name) names.add(d.job_worker_name); });
      jwRes.data.forEach(w => { if (w.name) names.add(w.name); });
      return [...names].sort();
    },
  });

  // Merge companies: external + job workers (deduplicated)
  const allCompanies = useMemo((): Array<{ id: string; name: string; source: string }> => {
    const externalNames = new Set(externalCompanies.map(c => c.company_name.toLowerCase()));
    const merged: Array<{ id: string; name: string; source: string }> = externalCompanies.map(c => ({ id: c.id, name: c.company_name, source: 'external' }));
    jobWorkerNames.forEach(name => {
      if (!externalNames.has(name.toLowerCase())) {
        merged.push({ id: `jw_${name}`, name, source: 'job_worker' });
      }
    });
    return merged.sort((a, b) => a.name.localeCompare(b.name));
  }, [externalCompanies, jobWorkerNames]);

  // Fetch styles for the batch
  const styleIds = useMemo(() => {
    return [...new Set(rollsData.map(r => r.style_id).filter(Boolean))] as string[];
  }, [rollsData]);

  const { data: styles = [] } = useQuery({
    queryKey: ['styles-for-jobwork', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase
        .from('job_styles')
        .select('id, style_code, style_name')
        .in('id', styleIds);
      if (error) throw error;
      return data;
    },
    enabled: styleIds.length > 0,
  });

  // Build type options with style + color
  const typeOptions = useMemo(() => {
    return rollsData.map((type, idx) => {
      const style = styles.find(s => s.id === type.style_id);
      const pieces = cuttingSummary[idx] || 0;
      return {
        index: idx,
        label: `${style?.style_code || 'Unknown'} - ${type.color || `Type ${idx + 1}`} (${pieces} pcs)`,
        styleId: type.style_id || '',
        color: type.color || `Type ${idx + 1}`,
        pieces,
      };
    });
  }, [rollsData, styles, cuttingSummary]);

  // Available options (exclude already selected)
  const availableOptions = useMemo(() => {
    const selectedIndices = new Set(selectedVariations.map(v => v.index));
    return typeOptions.filter(opt => !selectedIndices.has(opt.index));
  }, [typeOptions, selectedVariations]);

  // Total pieces from all selected variations
  const totalPieces = useMemo(() => {
    return selectedVariations.reduce((sum, v) => sum + v.pieces, 0);
  }, [selectedVariations]);

  // Auto-update operation quantities when total pieces changes
  useEffect(() => {
    if (totalPieces > 0) {
      setOperations(prev => prev.map(op => ({
        ...op,
        quantity: totalPieces,
      })));
    }
  }, [totalPieces]);

  const addVariation = (indexStr: string) => {
    const opt = typeOptions.find(t => t.index.toString() === indexStr);
    if (opt) {
      setSelectedVariations(prev => [...prev, {
        index: opt.index,
        styleId: opt.styleId,
        color: opt.color,
        pieces: opt.pieces,
        label: opt.label,
        sizes: '',
      }]);
    }
  };

  const removeVariation = (index: number) => {
    setSelectedVariations(prev => prev.filter(v => v.index !== index));
  };

  const updateVariationSizes = (index: number, sizes: string) => {
    setSelectedVariations(prev => prev.map(v => v.index === index ? { ...v, sizes } : v));
  };

  const addOperation = () => {
    setOperations(prev => [...prev, {
      operation: '',
      rate_per_piece: 0,
      quantity: totalPieces,
      notes: '',
    }]);
  };

  const removeOperation = (idx: number) => {
    setOperations(prev => prev.filter((_, i) => i !== idx));
  };

  const updateOperation = (idx: number, field: keyof OperationRow, value: any) => {
    setOperations(prev => prev.map((op, i) => i === idx ? { ...op, [field]: value } : op));
  };

  const totalAmount = operations.reduce((sum, op) => sum + (op.rate_per_piece * op.quantity), 0);
  const profitPercent = parseFloat(companyProfitPercent) || 0;
  const profitPerPiece = totalPieces > 0 ? (totalAmount / totalPieces) * (profitPercent / 100) : 0;
  const profitAmount = profitPerPiece * totalPieces;

  const handleSubmit = async () => {
    if (selectedVariations.length === 0 || !companyId) return;
    if (operations.some(op => !op.operation)) return;

    const comp = allCompanies.find(c => c.id === companyId);
    const finalCompanyName = comp?.name || '';
    const finalCompanyId = comp?.source === 'external' ? comp.id : null;

    const firstVariation = selectedVariations[0];

    await createMutation.mutateAsync({
      jobWork: {
        batch_id: batchId,
        style_id: firstVariation.styleId,
        type_index: firstVariation.index,
        color: firstVariation.color,
        pieces: totalPieces,
        company_id: finalCompanyId,
        company_name: finalCompanyName,
        notes: notes || null,
        paid_amount: parseFloat(paidAmount) || 0,
        payment_status: 'pending',
        work_status: 'pending',
        company_profit: profitPerPiece,
        variations: selectedVariations.map(v => ({
          type_index: v.index,
          style_id: v.styleId,
          color: v.color,
          pieces: v.pieces,
          sizes: v.sizes,
        })),
      },
      operations: operations.map(op => ({
        operation: op.operation,
        rate_per_piece: op.rate_per_piece,
        quantity: op.quantity,
        notes: op.notes || undefined,
      })),
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedVariations([]);
    setCompanyId('');
    setNotes('');
    setPaidAmount('0');
    setCompanyProfitPercent('0');
    setOperations([{ operation: '', rate_per_piece: 0, quantity: 0, notes: '' }]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Job Work</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Style & Color/Variation Selection - Multiple */}
            <div>
              <Label className="text-base font-semibold">Style & Color/Variation *</Label>
              {selectedVariations.length > 0 && (
                <div className="space-y-2 mt-2 mb-2">
                  {selectedVariations.map(v => (
                    <div key={v.index} className="border rounded-md px-3 py-2 bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{v.label}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeVariation(v.index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Enter sizes (e.g., S, M, L, XL)"
                        value={v.sizes}
                        onChange={e => updateVariationSizes(v.index, e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                  <p className="text-sm font-medium text-primary">
                    Total Pieces: {totalPieces}
                  </p>
                </div>
              )}
              {availableOptions.length > 0 && (
                <Select value="" onValueChange={addVariation}>
                  <SelectTrigger><SelectValue placeholder="+ Add style & color variation" /></SelectTrigger>
                  <SelectContent>
                    {availableOptions.map(opt => (
                      <SelectItem key={opt.index} value={opt.index.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Company Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Company *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setShowAddWorker(true)}
                >
                  + New Company
                </Button>
              </div>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {allCompanies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Operations</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOperation}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Operation
                </Button>
              </div>
              <div className="space-y-3">
                {operations.map((op, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <Label className="text-xs">Operation *</Label>
                        <Select value={op.operation} onValueChange={v => updateOperation(idx, 'operation', v)}>
                          <SelectTrigger><SelectValue placeholder="Select operation" /></SelectTrigger>
                          <SelectContent>
                            {JOB_WORK_OPERATIONS.map(o => (
                              <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Rate/Pc (₹)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={op.rate_per_piece}
                          onChange={e => updateOperation(idx, 'rate_per_piece', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          value={op.quantity}
                          onChange={e => updateOperation(idx, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">Notes</Label>
                        <Input
                          placeholder="Optional notes"
                          value={op.notes}
                          onChange={e => updateOperation(idx, 'notes', e.target.value)}
                        />
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap pr-2">
                        = ₹{(op.rate_per_piece * op.quantity).toFixed(2)}
                      </div>
                      {operations.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeOperation(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Profit as Percentage */}
            <div>
              <Label>Company Profit (%)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  step="0.5"
                  className="max-w-[200px]"
                  value={companyProfitPercent}
                  onChange={e => setCompanyProfitPercent(e.target.value)}
                />
                {totalPieces > 0 && totalAmount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ₹{profitPerPiece.toFixed(2)}/pc · Total: ₹{profitAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Operations Total</span>
                <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Company Profit ({profitPercent}%)</span>
                <span className="font-semibold">₹{profitAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-1">
                <span className="font-medium">Grand Total</span>
                <span className="text-lg font-bold">₹{(totalAmount + profitAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Any remarks about this job work..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedVariations.length === 0 || !companyId || operations.some(op => !op.operation) || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Job Work'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddWorkerDialog open={showAddWorker} onOpenChange={setShowAddWorker} />
    </>
  );
};
