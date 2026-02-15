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

interface Props {
  batchId: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OperationRow {
  operation: string;
  rate_per_piece: number;
  quantity: number;
  notes: string;
}

export const JobWorkCreateForm = ({ batchId, rollsData, cuttingSummary, open, onOpenChange }: Props) => {
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [notes, setNotes] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [operations, setOperations] = useState<OperationRow[]>([
    { operation: '', rate_per_piece: 0, quantity: 0, notes: '' },
  ]);

  const createMutation = useCreateJobWork();

  // Fetch companies
  const { data: companies = [] } = useQuery({
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

  const selectedType = typeOptions.find(t => t.index.toString() === selectedTypeIndex);

  // Auto-fill quantity when type changes
  useEffect(() => {
    if (selectedType) {
      setOperations(prev => prev.map(op => ({
        ...op,
        quantity: op.quantity === 0 ? selectedType.pieces : op.quantity,
      })));
    }
  }, [selectedTypeIndex]);

  const addOperation = () => {
    setOperations(prev => [...prev, {
      operation: '',
      rate_per_piece: 0,
      quantity: selectedType?.pieces || 0,
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

  const handleSubmit = async () => {
    if (!selectedType || (!companyId && !newCompanyName)) return;
    if (operations.some(op => !op.operation)) return;

    let finalCompanyId: string | null = companyId || null;
    let finalCompanyName = '';

    if (isNewCompany && newCompanyName) {
      // Create new company
      const { data: newComp, error } = await supabase
        .from('external_job_companies')
        .insert([{
          company_name: newCompanyName,
          address: '',
          contact_number: '',
          contact_person: '',
        }])
        .select()
        .single();
      if (error) {
        return;
      }
      finalCompanyId = newComp.id;
      finalCompanyName = newCompanyName;
    } else {
      const comp = companies.find(c => c.id === companyId);
      finalCompanyName = comp?.company_name || '';
    }

    await createMutation.mutateAsync({
      jobWork: {
        batch_id: batchId,
        style_id: selectedType.styleId,
        type_index: selectedType.index,
        color: selectedType.color,
        pieces: selectedType.pieces,
        company_id: finalCompanyId,
        company_name: finalCompanyName,
        notes: notes || null,
        paid_amount: parseFloat(paidAmount) || 0,
        payment_status: 'pending',
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
    setSelectedTypeIndex('');
    setCompanyId('');
    setNewCompanyName('');
    setIsNewCompany(false);
    setNotes('');
    setPaidAmount('0');
    setOperations([{ operation: '', rate_per_piece: 0, quantity: 0, notes: '' }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Work</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Style & Color Selection */}
          <div>
            <Label>Style & Color/Variation *</Label>
            <Select value={selectedTypeIndex} onValueChange={setSelectedTypeIndex}>
              <SelectTrigger><SelectValue placeholder="Select style & color" /></SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.index} value={opt.index.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-sm text-muted-foreground mt-1">
                Auto-fetched: {selectedType.pieces} pieces cut
              </p>
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
                onClick={() => setIsNewCompany(!isNewCompany)}
              >
                {isNewCompany ? 'Select Existing' : '+ New Company'}
              </Button>
            </div>
            {isNewCompany ? (
              <Input
                placeholder="Enter new company name"
                value={newCompanyName}
                onChange={e => setNewCompanyName(e.target.value)}
              />
            ) : (
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
                      <Input
                        placeholder="e.g., Stitching, Embroidery"
                        value={op.operation}
                        onChange={e => updateOperation(idx, 'operation', e.target.value)}
                      />
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

          {/* Total */}
          <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
            <span className="font-medium">Total Amount</span>
            <span className="text-lg font-bold">₹{totalAmount.toFixed(2)}</span>
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
            disabled={!selectedType || (!companyId && !newCompanyName) || operations.some(op => !op.operation) || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Job Work'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
