import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Package, Palette } from 'lucide-react';
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

interface StyleGroup {
  styleId: string;
  styleName: string;
  styleCode: string;
  sizes: string;
  types: Array<{
    typeIndex: number;
    color: string;
    fabricType: string;
    gsm: string;
    quantity: number;
  }>;
  totalQuantity: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batchId: string;
  batchNumber: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
  confirmedMap: Record<number, number>;
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
  confirmedMap,
  styleLookup,
  companyName,
}: Props) => {
  const navigate = useNavigate();
  const { data: jobWorkers = [] } = useJobWorkers(false);
  const [selectedStyleIds, setSelectedStyleIds] = useState<Set<string>>(new Set());

  // Group rollsData by style_id
  const styleGroups = useMemo<StyleGroup[]>(() => {
    const groupMap: Record<string, StyleGroup> = {};
    rollsData.forEach((type, idx) => {
      const styleId = type.style_id || `__unknown_${idx}`;
      const styleName = styleLookup[styleId] || type.style_name || `Style ${idx + 1}`;
      const styleCode = type.style_code || '';
      if (!groupMap[styleId]) {
        groupMap[styleId] = { styleId, styleName, styleCode, sizes: type.sizes || '', types: [], totalQuantity: 0 };
      }
      // Use confirmed pieces; fall back to cut pieces if not yet confirmed
      const qty = confirmedMap[idx] ?? cuttingSummary[idx] ?? 0;
      groupMap[styleId].types.push({
        typeIndex: idx,
        color: type.color || '',
        fabricType: type.fabric_type || type.fabricType || '',
        gsm: type.gsm || '',
        quantity: qty,
      });
      groupMap[styleId].totalQuantity += qty;
    });
    return Object.values(groupMap);
  }, [rollsData, cuttingSummary, confirmedMap, styleLookup]);

  const toggleStyle = (styleId: string) => {
    setSelectedStyleIds(prev => {
      const next = new Set(prev);
      if (next.has(styleId)) next.delete(styleId);
      else next.add(styleId);
      return next;
    });
  };

  const selectAll = () => setSelectedStyleIds(new Set(styleGroups.map(g => g.styleId)));
  const clearAll = () => setSelectedStyleIds(new Set());

  // Count total DC line items (colors) that will be created
  const totalItems = styleGroups
    .filter(g => selectedStyleIds.has(g.styleId))
    .reduce((sum, g) => sum + g.types.length, 0);

  const handleCreateDC = () => {
    if (selectedStyleIds.size === 0) return;

    // Build one DC item per color variant of each selected style
    const items: ItemRow[] = [];
    styleGroups
      .filter(g => selectedStyleIds.has(g.styleId))
      .forEach(group => {
        group.types.forEach(t => {
          items.push({
            product_name: group.styleName,
            sku: group.styleCode,
            size: group.sizes,
            color: t.color,
            quantity: t.quantity,
            uom: 'pcs',
            remarks: [t.fabricType, t.gsm ? `${t.gsm} GSM` : ''].filter(Boolean).join(' · '),
          });
        });
      });

    // Match company worker by name (gets GSTIN from job_workers table)
    const matchedWorker = jobWorkers.find(w => w.name === companyName);
    const workerName = matchedWorker?.name || companyName || '';
    const workerAddress = matchedWorker?.address || '';
    const workerGstin = matchedWorker?.gstin || '';

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
            Select styles to include. All color variants under each style will be added automatically.
          </p>
        </DialogHeader>

        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {/* Company info preview */}
          {companyName && (
            <div className="p-3 rounded-lg bg-muted/40 text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground">Company: </span>
                <span className="font-medium">{companyName}</span>
                {(() => {
                  const w = jobWorkers.find(w => w.name === companyName);
                  if (w?.gstin) return <span className="text-xs text-muted-foreground ml-2">· GSTIN: {w.gstin}</span>;
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* Select all / clear */}
          <div className="flex items-center gap-3 text-xs border-b pb-2">
            <button onClick={selectAll} className="text-primary hover:underline font-medium">Select All</button>
            <button onClick={clearAll} className="text-muted-foreground hover:underline">Clear</button>
            <span className="ml-auto text-muted-foreground">
              {selectedStyleIds.size} style{selectedStyleIds.size !== 1 ? 's' : ''} · {totalItems} DC line{totalItems !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Style cards */}
          {styleGroups.map(group => {
            const isChecked = selectedStyleIds.has(group.styleId);
            return (
              <div
                key={group.styleId}
                onClick={() => toggleStyle(group.styleId)}
                className={`rounded-lg border cursor-pointer transition-colors ${
                  isChecked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/20'
                }`}
              >
                {/* Style header */}
                <div className="flex items-center gap-3 p-3">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleStyle(group.styleId)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{group.styleName}</div>
                    {group.styleCode && (
                      <div className="text-xs text-muted-foreground">{group.styleCode}</div>
                    )}
                    {group.sizes && (
                      <div className="text-xs text-muted-foreground mt-0.5">Sizes: {group.sizes}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs gap-1">
                      <Palette className="h-3 w-3" />
                      {group.types.length} color{group.types.length !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant={group.totalQuantity > 0 ? 'default' : 'secondary'} className="text-xs">
                      {group.totalQuantity} pcs
                    </Badge>
                  </div>
                </div>

                {/* Color breakdown (always visible) */}
                <div className="px-3 pb-3 space-y-1">
                  {group.types.map(t => (
                    <div
                      key={t.typeIndex}
                      className="flex items-center gap-2 text-xs pl-7 text-muted-foreground"
                    >
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />
                      <span className="font-medium text-foreground">{t.color || '—'}</span>
                      {t.fabricType && <span>· {t.fabricType}</span>}
                      {t.gsm && <span>· {t.gsm} GSM</span>}
                      <span className="ml-auto font-medium text-foreground">{t.quantity} pcs</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateDC} disabled={selectedStyleIds.size === 0}>
            <FileText className="h-4 w-4 mr-2" />
            Create DC
            {totalItems > 0 && ` (${totalItems} item${totalItems !== 1 ? 's' : ''})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
