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

interface OperationSummary {
  categoriesTotal: number;
  commissionPercent: number;
  commissionAmount: number;
  calculatedTotal: number;
  roundOff: number | null | undefined;
  adjustment: number;
  finalTotal: number;
}

const calculateOperationSummary = (op: Operation): OperationSummary => {
  const categoriesTotal = op.categories?.reduce((sum, cat) => sum + (cat.rate || 0), 0) || 0;
  const commissionPercent = op.commission_percent || 0;
  const commissionAmount = (categoriesTotal * commissionPercent) / 100;
  const calculatedTotal = categoriesTotal + commissionAmount;
  const roundOff = op.round_off;
  const adjustment = (roundOff !== null && roundOff !== undefined) 
    ? roundOff - calculatedTotal 
    : 0;
  const finalTotal = roundOff ?? calculatedTotal;
  
  return {
    categoriesTotal,
    commissionPercent,
    commissionAmount,
    calculatedTotal,
    roundOff,
    adjustment,
    finalTotal
  };
};

const RateCardDetailsDialog = ({ rateCard, open, onClose }: RateCardDetailsDialogProps) => {
  if (!rateCard) return null;

  const operations = (rateCard.operations_data as unknown as Operation[]) || [];
  
  // Group operations by department
  const singerOps = operations.filter(op => op.operation_name === 'Stitching (Singer)');
  const overlockOps = operations.filter(op => op.operation_name === 'Stitching (Power Table) - Overlock');
  const flatlockOps = operations.filter(op => op.operation_name === 'Stitching (Power Table) - Flatlock');
  const otherOps = operations.filter(op => 
    op.operation_name !== 'Stitching (Singer)' && 
    !op.operation_name.includes('Power Table')
  );

  // Calculate totals for each group
  const singerTotal = singerOps.reduce((sum, op) => sum + calculateOperationSummary(op).finalTotal, 0);
  const overlockTotal = overlockOps.reduce((sum, op) => sum + calculateOperationSummary(op).finalTotal, 0);
  const flatlockTotal = flatlockOps.reduce((sum, op) => sum + calculateOperationSummary(op).finalTotal, 0);
  const powerTableTotal = overlockTotal + flatlockTotal;
  const otherTotal = otherOps.reduce((sum, op) => sum + calculateOperationSummary(op).finalTotal, 0);
  
  const totalOperationsCost = singerTotal + powerTableTotal + otherTotal;

  const companyProfit = rateCard.rate_per_piece - totalOperationsCost;
  const profitPercent = rateCard.rate_per_piece > 0 
    ? ((companyProfit / rateCard.rate_per_piece) * 100).toFixed(1) 
    : "0";

  const renderOperationDetails = (op: Operation, summary: OperationSummary) => (
    <div className="space-y-2">
      {/* Categories breakdown */}
      {op.categories && op.categories.length > 0 && (
        <div className="space-y-1">
          {op.categories.map((cat, catIdx) => {
            const displayName = cat.customName || cat.name || cat.job_name || 'Unknown Category';
            return (
              <div key={catIdx} className="flex justify-between text-sm text-muted-foreground pl-4">
                <span>{displayName}</span>
                <span>₹{cat.rate.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Calculation breakdown */}
      <div className="pl-4 pt-2 border-t border-dashed space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Categories Subtotal</span>
          <span>₹{summary.categoriesTotal.toFixed(2)}</span>
        </div>
        {summary.commissionPercent > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Commission ({summary.commissionPercent}%)</span>
            <span className="text-orange-600">+ ₹{summary.commissionAmount.toFixed(2)}</span>
          </div>
        )}
        {summary.roundOff !== null && summary.roundOff !== undefined && (
          <div className="flex justify-between text-muted-foreground">
            <span>Round Off Adjustment</span>
            <span className={summary.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
              {summary.adjustment >= 0 ? '+' : ''}₹{summary.adjustment.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          {/* Detailed Department-wise Operations Breakdown */}
          <div>
            <h3 className="font-semibold mb-4">Operations Breakdown (Department-wise)</h3>
            
            <div className="space-y-4">
              {/* SINGER Section */}
              {singerOps.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2 flex justify-between items-center">
                    <span className="font-semibold text-blue-700 dark:text-blue-400">Stitching (Singer)</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">₹{singerTotal.toFixed(2)}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {singerOps.map((op, idx) => {
                      const summary = calculateOperationSummary(op);
                      return (
                        <div key={idx}>
                          {singerOps.length > 1 && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">{op.operation_name}</span>
                              <Badge variant="outline">₹{summary.finalTotal.toFixed(2)}</Badge>
                            </div>
                          )}
                          {renderOperationDetails(op, summary)}
                          <div className="flex justify-between font-medium pt-2 border-t mt-2 text-blue-700 dark:text-blue-400">
                            <span>Singer Total</span>
                            <span>₹{summary.finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* POWER TABLE Section */}
              {(overlockOps.length > 0 || flatlockOps.length > 0) && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-green-50 dark:bg-green-950/30 px-4 py-2 flex justify-between items-center">
                    <span className="font-semibold text-green-700 dark:text-green-400">Stitching (Power Table)</span>
                    <span className="font-bold text-green-700 dark:text-green-400">₹{powerTableTotal.toFixed(2)}</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Overlock Sub-section */}
                    {overlockOps.length > 0 && (
                      <div className="border-l-4 border-emerald-400 pl-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">Overlock</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹{overlockTotal.toFixed(2)}</span>
                        </div>
                        {overlockOps.map((op, idx) => {
                          const summary = calculateOperationSummary(op);
                          return (
                            <div key={idx} className="mb-3">
                              {renderOperationDetails(op, summary)}
                              <div className="flex justify-between text-sm font-medium pt-2 border-t mt-2 text-emerald-600 dark:text-emerald-400 pl-4">
                                <span>Overlock Subtotal</span>
                                <span>₹{summary.finalTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Flatlock Sub-section */}
                    {flatlockOps.length > 0 && (
                      <div className="border-l-4 border-teal-400 pl-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-teal-700 dark:text-teal-400">Flatlock</span>
                          <span className="font-semibold text-teal-700 dark:text-teal-400">₹{flatlockTotal.toFixed(2)}</span>
                        </div>
                        {flatlockOps.map((op, idx) => {
                          const summary = calculateOperationSummary(op);
                          return (
                            <div key={idx} className="mb-3">
                              {renderOperationDetails(op, summary)}
                              <div className="flex justify-between text-sm font-medium pt-2 border-t mt-2 text-teal-600 dark:text-teal-400 pl-4">
                                <span>Flatlock Subtotal</span>
                                <span>₹{summary.finalTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Power Table Total */}
                    <div className="flex justify-between font-semibold pt-3 border-t-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400">
                      <span>Power Table Total (Overlock + Flatlock)</span>
                      <span>₹{powerTableTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Operations */}
              {otherOps.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-purple-50 dark:bg-purple-950/30 px-4 py-2 flex justify-between items-center">
                    <span className="font-semibold text-purple-700 dark:text-purple-400">Other Operations</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400">₹{otherTotal.toFixed(2)}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {otherOps.map((op, idx) => {
                      const summary = calculateOperationSummary(op);
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{op.operation_name}</span>
                            <Badge variant="outline">₹{summary.finalTotal.toFixed(2)}</Badge>
                          </div>
                          {renderOperationDetails(op, summary)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Department Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Cost Summary</h4>
            <div className="space-y-2 text-sm">
              {singerTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-400">Singer</span>
                  <span className="font-medium">₹{singerTotal.toFixed(2)}</span>
                </div>
              )}
              {powerTableTotal > 0 && (
                <>
                  <div className="flex justify-between pl-4 text-muted-foreground">
                    <span>↳ Overlock</span>
                    <span>₹{overlockTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pl-4 text-muted-foreground">
                    <span>↳ Flatlock</span>
                    <span>₹{flatlockTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700 dark:text-green-400">
                    <span>Power Table Total</span>
                    <span className="font-medium">₹{powerTableTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
              {otherTotal > 0 && (
                <div className="flex justify-between text-purple-700 dark:text-purple-400">
                  <span>Other Operations</span>
                  <span className="font-medium">₹{otherTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t text-base">
                <span>Total Operations Cost</span>
                <span>₹{totalOperationsCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Profit Summary */}
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Company Profit</p>
                <p className="text-sm text-muted-foreground">
                  Rate (₹{rateCard.rate_per_piece.toFixed(2)}) - Operations (₹{totalOperationsCost.toFixed(2)})
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{companyProfit.toFixed(2)}</p>
                <Badge variant={companyProfit > 0 ? "default" : "destructive"}>
                  {profitPercent}% Margin
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
