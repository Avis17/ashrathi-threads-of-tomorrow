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
  category: string;
  rate: number;
}

interface Operation {
  operation: string;
  categories: OperationCategory[];
  commission?: number;
  roundOff?: number;
  adjustment?: number;
  total?: number;
}

const RateCardDetailsDialog = ({ rateCard, open, onClose }: RateCardDetailsDialogProps) => {
  if (!rateCard) return null;

  const operations = (rateCard.operations_data as unknown as Operation[]) || [];
  
  const totalOperationsCost = operations.reduce((sum, op) => {
    const opTotal = op.categories?.reduce((catSum, cat) => catSum + (cat.rate || 0), 0) || 0;
    return sum + opTotal + (op.adjustment || 0);
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
                const opTotal = op.categories?.reduce((sum, cat) => sum + (cat.rate || 0), 0) || 0;
                return (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{op.operation}</span>
                      <div className="flex items-center gap-2">
                        {op.commission && op.commission > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {op.commission}% commission
                          </Badge>
                        )}
                        <span className="font-semibold">₹{opTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    {op.categories && op.categories.length > 0 && (
                      <div className="pl-4 space-y-1">
                        {op.categories.map((cat, catIdx) => (
                          <div key={catIdx} className="flex justify-between text-sm text-muted-foreground">
                            <span>{cat.category}</span>
                            <span>₹{cat.rate.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {op.roundOff && op.roundOff !== opTotal && (
                      <div className="flex justify-between text-sm mt-1 pt-1 border-t">
                        <span className="text-muted-foreground">Round Off</span>
                        <span className="text-muted-foreground">
                          ₹{op.roundOff.toFixed(2)} ({op.adjustment && op.adjustment > 0 ? '+' : ''}{op.adjustment?.toFixed(2) || 0})
                        </span>
                      </div>
                    )}
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
