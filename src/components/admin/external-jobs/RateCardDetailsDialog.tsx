import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalJobRateCard } from "@/hooks/useExternalJobRateCards";

interface RateCardDetailsDialogProps {
  rateCard: ExternalJobRateCard | null;
  open: boolean;
  onClose: () => void;
}

interface OperationCategory {
  name: string;
  rate: number;
  customName?: string;
  job_name?: string;
}

interface Operation {
  operation_name: string;
  categories: OperationCategory[];
  commission_percent?: number;
  round_off?: number | null;
  adjustment?: number;
  total_rate?: number;
}

const RateCardDetailsDialog = ({ rateCard, open, onClose }: RateCardDetailsDialogProps) => {
  if (!rateCard) return null;

  const operations = (rateCard.operations_data as unknown as Operation[]) || [];
  
  const totalOperationsCost = operations.reduce((sum, op) => {
    const categoriesTotal = op.categories?.reduce((catSum, cat) => catSum + (cat.rate || 0), 0) || 0;
    const commissionPercent = op.commission_percent || 0;
    const commissionAmount = (categoriesTotal * commissionPercent) / 100;
    const calculatedTotal = categoriesTotal + commissionAmount;
    const roundOff = op.round_off;
    const finalTotal = (roundOff !== null && roundOff !== undefined) ? roundOff : calculatedTotal;
    return sum + finalTotal;
  }, 0);

  const companyProfit = rateCard.rate_per_piece - totalOperationsCost;
  const profitPercent = rateCard.rate_per_piece > 0 
    ? ((companyProfit / rateCard.rate_per_piece) * 100).toFixed(1) 
    : "0";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Rate Card Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Style ID</p>
              <p className="font-mono font-medium">{rateCard.style_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <Badge variant="outline">{rateCard.category}</Badge>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Style Name</p>
              <p className="font-semibold text-lg">{rateCard.style_name}</p>
            </div>
            {rateCard.notes && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Description / Notes</p>
                <p className="text-sm">{rateCard.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Rate Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Rate per Piece</p>
              <p className="text-xl font-bold text-primary">₹{rateCard.rate_per_piece.toFixed(2)}</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Accessories</p>
              <p className="text-lg font-semibold">₹{rateCard.accessories_cost.toFixed(2)}</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="text-lg font-semibold">₹{rateCard.delivery_charge.toFixed(2)}</p>
            </div>
          </div>

          <Separator />

          {/* Operations Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Operations Breakdown</h3>
            <div className="space-y-3">
              {operations.map((op, idx) => {
                const categoriesTotal = op.categories?.reduce((sum, cat) => sum + (cat.rate || 0), 0) || 0;
                const commissionPercent = op.commission_percent || 0;
                const commissionAmount = (categoriesTotal * commissionPercent) / 100;
                const calculatedTotal = categoriesTotal + commissionAmount;
                const roundOff = op.round_off;
                const adjustment = (roundOff !== null && roundOff !== undefined) 
                  ? roundOff - calculatedTotal 
                  : 0;
                const finalTotal = roundOff ?? calculatedTotal;
                
                return (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{op.operation_name}</span>
                      <div className="flex items-center gap-2">
                        {commissionPercent > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {commissionPercent}% commission
                          </Badge>
                        )}
                        <span className="font-semibold">₹{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Categories breakdown */}
                    {op.categories && op.categories.length > 0 && (
                      <div className="pl-4 space-y-1 mb-2">
                        {op.categories.map((cat, catIdx) => {
                          // Use customName if available, otherwise use name or job_name
                          const displayName = cat.customName || cat.name || cat.job_name || 'Unknown Category';
                          return (
                            <div key={catIdx} className="flex justify-between text-sm text-muted-foreground">
                              <span>{displayName}</span>
                              <span>₹{cat.rate.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Subtotals */}
                    <div className="pl-4 pt-2 border-t space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Categories Subtotal</span>
                        <span>₹{categoriesTotal.toFixed(2)}</span>
                      </div>
                      {commissionPercent > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Commission ({commissionPercent}%)</span>
                          <span>+ ₹{commissionAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {roundOff !== null && roundOff !== undefined && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Round Off Adjustment</span>
                          <span>{adjustment >= 0 ? '+' : ''}₹{adjustment.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium pt-1 border-t">
                        <span>Operation Total</span>
                        <span>₹{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Profit Summary */}
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Company Profit</p>
                <p className="text-xs text-muted-foreground">
                  Rate (₹{rateCard.rate_per_piece.toFixed(2)}) - Operations (₹{totalOperationsCost.toFixed(2)})
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">₹{companyProfit.toFixed(2)}</p>
                <Badge variant={companyProfit > 0 ? "default" : "destructive"}>
                  {profitPercent}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-end">
            <Badge variant={rateCard.is_active ? "default" : "secondary"} className="text-sm">
              {rateCard.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RateCardDetailsDialog;
