import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Package } from 'lucide-react';
import { useJobWorkers } from '@/hooks/useDeliveryChallans';

interface ItemRow {
  product_name: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  uom: 'pcs' | 'kg';
  remarks: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batchId: string;
  batchNumber: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
  styleLookup: Record<string, string>;
  companyName?: string;
}

export const CreateDCFromBatchDialog = ({
  open,
  onOpenChange,
  batchId,
  batchNumber,
  rollsData,
  cuttingSummary,
  styleLookup,
  companyName,
}: Props) => {
  const navigate = useNavigate();
  const { data: jobWorkers = [] } = useJobWorkers(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleType = (idx: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectAll = () => setSelectedIndices(new Set(rollsData.map((_, i) => i)));
  const clearAll = () => setSelectedIndices(new Set());

  const handleCreateDC = () => {
    if (selectedIndices.size === 0) return;

    // Build items from selected types
    const items: ItemRow[] = [];
    selectedIndices.forEach(idx => {
      const type = rollsData[idx];
      if (!type) return;
      const styleName = styleLookup[type.style_id] || type.style_name || `Style ${idx + 1}`;
      const qty = cuttingSummary[idx] || 0;
      items.push({
        product_name: styleName,
        sku: type.style_code || '',
        size: '',
        color: type.color || '',
        quantity: qty,
        uom: 'pcs',
        remarks: `Type ${idx + 1} | ${type.fabric_type || ''} ${type.gsm ? `${type.gsm} GSM` : ''}`.trim(),
      });
    });

    // Match company by GSTIN first, then name
    let workerName = companyName || '';
    let workerAddress = '';
    let workerGstin = '';

    const matchedWorker =
      jobWorkers.find(w => w.gstin && companyName && (
        // Try GSTIN match by looking through all workers for the company name match
        w.name === companyName
      )) ||
      jobWorkers.find(w => w.name === companyName);

    if (matchedWorker) {
      workerName = matchedWorker.name;
      workerAddress = matchedWorker.address || '';
      workerGstin = matchedWorker.gstin || '';
    }

    const prefill = {
      dc_type: 'job_work',
      job_work_direction: 'given',
      job_worker_name: workerName,
      job_worker_address: workerAddress,
      job_worker_gstin: workerGstin,
      purposes: ['stitching'],
      notes: `Batch: ${batchNumber}`,
      items,
    };

    const prefillStr = encodeURIComponent(JSON.stringify(prefill));
    navigate(`/admin/delivery-challan/create?prefill=${prefillStr}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create Delivery Challan
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select the types/styles to include in the DC. Company details will be pre-filled from the batch.
          </p>
        </DialogHeader>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {/* Company info preview */}
          {companyName && (
            <div className="p-3 rounded-lg bg-muted/40 text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground">Company: </span>
                <span className="font-medium">{companyName}</span>
                {(() => {
                  const w = jobWorkers.find(w => w.name === companyName);
                  if (w?.gstin) return <span className="text-xs text-muted-foreground ml-2">(GSTIN: {w.gstin})</span>;
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* Select all / clear */}
          <div className="flex items-center gap-3 text-xs">
            <button onClick={selectAll} className="text-primary underline">Select All</button>
            <button onClick={clearAll} className="text-muted-foreground underline">Clear</button>
            <span className="ml-auto text-muted-foreground">{selectedIndices.size} selected</span>
          </div>

          {/* Type rows */}
          {rollsData.map((type, idx) => {
            const styleName = styleLookup[type.style_id] || type.style_name || `Style ${idx + 1}`;
            const qty = cuttingSummary[idx] || 0;
            const isChecked = selectedIndices.has(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleType(idx)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isChecked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleType(idx)}
                  onClick={e => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{styleName}</div>
                  <div className="text-xs text-muted-foreground">
                    {type.color && <span>Color: {type.color} · </span>}
                    {type.fabric_type && <span>{type.fabric_type} </span>}
                    {type.gsm && <span>· {type.gsm} GSM</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={qty > 0 ? 'default' : 'outline'} className="text-xs">
                    {qty} pcs
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateDC}
            disabled={selectedIndices.size === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create DC ({selectedIndices.size} type{selectedIndices.size !== 1 ? 's' : ''})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
