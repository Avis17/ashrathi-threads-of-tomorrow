import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export interface CostingData {
  pieceWeightGrams: number;
  wastagePercent: number;
  fabricRatePerKg: number;
  additionalOpsAmount: number;
}

interface CostingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CostingData | null;
  cmtRate: number;
  onSave: (data: CostingData) => void;
}

export function calculateTotalRate(costing: CostingData, cmtRate: number) {
  const effectiveWeightGrams = costing.pieceWeightGrams * (1 + costing.wastagePercent / 100);
  const effectiveWeightKg = effectiveWeightGrams / 1000;
  const fabricCost = effectiveWeightKg * costing.fabricRatePerKg;
  const total = fabricCost + cmtRate + costing.additionalOpsAmount;
  return { effectiveWeightGrams, fabricCost, total };
}

export default function CostingDialog({ open, onOpenChange, initialData, cmtRate, onSave }: CostingDialogProps) {
  const [data, setData] = useState<CostingData>({
    pieceWeightGrams: 0,
    wastagePercent: 0,
    fabricRatePerKg: 0,
    additionalOpsAmount: 0,
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData, open]);

  const calc = calculateTotalRate(data, cmtRate);

  const handleSave = () => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Piece Costing Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Piece Weight (grams)</Label>
              <Input
                type="number"
                value={data.pieceWeightGrams || ''}
                onChange={(e) => setData(d => ({ ...d, pieceWeightGrams: Number(e.target.value) }))}
                placeholder="e.g. 400"
              />
            </div>
            <div>
              <Label>Wastage %</Label>
              <Input
                type="number"
                value={data.wastagePercent || ''}
                onChange={(e) => setData(d => ({ ...d, wastagePercent: Number(e.target.value) }))}
                placeholder="e.g. 25"
              />
            </div>
            <div>
              <Label>Fabric Rate (₹/kg)</Label>
              <Input
                type="number"
                value={data.fabricRatePerKg || ''}
                onChange={(e) => setData(d => ({ ...d, fabricRatePerKg: Number(e.target.value) }))}
                placeholder="e.g. 300"
              />
            </div>
            <div>
              <Label>Additional Ops (₹)</Label>
              <Input
                type="number"
                value={data.additionalOpsAmount || ''}
                onChange={(e) => setData(d => ({ ...d, additionalOpsAmount: Number(e.target.value) }))}
                placeholder="e.g. 20"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Effective Weight</span>
              <span>{calc.effectiveWeightGrams.toFixed(0)}g ({(calc.effectiveWeightGrams / 1000).toFixed(3)} kg)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fabric Cost</span>
              <span>₹{calc.fabricCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CMT Rate</span>
              <span>₹{cmtRate.toFixed(2)}</span>
            </div>
            {data.additionalOpsAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Additional Ops</span>
                <span>₹{data.additionalOpsAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total Rate / Piece</span>
              <span className="text-primary">₹{calc.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Costing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
