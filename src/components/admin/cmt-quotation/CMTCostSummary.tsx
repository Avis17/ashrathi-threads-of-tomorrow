import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CMTCostSummaryProps {
  totalStitchingCost: number;
  finishingPackingCost: number;
  overheadsCost: number;
  companyProfitPercent: number;
  orderQuantity: number;
  onFinishingPackingChange: (value: number) => void;
  onOverheadsChange: (value: number) => void;
  onCompanyProfitChange: (value: number) => void;
}

export function CMTCostSummary({
  totalStitchingCost,
  finishingPackingCost,
  overheadsCost,
  companyProfitPercent,
  orderQuantity,
  onFinishingPackingChange,
  onOverheadsChange,
  onCompanyProfitChange,
}: CMTCostSummaryProps) {
  const baseCMT = totalStitchingCost + finishingPackingCost + overheadsCost;
  const profitAmount = baseCMT * (companyProfitPercent / 100);
  const finalCMTPerPiece = baseCMT + profitAmount;
  const totalOrderValue = finalCMTPerPiece * orderQuantity;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Cost Summary</h3>
      
      <div className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
        <div className="grid grid-cols-2 gap-4">
          {/* Read-only calculated fields */}
          <div className="space-y-1">
            <Label className="text-muted-foreground text-sm">Total Operations Cost (from operations)</Label>
            <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-medium">
              ₹{totalStitchingCost.toFixed(2)}
            </div>
          </div>
          
          {/* Editable fields */}
          <div className="space-y-1">
            <Label htmlFor="finishingPacking" className="text-sm">Finishing & Packing</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="finishingPacking"
                type="number"
                step="0.01"
                value={finishingPackingCost || ''}
                onChange={(e) => onFinishingPackingChange(parseFloat(e.target.value) || 0)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="overheads" className="text-sm">Overheads</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="overheads"
                type="number"
                step="0.01"
                value={overheadsCost || ''}
                onChange={(e) => onOverheadsChange(parseFloat(e.target.value) || 0)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="companyProfit" className="text-sm">Company Profit %</Label>
            <div className="relative">
              <Input
                id="companyProfit"
                type="number"
                step="1"
                min="0"
                max="100"
                value={companyProfitPercent || ''}
                onChange={(e) => onCompanyProfitChange(parseFloat(e.target.value) || 0)}
                className="pr-8"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">Rent, electricity, maintenance, transport, etc.</p>
          </div>
          
          <div className="space-y-1">
            <Label className="text-muted-foreground text-sm">Order Quantity</Label>
            <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-medium">
              {orderQuantity > 0 ? `${orderQuantity.toLocaleString()} pcs` : '-'}
            </div>
          </div>
        </div>
        
        {/* Highlighted Final Value */}
        <div className="mt-6 pt-4 border-t border-primary/20">
          <div className="flex justify-center">
            <div className="bg-primary text-primary-foreground rounded-lg p-6 text-center min-w-[200px]">
              <p className="text-sm opacity-90">Final CMT / Piece</p>
              <p className="text-3xl font-bold mt-1">₹{finalCMTPerPiece.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
